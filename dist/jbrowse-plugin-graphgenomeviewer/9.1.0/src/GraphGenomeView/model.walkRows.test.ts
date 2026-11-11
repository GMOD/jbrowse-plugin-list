import { LIFT_BACKDROP_CSS } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { readConfObject } from '@jbrowse/core/configuration'
import { resolveSubMenu } from '@jbrowse/core/ui'
import { getSnapshot } from '@jbrowse/mobx-state-tree'
import { autorun } from 'mobx'

import { facetKeyRows } from './legendSections'
import { mockReadFile, mockRpcCall, mockSession } from './modelTestMocks'
import { MOCK_LAYOUT, fakeRenderer, rpcRespond } from './modelTestSupport'
import { walkRowGeneKey } from './pane/fitViews'
import { PANEL_REFERENCE_TUBE, PANEL_TUBES } from './tubeMapPanels'
import stateModelFactory from './viewModel'
import {
  SECTION_HEADER_PX,
  sectionIndexOf,
  walkRowTrees,
} from './walkRowGroups'

import type { MenuItem } from './modelTestSupport'
import type { El } from '@jbrowse/bandage-core/el'

vi.mock('@jbrowse/core/util', async () =>
  (await import('./modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('./modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('./modelTestMocks')).ioMock(),
)

function highlightMenu(model: { highlightMenuItems: () => unknown }) {
  return model.highlightMenuItems() as MenuItem[]
}

describe('walk rows', () => {
  const WALKS_GFA = [
    'H\tVN:Z:1.1',
    'S\t1\tACGT',
    'S\t2\tGGCCGGCC',
    'S\t3\tTTTT',
    'L\t1\t+\t2\t+\t0M',
    'L\t2\t+\t3\t+\t0M',
    'L\t1\t+\t3\t+\t0M',
    'W\tGRCh38\t0\tchr1\t0\t8\t>1>3',
    'W\tB\t1\tctg\t0\t16\t>1>2>3',
    'W\tA\t2\tctg\t0\t8\t>1>3',
    'W\tA\t1\tctg\t0\t16\t>1>2>3',
    '',
  ].join('\n')

  test('the walk strip shows under a node layout, and links bars and nodes both ways', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'ordered',
      layers: { walkStrip: true },
      referencePath: 'GRCh38',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.setWidth(800)
    expect(model.walkStripShown).toBe(true)
    // the layout keeps its own drawing: walk rows' bars are not the strip's
    expect(model.walkRowBars).toBeUndefined()
    const bars = model.walkStripRows!
    expect(bars.rows.map(r => r.label).sort()).toEqual(['A#1', 'A#2', 'B#1'])
    const two = model.graph!.nodes.find(n => n.name === '2')!
    // a point on B#1's bar inside node 2 lights it
    model.setStripHover({ row: 'B#1#ctg', offset: 6 })
    expect(model.hoveredNode).toBe(two.id)
    // and node 2 ticks the bars of the walks through it, not A#2's
    const marked = new Set(model.walkStripMarks.map(m => m.row))
    expect([...marked].sort()).toEqual(['A#1#ctg', 'B#1#ctg'])
    model.setStripHover(null)
    expect(model.hoveredNode).toBeNull()
    model.setWalkStrip(false)
    expect(model.walkStripShown).toBe(false)
    expect(model.walkStripRows).toBeUndefined()
  })

  // node 2 is off GRCh38's path and both A#1 and B#1 walk it
  test('the block two rows walk off the reference is lettered on both', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    expect(model.sharedBlocks).toBeUndefined()
    model.setLayer('walkBlocks', true)
    const rows = [model.walkRowBars!.reference, ...model.walkRowBars!.rows]
    const lettered = model.sharedBlocks!.map(b => ({
      label: rows[b.row]!.label,
      start: b.start,
      bp: b.bp,
      block: b.block,
    }))
    expect(lettered.sort((a, b) => a.label.localeCompare(b.label))).toEqual([
      { label: 'A#1', start: 4, bp: 8, block: 0 },
      { label: 'B#1', start: 4, bp: 8, block: 0 },
    ])
  })

  test('the shared order stacks rows that walk the same nodes together', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.setWalkRowSamples(['A', 'B'])
    const before = model.walkRowBars!.rows.map(r => r.label)
    model.setWalkRowOrder('shared')
    const labels = model.walkRowBars!.rows.map(r => r.label)
    expect(labels).not.toEqual(before)
    // A#1 and B#1 share node 2, so B#1 stacks under A#1 rather than after
    // A#2, which walks GRCh38's own route
    expect(labels).toEqual(['A#1', 'B#1', 'A#2'])
    // the sample filter and the order sit side by side in the grammar
    expect(model.walkRowSamples).toEqual(['A', 'B'])
    model.setWalkRowSamples(undefined)
    expect(model.walkRowOrder).toBe('shared')
  })

  test('ribbons join neighbouring walk rows where they walk the same nodes', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    expect(model.walkRowRibbons).toBeUndefined()
    model.setLayer('walkRibbons', true)
    const ribbons = model.walkRowRibbons!
    expect(ribbons.length).toBeGreaterThan(0)
    // every row passes nodes 1 and 3, so each pair of neighbours shares a
    // stretch that starts at both bars' left ends
    const rows = [model.walkRowBars!.reference, ...model.walkRowBars!.rows]
    for (let row = 0; row < rows.length - 1; row++) {
      expect(ribbons.some(r => r.row === row && r.a0 === 0 && r.b0 === 0)).toBe(
        true,
      )
    }
  })

  test('walk rows and tube maps take no strip', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
      layers: { walkStrip: true },
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    expect(model.walkStripShown).toBe(false)
  })

  test('walk rows still on screen draw no nodes until the force layout replacing them lands', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    expect(model.drawsNodes).toBe(false)
    let land = () => {}
    mockRpcCall.mockImplementation(
      () =>
        new Promise(resolve => {
          land = () => {
            resolve({ result: MOCK_LAYOUT, duration: 5 })
          }
        }),
    )
    const relayout = model.switchLayout('force')
    expect(model.drawsNodes).toBe(false)
    land()
    await relayout
    expect(model.drawsNodes).toBe(true)
  })

  test('a cohort of walks packs into the pane, its names and readouts on hover', async () => {
    rpcRespond()
    const cohort = [
      ...WALKS_GFA.trimEnd().split('\n'),
      ...Array.from(
        { length: 200 },
        (_, i) => `W\tS${i}\t1\tctg\t0\t16\t>1>2>3`,
      ),
      '',
    ].join('\n')
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
    })
    await model.loadGFA(cohort, 'cohort')
    model.setWidth(800)
    const rows = model.walkRowBars!.rows.length + 1
    const pitch = model.walkRowPitch!
    expect(rows * pitch.rowPx).toBeLessThanOrEqual(model.paneCeiling)
    expect(model.canvasHeight).toBeLessThanOrEqual(model.paneCeiling)
    expect(pitch.labelled).toBe(false)
    expect(model.drawnRowLabels).toEqual([])
    const y = 5 * pitch.rowPx * model.scaleY + model.translateY
    const x = (model.walkRowBars!.origin + 4) * model.scaleX + model.translateX
    const i = model.walkRowAt(x, y)!
    expect(i).toBe(5)
    const row = model.walkRowBars!.rows[i - 1]!
    model.setHoveredWalkRow(row.name)
    expect(model.hoveredWalkRowText).toMatchObject({ label: row.label })
    expect(model.hoveredWalkRowText!.readout).toContain('kb')
    model.setWalkRowSamples(['A'])
    expect(model.walkRowPitch!.labelled).toBe(true)
    expect(model.drawnRowLabels.map(r => r.label)).toEqual([
      'GRCh38#0',
      'A#1',
      'A#2',
    ])
    expect(model.hoveredWalkRowText).toBeUndefined()
  })

  test('the Layout menu lists force-directed once per engine', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'force',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    const layoutItems = () =>
      (
        model.graphMenuItems()[0] as {
          subMenu: (MenuItem & { onClick: () => void })[]
        }
      ).subMenu.filter(item => item.label?.startsWith('Force-directed'))
    expect(layoutItems().map(item => item.label)).toEqual([
      'Force-directed (FMMM)',
      'Force-directed (stress)',
    ])
    expect(layoutItems().map(item => item.checked)).toEqual([true, false])
    layoutItems()[1]!.onClick()
    expect(model.layoutEngine).toBe('stress')
    expect(layoutItems().map(item => item.checked)).toEqual([false, true])
  })

  test("walk rows' Samples menu shows every sample or a chosen few", async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    const samples = () =>
      (
        (model.layoutOptionMenuItems() as MenuItem[]).find(
          item => item.label === 'Samples',
        ) as { subMenu: (MenuItem & { onClick: () => void })[] }
      ).subMenu
    expect(samples().map(item => item.label)).toEqual([
      'Every sample',
      'Choose samples...',
    ])
    expect(samples()[0]!.checked).toBe(true)
    model.setWalkRowSamples(['B'])
    expect(samples()[1]!.checked).toBe(true)
    expect(model.walkRowSampleChoices.samples).toEqual(['A', 'B'])
    samples()[0]!.onClick()
    expect(model.walkRowSamples).toBeUndefined()
    expect(model.walkRowBars!.rows).toHaveLength(3)
  })

  test('a sample filter keeps its walks, paired in the order named, and labels follow', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
      rows: { kept: ['A', 'B'] },
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    const labels = model.walkRowBars!.rows.map(r => r.label)
    expect(labels).toEqual(['A#1', 'A#2', 'B#1'])
    expect(model.drawnRowLabels.map(r => r.label).slice(1)).toEqual(labels)
    model.setWalkRowSamples(['B'])
    expect(model.walkRowBars!.rows.map(r => r.label)).toEqual(['B#1'])
    // the SVG export draws the bars the filter left, labelled
    expect(model.figureUnavailable).toBeUndefined()
    const svg = model.figure()!
    expect(svg).toContain('>B#1</text>')
    expect(svg).not.toContain('>A#1</text>')
    expect(svg).toContain("'s path")
  })

  test("a picker's set keeps lifted walks this cut does not hold", async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.setWalkLayers([
      { walk: 'elsewhere#1', color: { scheme: 'green' } },
      { walk: 'B#1#ctg' },
    ])
    model.liftAmongChoices(['A#1#ctg'])
    expect(model.walkLayers).toEqual([
      { walk: 'A#1#ctg' },
      { walk: 'elsewhere#1', color: { scheme: 'green' } },
    ])
  })

  test('walks lift together, each keeping the colour it was given', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.liftWalks(['B#1#ctg', 'GRCh38#0#chr1'])
    model.setWalkColor('B#1#ctg', { field: 'walk' })
    model.setWalkColor('B#1#ctg', { scheme: 'green' })
    model.toggleWalk('A#1#ctg')
    expect(model.walkLift!.walks.map(w => [w.name, w.encoding])).toEqual([
      ['GRCh38#0#chr1', { field: 'walk', scheme: 'grey' }],
      ['B#1#ctg', { field: 'walk', scheme: 'green' }],
      ['A#1#ctg', { field: 'walk', scheme: 'red' }],
    ])
    // lifted together, each walk is one flat colour
    const ref = model.walkLift!.walks[0]!
    expect(new Set(ref.colors.values()).size).toBe(1)
    expect(
      model.drawnWalks.find(w => w.name === 'B#1#ctg')!.encoding,
    ).toMatchObject({ field: 'walk', scheme: 'green' })
    model.liftWalks(['B#1#ctg'])
    expect(model.walkLayers).toEqual([
      { walk: 'B#1#ctg', color: { field: 'walk', scheme: 'green' } },
    ])
    // the node scheme has nothing on screen to colour while walks are lifted
    expect(model.colorSchemeLock?.value).toBe('By walk')
    model.toggleWalk('B#1#ctg')
    expect(model.walkLift).toBeUndefined()
    expect(model.colorSchemeLock).toBeUndefined()
  })

  // The ramp's own key names charcoal, and it is off while walks are lifted
  test('a lane coloured by reference position keys the charcoal it paints', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.liftWalks(['B#1#ctg'])
    model.setWalkColor('B#1#ctg', { field: 'walk' })
    expect(model.liftPaintsOffReference).toBe(false)
    // B takes node 2, which GRCh38 skips
    model.setWalkColor('B#1#ctg', { field: 'reference' })
    expect(model.liftPaintsOffReference).toBe(true)
  })

  // Walk rows draw their bars over the canvas the panels would split, so a
  // panel there was an empty box
  test('walk rows keep a row per walk rather than splitting into panels', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.liftWalks(['B#1#ctg', 'A#1#ctg'])
    expect(highlightMenu(model).some(item => item.label === 'Arrange')).toBe(
      false,
    )
    model.setFacet('walk')
    expect(model.facetPanels).toBeUndefined()
  })

  // Each reshapes the panels; a drawing zoomed for the old ones was left
  // clipped in the new until Fit was pressed
  test('a change of columns refits a drawing the user had zoomed', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.startRenderingBackend(fakeRenderer())
    model.liftWalks(['GRCh38#0#chr1', 'B#1#ctg'])
    model.setFacet('walk')
    model.zoom(2, 10, 10)
    expect(model.viewportOwner).toBe('user')

    model.writeGrammar({
      facet: {
        ...model.facetSetting,
        columns: model.facetGrid!.columns === 1 ? 2 : 1,
      },
    })
    expect(model.scale).toBeCloseTo(model.fittedTransform!.scale, 10)
  })

  test('faceted by walk, the pane draws one panel per lifted walk on one scale', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.liftWalks(['GRCh38#0#chr1'])
    model.setFacet('walk')
    // one walk needs no facet
    expect(model.facetPanels).toBeUndefined()
    model.liftWalks(['GRCh38#0#chr1', 'B#1#ctg', 'A#1#ctg'])
    expect(
      model.facetPanels!.map(p => [p.walks[0]!.name, p.walks[0]!.encoding]),
    ).toEqual([
      ['GRCh38#0#chr1', { field: 'progress', scheme: 'red' }],
      ['B#1#ctg', { field: 'progress', scheme: 'red' }],
      ['A#1#ctg', { field: 'progress', scheme: 'red' }],
    ])
    // a row layout's x is bp, so its panels stack full width
    expect(model.facetGrid!.columns).toBe(1)
    model.writeGrammar({ facet: { ...model.facetSetting, columns: 2 } })
    expect(model.facetGrid!.columns).toBe(2)
    model.setFacet('')
    expect(model.facetPanels).toBeUndefined()
  })

  test("faceted, the transform is each panel's and the menu keys what the panels draw", async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.startRenderingBackend(fakeRenderer())
    model.liftWalks(['GRCh38#0#chr1', 'B#1#ctg'])
    const whole = model.scale
    model.setFacet('walk')
    const grid = model.facetGrid!
    expect(model.viewBox).toEqual({ width: grid.width, height: grid.height })
    // the grid, then the key line under it
    expect(model.canvasHeight).toBe(Math.max(160, grid.total + 8 + 19))
    expect(facetKeyRows(model).map(r => r.label)).toEqual([
      'only in other haplotypes',
    ])
    expect(model.scale).toBeCloseTo(grid.scale, 10)
    expect(model.scale).not.toBeCloseTo(whole, 10)
    expect(
      model.drawnWalks.find(w => w.name === 'B#1#ctg')!.encoding,
    ).toMatchObject({ field: 'progress', scheme: 'red' })
  })

  test('by sample, a sample takes a row and its haplotypes the columns', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
      facet: 'sample',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.liftWalks(['GRCh38#0#chr1', 'A#1#ctg', 'A#2#ctg', 'B#1#ctg'])
    expect(model.facetPlacement).toEqual({
      columns: 2,
      count: 6,
      cells: [0, 2, 3, 4],
    })
    expect(model.facetGrid!.columns).toBe(2)
    expect(model.facetSpec).toBe('sample')
  })

  test('a facet written as an object orders its panels by sort, and a change of field drops the order', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
      facet: { field: 'sample', sort: ['B'], columns: 3 },
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.liftWalks(['GRCh38#0#chr1', 'A#1#ctg', 'A#2#ctg', 'B#1#ctg'])
    expect(model.facetPlacement!.cells).toEqual([2, 4, 5, 0])
    expect(model.facetSpec).toEqual({
      field: 'sample',
      sort: ['B'],
      columns: 3,
    })
    model.setFacet('walk')
    expect(model.facetSpec).toEqual({ field: 'walk', sort: [], columns: 3 })
    model.writeGrammar({ facet: { ...model.facetSetting, columns: undefined } })
    expect(model.facetSpec).toBe('walk')
    expect(
      stateModelFactory().create({
        type: 'GraphGenomeView',
        facet: 'none',
      }).facetSetting.field,
    ).toBe('')
  })

  test('the drawing exports as an SVG with its walks keyed', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.liftWalks(['B#1#ctg'])
    const svg = model.figure()!
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
    expect(svg).toContain('only in other haplotypes')
  })

  test('a tube map lifts no walk: its tubes are the walks', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'tubemap',
      walkLayers: [{ walk: 'GRCh38#0#chr1' }, { walk: 'B#1#ctg' }],
      facet: 'walk',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    expect(model.walkLift).toBeUndefined()
    expect(model.facetPanels).toBeUndefined()
    expect(model.highlightMenuItems()).toEqual([])
  })

  // B#1 and A#1 both take segment 2, A#2 skips it with the reference
  test('a tube map bundles the walks taking one route into a tube each', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'tubemap',
      tubeMapRoutes: 'bundled',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    const paths = model.drawnGraph!.paths!
    expect(paths.map(p => p.members?.length ?? 1)).toEqual([1, 2, 1])
    expect(model.tubeMapKeys).toMatchObject({ bundled: true, roles: true })
    expect(model.pathLegend).toEqual([])
    model.setHoveredTube({ track: 1 })
    expect(model.hoveredTubeText?.label).toBe('2 haplotypes')

    model.setTubeMapRoutes('grouped')
    await model.recomputeLayout()
    expect(model.drawnGraph!.paths!.map(p => p.name)).toEqual([
      'GRCh38#0#chr1',
      'B#1#ctg',
      'A#1#ctg',
      'A#2#ctg',
    ])
  })

  test('a tube map split by sample lays each sample out beside the reference', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'tubemap',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.setWidth(800)
    expect(model.tubeMapPanelViews).toBeUndefined()
    const panels = () =>
      model
        .layoutOptionMenuItems()
        .flatMap(item =>
          'subMenu' in item && item.label === 'Panels'
            ? resolveSubMenu(item)
            : [],
        )
    expect(
      panels().map(item => ('label' in item ? item.label : undefined)),
    ).toEqual(['None', 'A panel per sample', 'A panel per haplotype'])

    model.setFacet('sample')
    await model.recomputeLayout()
    expect(model.layoutResult?.tubeMapPanels).toHaveLength(2)
    const views = model.tubeMapPanelViews!
    expect(views.map(v => v.label)).toEqual(['B', 'A'])
    expect(views.map(v => v.panel.result.tubeMap.layout.tracks.length)).toEqual(
      [2, 3],
    )
    expect(views[1]!.titleTop).toBeGreaterThan(views[0]!.bottom - 1e-6)
    // the title names the walks, so the tubes say only which is the reference
    expect(views[1]!.tubeColors).toEqual([PANEL_REFERENCE_TUBE, ...PANEL_TUBES])
    expect(model.tubeMapKeys.roles).toBe(true)
    expect(model.pathLegend).toEqual([])

    // each panel answers for its own boxes and names its own tubes
    const [b, a] = views
    expect(model.tubeMapPanelAt((b!.top + b!.bottom) / 2)).toBe(0)
    expect(model.tubeMapPanelAt((a!.top + a!.bottom) / 2)).toBe(1)
    model.setHoveredPanel(1)
    expect(model.hoverGraph).toBe(a!.panel.result.tubeMap.graph)
    model.setHoveredTube({ track: 2 })
    expect(model.hoveredTubeText?.label).toBe(
      model.walkLabel(a!.panel.result.tubeMap.graph.paths![2]!.name),
    )
    // B's one haplotype carries segment 2, and one of A's two
    model.setHoveredNode('2+')
    expect(model.tubeMapPanelHover?.map(h => h && [h.here, h.of])).toEqual([
      [1, 1],
      [1, 2],
    ])

    model.setFacet('')
    await model.recomputeLayout()
    expect(model.layoutResult?.tubeMapPanels).toBeUndefined()
  })

  // the pictures are a layout's worth of work per panel
  test("a hovered lane row fades a split tube map's tubes and redraws no panel", async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'tubemap',
      facet: 'sample',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    const drawn: unknown[] = []
    const stop = autorun(() => drawn.push(model.tubeMapPanelPictures))
    model.setHoveredRowWalks(['A#1#ctg'])
    expect(drawn).toHaveLength(1)
    stop()
    const [b, a] = model.tubeMapPanelViews!
    expect(b!.tubeColors).toEqual([PANEL_REFERENCE_TUBE, LIFT_BACKDROP_CSS])
    // A#2 comes first in the file
    expect(a!.tubeColors).toEqual([
      PANEL_REFERENCE_TUBE,
      LIFT_BACKDROP_CSS,
      PANEL_TUBES[1],
    ])
  })

  test('a lane reads the reference ramp only when it is coloured by it', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.liftWalks(['B#1#ctg'])
    expect(model.walkRamp).toBeUndefined()
    model.setWalkColor('B#1#ctg', { field: 'reference' })
    expect(model.walkLift!.referenceDomain).toBeDefined()
  })

  test("a lane coloured by reference position shares the nodes' ramp", async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.setColorScheme('reference-position')
    model.liftWalks(['B#1#ctg'])
    model.setWalkColor('B#1#ctg', { field: 'reference' })
    const stop = autorun(() => [model.walkRamp, model.referenceRamp])
    expect(model.referenceRamp).toBeDefined()
    expect(model.walkRamp).toBe(model.referenceRamp)
    stop()
  })

  test('a session naming the one walk the old field lifted opens with none', () => {
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      highlightedPath: 'A#1#ctg',
    } as never)
    expect(model.walkLayers).toEqual([])
  })

  // walk rows draw no nodes to lift a walk over, and the colour lock would
  // name a scheme nothing paints
  test('a hovered lane row lifts nothing over walk rows', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    const lock = model.colorSchemeLock
    model.setHoveredRowWalks(['A#1#ctg'])
    expect(model.walkLift).toBeUndefined()
    expect(model.colorSchemeLock).toEqual(lock)
  })

  test('a hovered lane row lifts its walks while none is picked', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    model.setFacet('walk')
    model.setHoveredRowWalks(['A#1#ctg', 'A#2#ctg'])
    expect(model.walkLift!.walks.map(w => w.name)).toEqual([
      'A#1#ctg',
      'A#2#ctg',
    ])
    // a facet is a choice the picked walks make
    expect(model.facetPanels).toBeUndefined()
    model.liftWalks(['B#1#ctg'])
    expect(model.walkLift!.walks.map(w => w.name)).toEqual(['B#1#ctg'])
    model.liftWalks([])
    model.setHoveredRowWalks([])
    expect(model.walkLift).toBeUndefined()
  })

  // each lift rebuilds the drawing, and a sweep down a lane crosses many rows
  test('moving between lane rows lifts the next once the pointer settles', async () => {
    rpcRespond()
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'auto',
    })
    await model.loadGFA(WALKS_GFA, 'walks')
    vi.useFakeTimers()
    try {
      model.setHoveredRowWalks(['A#1#ctg'])
      expect(model.hoveredRowWalks).toEqual(['A#1#ctg'])
      model.setHoveredRowWalks(['A#2#ctg'])
      model.setHoveredRowWalks(['B#1#ctg'])
      vi.advanceTimersByTime(40)
      // more moves within the row do not put the lift off
      model.setHoveredRowWalks(['B#1#ctg'])
      expect(model.hoveredRowWalks).toEqual(['A#1#ctg'])
      vi.advanceTimersByTime(60)
      expect(model.hoveredRowWalks).toEqual(['B#1#ctg'])
      model.setHoveredRowWalks([])
      expect(model.hoveredRowWalks).toEqual([])
    } finally {
      vi.useRealTimers()
    }
  })
})

test('a walk-rows key notes genes as left out once rows are too thin to box them', () => {
  const gaps = { untracked: 3, unread: 421 }
  const roomy = { rowPx: 22, barPx: 12, labelled: true, readouts: true }
  const packed = { rowPx: 0.7, barPx: 0.7, labelled: false, readouts: false }
  expect(walkRowGeneKey(roomy, true, gaps)).toEqual(gaps)
  expect(walkRowGeneKey(packed, true, gaps)).toEqual({ ...gaps, crowded: true })
  expect(walkRowGeneKey(packed, false, gaps)).toBeUndefined()
})

describe('walk rows grouped by a sample column', () => {
  const GFA = [
    'H\tVN:Z:1.1',
    'S\t1\tACGT',
    'S\t2\tGGCCGGCC',
    'S\t3\tTTTT',
    'S\t4\tAAAAAAAAAAAAAAAA',
    'L\t1\t+\t2\t+\t0M',
    'L\t2\t+\t3\t+\t0M',
    'L\t1\t+\t3\t+\t0M',
    'L\t1\t+\t4\t+\t0M',
    'L\t4\t+\t3\t+\t0M',
    'W\tGRCh38\t0\tchr1\t0\t8\t>1>3',
    'W\tB\t1\tctg\t0\t24\t>1>4>3',
    'W\tA\t1\tctg\t0\t16\t>1>2>3',
    'W\tC\t1\tctg\t0\t16\t>1>2>3',
    'W\tA\t2\tctg\t0\t8\t>1>3',
    'W\tD\t1\tctg\t0\t8\t>1>3',
    'W\tE\t1\tctg\t0\t8\t>1>3',
    '',
  ].join('\n')
  const TSV = [
    'name\tpopulation\tsuperpopulation',
    'GRCh38\t\t',
    'A\tYRI\tAFR',
    'B\tGBR\tEUR',
    'C\tESN\tAFR',
    'D#1\tCEU\tEUR',
    '',
  ].join('\n')
  const SAMPLES_TRACK = {
    trackId: 'gbz-track',
    adapter: {
      type: 'GbzBaseSyntenyAdapter',
      samplesTsvLocation: {
        uri: 'https://example.com/samples.tsv',
        locationType: 'UriLocation',
      },
    },
  }

  beforeEach(() => {
    mockRpcCall.mockReset()
    mockReadFile.mockReset()
    mockSession.notify.mockReset()
    mockSession.tracks = [SAMPLES_TRACK]
  })

  async function groupedModel(snapshot: Record<string, unknown> = {}) {
    rpcRespond()
    mockReadFile.mockResolvedValue(TSV)
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
      loadedTrackId: 'gbz-track',
      ...snapshot,
    })
    await model.loadGFA(GFA, 'walks')
    await model.loadWalkRowSampleTable()
    model.setWidth(800)
    return model
  }

  const labels = (model: { walkRowBars?: { rows: { label: string }[] } }) =>
    model.walkRowBars!.rows.map(r => r.label)

  test("reads the source track's samples TSV once per location", async () => {
    const model = await groupedModel()
    expect(mockReadFile).toHaveBeenCalledTimes(1)
    expect(model.walkRowGroupFields).toEqual(['population', 'superpopulation'])
    await model.loadWalkRowSampleTable()
    expect(mockReadFile).toHaveBeenCalledTimes(1)
  })

  test('a failed read leaves the rows ungrouped and says so', async () => {
    rpcRespond()
    mockReadFile.mockRejectedValue(new Error('404'))
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
      loadedTrackId: 'gbz-track',
      facet: 'superpopulation',
    })
    await model.loadGFA(GFA, 'walks')
    await model.loadWalkRowSampleTable()
    expect(model.walkRowSampleTable).toBeUndefined()
    expect(model.walkRowGroups).toBeUndefined()
    expect(mockSession.notify).toHaveBeenCalledWith(
      expect.stringContaining('404'),
      'warning',
    )
    mockReadFile.mockResolvedValue(TSV)
    await model.loadWalkRowSampleTable()
    expect(model.walkRowGroupFields).toEqual(['population', 'superpopulation'])
  })

  test('the next cut retries a read that failed', async () => {
    rpcRespond()
    mockReadFile.mockRejectedValue(new Error('network'))
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
      loadedTrackId: 'gbz-track',
    })
    model.startRenderingBackend(fakeRenderer())
    await model.loadGFA(GFA, 'walks')
    await vi.waitFor(() => {
      expect(mockSession.notify).toHaveBeenCalledTimes(1)
    })
    mockReadFile.mockResolvedValue(TSV)
    await model.loadGFA(GFA, 'walks')
    await vi.waitFor(() => {
      expect(model.walkRowGroupFields).toEqual([
        'population',
        'superpopulation',
      ])
    })
  })

  test('a dropped graph takes its samples table with it', async () => {
    const model = await groupedModel()
    model.clearGraph()
    expect(model.walkRowSampleTable).toBeUndefined()
  })

  test('a track with no samples TSV reads nothing', async () => {
    mockSession.tracks = [
      { trackId: 'gbz-track', adapter: { type: 'GbzBaseSyntenyAdapter' } },
    ]
    const model = await groupedModel()
    expect(mockReadFile).not.toHaveBeenCalled()
    expect(model.walkRowGroupFields).toEqual([])
  })

  test('sections stack by key, the empty group last, each keeping the row order', async () => {
    const model = await groupedModel()
    const ungrouped = labels(model)
    model.setWalkRowGroupBy({ field: 'superpopulation' })
    const { sections } = model.walkRowGroups!
    expect(sections.map(s => s.title)).toEqual([
      'AFR · 3 haplotypes',
      'EUR · 2 haplotypes',
      'superpopulation: none · 1 haplotype',
    ])
    const inSection = (members: string[]) =>
      ungrouped.filter(label => members.includes(label))
    expect(labels(model)).toEqual([
      ...inSection(['A#1', 'A#2', 'C#1']),
      ...inSection(['B#1', 'D#1']),
      'E#1',
    ])
    // the reference row stays on top, outside the sections
    expect(model.walkRowBars!.reference.label).toBe('GRCh38#0')
    expect(model.drawnRowLabels[0]).toMatchObject({ label: 'GRCh38#0', y: 0 })
    expect(sections[0]!.first).toBe(1)
  })

  test('every section shares one row pitch, and the headers take their room', async () => {
    const model = await groupedModel()
    const flat = model.layoutBounds!.h
    model.setWalkRowGroupBy({ field: 'superpopulation' })
    const pitch = model.walkRowPitch!
    const place = model.walkRowPlacement!
    const ys = model.drawnRowLabels.map(r => r.y)
    const steps = ys.slice(1).map((y, i) => y - ys[i]!)
    const firsts = new Set(model.walkRowGroups!.sections.map(s => s.first))
    steps.forEach((step, i) => {
      expect(step).toBe(
        pitch.rowPx + (firsts.has(i + 1) ? SECTION_HEADER_PX : 0),
      )
    })
    expect(place.headersPx).toBe(3 * SECTION_HEADER_PX)
    expect(model.layoutBounds!.h).toBe(flat + place.headersPx)
    // each bar is drawn on its placed row, section after section
    const frame = {
      scaleX: model.scaleX,
      scaleY: model.scaleY,
      translateX: model.translateX,
      translateY: model.translateY,
      width: 800,
      height: 10_000,
      ...pitch,
    }
    const drawn = walkRowTrees(
      model.walkRowBars!,
      model.walkRowGroups!.sections,
      place.rowY,
      frame,
      { idPrefix: 't' },
    )
      .flatMap(tree =>
        tree.tag === 'g' && !tree.attrs['data-testid'] ? tree.children : [tree],
      )
      .filter(
        (c): c is El =>
          typeof c !== 'string' && c.attrs['data-testid'] === 'graph-walk-row',
      )
      .map(row => {
        const bar = row.children.find(
          (c): c is El => typeof c !== 'string' && c.tag === 'rect',
        )!
        return Number(bar.attrs.y) + Number(bar.attrs.height) / 2
      })
    expect(drawn).toEqual(
      model.walkRowBars!.rows.map(
        (_, i) => place.rowY(i + 1) * model.scaleY + model.translateY,
      ),
    )
    // a point on a bar in the last section finds its row
    const last = model.walkRowBars!.rows.length
    const x = (model.walkRowBars!.origin + 4) * model.scaleX + model.translateX
    const y = place.rowY(last) * model.scaleY + model.translateY
    expect(model.walkRowAt(x, y)).toBe(last)
  })

  test('a ribbon stays inside its section rather than crossing a header', async () => {
    const model = await groupedModel({ layers: { walkRibbons: true } })
    const flat = model.walkRowRibbons!.length
    model.setWalkRowGroupBy({ field: 'superpopulation' })
    const sections = model.walkRowGroups!.sections
    const ribbons = model.walkRowRibbons!
    expect(ribbons.length).toBeGreaterThan(0)
    expect(ribbons.length).toBeLessThan(flat)
    for (const { row } of ribbons) {
      expect(sectionIndexOf(sections, row)).toBe(
        sectionIndexOf(sections, row + 1),
      )
    }
  })

  test('a packed cohort fits its rows and headers into the pane', async () => {
    rpcRespond()
    const cohort = [
      ...GFA.trimEnd().split('\n'),
      ...Array.from(
        { length: 300 },
        (_, i) => `W\tS${i}\t1\tctg\t0\t16\t>1>2>3`,
      ),
      '',
    ].join('\n')
    mockReadFile.mockResolvedValue(
      [
        TSV.trimEnd(),
        ...Array.from(
          { length: 300 },
          (_, i) => `S${i}\tX\t${['AFR', 'EUR', 'SAS'][i % 3]}`,
        ),
      ].join('\n'),
    )
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'walkrows',
      loadedTrackId: 'gbz-track',
      facet: 'superpopulation',
    })
    await model.loadGFA(cohort, 'cohort')
    await model.loadWalkRowSampleTable()
    model.setWidth(800)
    const pitch = model.walkRowPitch!
    expect(pitch.labelled).toBe(false)
    const rows = model.walkRowBars!.rows.length
    expect(
      rows * pitch.rowPx + model.walkRowPlacement!.headersPx,
    ).toBeLessThanOrEqual(model.paneCeiling)
    expect(model.canvasHeight).toBeLessThanOrEqual(model.paneCeiling)
  })

  test('the setting persists as written and reads leniently', async () => {
    const bare = await groupedModel({ facet: 'superpopulation' })
    expect(bare.walkRowGroupBy).toEqual({ field: 'superpopulation' })
    expect(getSnapshot(bare).facet).toBe('superpopulation')
    const ordered = await groupedModel({
      facet: { field: 'superpopulation', sort: ['EUR', 7] },
    })
    expect(ordered.walkRowGroups!.sections.map(s => s.key)).toEqual([
      'EUR',
      'AFR',
      '',
    ])
    const junk = await groupedModel({ facet: 42 })
    expect(junk.walkRowGroupBy).toBeUndefined()
    // a column the table lacks leaves the rows ungrouped
    const stale = await groupedModel({ facet: 'tissue' })
    expect(stale.walkRowGroups).toBeUndefined()
    expect(stale.walkRowPlacement!.headers).toEqual([])
  })

  // One facet holds either, so clearing one leaves the other
  test('panels off keeps a grouping, and grouping off keeps panels', async () => {
    const grouped = await groupedModel({ facet: 'superpopulation' })
    grouped.setFacet('')
    expect(grouped.walkRowGroupBy).toEqual({ field: 'superpopulation' })
    const panelled = await groupedModel({ facet: 'walk' })
    panelled.setWalkRowGroupBy(undefined)
    expect(panelled.facetSetting.field).toBe('walk')
    panelled.setFacet('')
    expect(panelled.facet).toEqual({})
  })

  test('Group by... lists None and each column, and the SVG export waits for None', async () => {
    const model = await groupedModel()
    const groupBy = () =>
      (
        (model.layoutOptionMenuItems() as MenuItem[]).find(
          item => item.label === 'Group by...',
        ) as { subMenu: (MenuItem & { onClick: () => void })[] }
      ).subMenu
    expect(groupBy().map(item => [item.label, item.checked])).toEqual([
      ['None', true],
      ['population', false],
      ['superpopulation', false],
    ])
    groupBy()[2]!.onClick()
    expect(model.walkRowGroupBy).toEqual({ field: 'superpopulation' })
    expect(groupBy()[2]!.checked).toBe(true)
    expect(model.figureUnavailable).toContain('Group by...')
    groupBy()[0]!.onClick()
    expect(model.walkRowGroupBy).toBeUndefined()
    expect(model.figureUnavailable).toBeUndefined()
  })

  test('a tube colour column keys nothing outside a tube map', async () => {
    const model = await groupedModel({ tubeMapColorBy: 'superpopulation' })
    expect(model.tubeMapColoring?.field).toBe('superpopulation')
    expect(model.tubeMapKeys.values).toBeUndefined()
  })

  test("a walk row opens and reads genes on its haplotype's own contig", async () => {
    const was = vi.mocked(readConfObject).getMockImplementation()
    vi.mocked(readConfObject).mockImplementation(
      (obj: Record<string, unknown>, key?: unknown) => obj[String(key)],
    )
    mockSession.assemblyNames = ['B.1']
    mockSession.assemblyAliases = { 'B#1': 'B.1' }
    mockSession.tracks = [
      { ...SAMPLES_TRACK, assemblyNames: [] },
      {
        trackId: 'b-genes',
        name: 'B genes',
        assemblyNames: ['B#1'],
        adapter: { type: 'Gff3TabixAdapter' },
      },
    ]
    try {
      const model = await groupedModel()
      const b = model.walkRowBars!.rows.findIndex(r => r.sample === 'B') + 1
      const target = model.walkRowLaunchTarget(b)!
      expect(target).toMatchObject({
        assembly: 'B.1',
        location: { sample: 'B', haplotype: 'B#1', refName: 'ctg' },
      })
      const { start, end } = target.location
      expect(model.walkGeneReads!.reads).toEqual([
        {
          row: model.walkRowBars!.rows[b - 1]!.name,
          trackId: 'b-genes',
          region: { assemblyName: 'B.1', refName: 'ctg', start, end },
        },
      ])
      expect(model.walkRowLaunchTarget(0)?.location.sample).toBe('GRCh38')
    } finally {
      vi.mocked(readConfObject).mockImplementation(was!)
      mockSession.assemblyNames = []
      mockSession.assemblyAliases = {}
    }
  })

  test("beside a backbone of genes, a walk row reads its haplotype's genes, never its TEs", async () => {
    const was = vi.mocked(readConfObject).getMockImplementation()
    vi.mocked(readConfObject).mockImplementation(
      (obj: Record<string, unknown>, key?: unknown) => obj[String(key)],
    )
    mockSession.assemblyNames = ['B.1']
    mockSession.assemblyAliases = { 'B#1': 'B.1' }
    const track = (trackId: string, name: string) => ({
      trackId,
      name,
      assemblyNames: ['B#1'],
      adapter: { type: 'Gff3TabixAdapter' },
    })
    try {
      mockSession.tracks = [
        { ...SAMPLES_TRACK, assemblyNames: [] },
        track('b-tes', 'B TEs'),
        track('b-genes', 'B genes'),
      ]
      const both = await groupedModel()
      expect(both.walkRowAnnotation).toBe('gene')
      expect(both.walkGeneReads!.reads.map(r => r.trackId)).toEqual(['b-genes'])
      mockSession.tracks = [
        { ...SAMPLES_TRACK, assemblyNames: [] },
        track('b-tes', 'B TEs'),
      ]
      const tesOnly = await groupedModel()
      expect(tesOnly.walkGeneReads!.reads).toEqual([])
    } finally {
      vi.mocked(readConfObject).mockImplementation(was!)
      mockSession.assemblyNames = []
      mockSession.assemblyAliases = {}
    }
  })

  test('no samples table, no Group by...', async () => {
    mockSession.tracks = []
    const model = await groupedModel()
    expect(
      (model.layoutOptionMenuItems() as MenuItem[]).some(
        item => item.label === 'Group by...',
      ),
    ).toBe(false)
  })
})
