import { rowLabelBox } from '@jbrowse/bandage-core/graphLabels'
import { LEGEND_INSET_PX } from '@jbrowse/bandage-core/labelLayout'
import { ROW_HEIGHT_PX } from '@jbrowse/bandage-core/layout/rowSpacing'
import { Canvas2DRenderer } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'
import { buildGeometry } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { recordingCanvas } from '@jbrowse/bandage-core/renderer/recordingCanvas'
import { applyPatch, types } from '@jbrowse/mobx-state-tree'

import { legendSections } from './legendSections'
import { mockRpcCall, mockSession } from './modelTestMocks'
import {
  MOCK_LAYOUT,
  RGFA,
  SIMPLE_GFA,
  TEST_TRACK,
  createAnchoredModel,
  createModel,
  fakeRenderer,
  maxOf,
  minOf,
  rpcRespond,
  toggleDeletionEdges,
} from './modelTestSupport'
import stateModelFactory from './viewModel'

import type { GraphLayers } from './graphLayers'

vi.mock('@jbrowse/core/util', async () =>
  (await import('./modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('./modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('./modelTestMocks')).ioMock(),
)

// A window with no bubbles in it lays every segment out on row 0, and x there is
// reference bp — so a layout at offset 1 kb sat entirely off an 800 px canvas
// while zoomToFit declined to act on it for having no height.
describe('zoomToFit on a layout that is flat in y', () => {
  const RGFA_BACKBONE_ONLY =
    'H\tVN:Z:1.0\n' +
    'S\t1\tACGT\tSN:Z:chr\tSO:i:1000\tSR:i:0\n' +
    'S\t2\tGGCC\tSN:Z:chr\tSO:i:1004\tSR:i:0\n' +
    'L\t1\t+\t2\t+\t0M\n'

  test('fits on x and centers on y', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(RGFA_BACKBONE_ONLY, 'backbone only')

    const ys = Object.values(model.nodePositions!)
      .flat()
      .map(p => p.y)
    expect(new Set(ys).size).toBe(1)

    model.zoomToFit()

    // both ends of the backbone land inside the canvas
    const screenX = (x: number) => x * model.scale + model.translateX
    expect(screenX(1000)).toBeGreaterThanOrEqual(0)
    expect(screenX(1008)).toBeLessThanOrEqual(model.width)
    // and the one row it has sits vertically centered
    expect(model.translateY).toBeCloseTo(model.canvasHeight / 2, 5)
  })
})

// The zoom floor exists to keep the scale positive, but in a reference-anchored
// layout world units are bp, so fitting a megabase-scale import needs a scale far
// below what reads as a sensible interactive minimum. A 0.001 floor clamped it
// and the graph stayed several screens wide with no way to fit it.
describe('zoomToFit on a megabase-scale layout', () => {
  const WIDE_RGFA =
    'H\tVN:Z:1.0\n' +
    'S\t1\t*\tLN:i:1000000\tSN:Z:chr\tSO:i:0\tSR:i:0\n' +
    'S\t2\t*\tLN:i:1000000\tSN:Z:chr\tSO:i:4000000\tSR:i:0\n' +
    'L\t1\t+\t2\t+\t0M\n'

  test('fits a 5 Mbp span inside the canvas', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(WIDE_RGFA, 'wide')

    model.zoomToFit()

    const screenX = (x: number) => x * model.scale + model.translateX
    expect(screenX(0)).toBeGreaterThanOrEqual(0)
    expect(screenX(5_000_000)).toBeLessThanOrEqual(model.width)
  })
})

// The pane was a fixed 600 px box that the drawing floated in the middle of.
// Row spacing on a reference-anchored layout is a fraction of the reference
// span, so such a layout is wide and flat at every pane width and can never
// fill 600 px: measured on the ecoli slice, 178 px of rows with 211 px of dead
// space above and below, worsening as the pane narrowed.
describe('canvas height follows the drawing', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  // Four ranks over a 3 kb span, so the rows have enough extent to ask for a
  // pane between the floor and the cap — the ordinary case, and the one the
  // ecoli slice is.
  const RGFA_FOUR_RANKS =
    'H\tVN:Z:1.0\n' +
    'S\t1\t*\tLN:i:1000\tSN:Z:chr\tSO:i:0\tSR:i:0\n' +
    'S\t2\t*\tLN:i:1000\tSN:Z:chr\tSO:i:2000\tSR:i:0\n' +
    'S\ta\t*\tLN:i:100\tSN:Z:alt1\tSO:i:0\tSR:i:1\n' +
    'S\tb\t*\tLN:i:100\tSN:Z:alt2\tSO:i:0\tSR:i:2\n' +
    'S\tc\t*\tLN:i:100\tSN:Z:alt3\tSO:i:0\tSR:i:3\n' +
    'L\t1\t+\ta\t+\t0M\nL\ta\t+\t2\t+\t0M\n' +
    'L\t1\t+\tb\t+\t0M\nL\tb\t+\t2\t+\t0M\n' +
    'L\t1\t+\tc\t+\t0M\nL\tc\t+\t2\t+\t0M\n'

  // The same shape with as many ranks as asked for, for the case where the rows
  // outrun the pane's ceiling rather than fitting inside it.
  function manyRankGfa(ranks: number) {
    const lines = [
      'H\tVN:Z:1.0',
      'S\t1\t*\tLN:i:1000\tSN:Z:chr\tSO:i:0\tSR:i:0',
      'S\t2\t*\tLN:i:1000\tSN:Z:chr\tSO:i:2000\tSR:i:0',
    ]
    for (let r = 1; r <= ranks; r++) {
      lines.push(
        `S\ta${r}\t*\tLN:i:100\tSN:Z:alt${r}\tSO:i:0\tSR:i:${r}`,
        `L\t1\t+\ta${r}\t+\t0M`,
        `L\ta${r}\t+\t2\t+\t0M`,
      )
    }
    return `${lines.join('\n')}\n`
  }

  function extent(model: ReturnType<typeof createModel>) {
    const points = Object.values(model.nodePositions!).flat()
    const ys = points.map(p => p.y)
    const xs = points.map(p => p.x)
    return {
      w: maxOf(xs) - minOf(xs),
      h: maxOf(ys) - minOf(ys),
    }
  }

  test('a wide flat layout gets a pane just tall enough for its rows', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA_FOUR_RANKS, 'four ranks')
    model.zoomToFit()

    expect(model.canvasHeight).toBeLessThan(600)
    // the rows plus one padding gap top and bottom, and nothing else
    expect(extent(model).h * model.scale).toBeCloseTo(
      model.canvasHeight - 80,
      5,
    )
    // which is to say the drawing is not floating in the middle of the pane:
    // the top row sits one padding gap down, not 211 px down
    expect(model.translateY).toBeCloseTo(40, 5)
  })

  // The point is to remove dead space, not to draw the graph smaller: x is what
  // limits the fit either way, so the scale is the one the 600 px pane produced.
  test('the tighter pane draws the graph at the same scale', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA_FOUR_RANKS, 'four ranks')
    model.zoomToFit()

    expect(model.scale).toBeCloseTo((model.width - 80) / extent(model).w, 10)
  })

  // Shrink-to-fit has to stop somewhere: a two-row window over a few bases wants
  // a ~116 px pane, which leaves nothing to hover in.
  test('a nearly flat layout stops shrinking at the floor', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(RGFA, 'two rows over 8 bp')

    expect(model.canvasHeight).toBe(160)
  })

  // A force-directed layout is roughly as tall as it is wide, so it still wants
  // the whole pane and keeps the one it always had.
  test('a layout as tall as it is wide keeps the full pane', async () => {
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GraphComputeLayout'
        ? Promise.resolve({
            result: {
              nodePositions: {
                '1+': [
                  { x: 0, y: 0 },
                  { x: 100, y: 100 },
                ],
              },
            },
            duration: 5,
          })
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'square')

    expect(model.canvasHeight).toBe(600)
    model.setLegendSize({ width: 150, height: 60 })
    expect(model.canvasHeight).toBe(600)
  })

  // As a JBrowse track's legend does, the key floats over the drawing, which
  // fits as though it were not there
  test('the fit leaves the floating legend no room', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA_FOUR_RANKS, 'four ranks')
    model.zoomToFit()
    const { scale, translateX, translateY, canvasHeight } = model

    model.setLegendSize({ width: 150, height: 60 })
    model.zoomToFit()
    expect(model.scale).toBeCloseTo(scale, 10)
    expect(model.translateX).toBeCloseTo(translateX, 5)
    expect(model.translateY).toBeCloseTo(translateY, 5)
    expect(model.canvasHeight).toBe(canvasHeight)
  })

  test.each([
    {
      along: 'the top and right edges',
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
      corner: 'bottom-left',
    },
    {
      along: 'the left and bottom edges',
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
      ],
      corner: 'top-right',
    },
  ])(
    'a drawing along $along puts the key $corner',
    async ({ points, corner }) => {
      mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
        method === 'GraphComputeLayout'
          ? Promise.resolve({
              result: { nodePositions: { '1+': points } },
              duration: 5,
            })
          : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
      )
      const model = createModel()
      await model.loadGFA(SIMPLE_GFA, 'square')
      model.zoomToFit()
      // wide enough to reach the square drawing centred in the 800 px pane
      model.setLegendSize({ width: 300, height: 200 })

      expect(model.legendCorner).toBe(corner)
    },
  )

  test('the hover tooltip moves beside a legend that reaches its corner', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA_FOUR_RANKS, 'four ranks')
    model.setLegendSize({ width: 150, height: 60 })
    expect(model.tooltipRightPx).toBe(8)

    model.setLegendSize({ width: 150, height: model.canvasHeight })
    expect(model.tooltipRightPx).toBe(150 + 2 * LEGEND_INSET_PX)
  })

  test('a pane with no layout in it yet is full height', () => {
    expect(createModel().canvasHeight).toBe(600)
  })

  // One long node among short ones makes the drawing's aspect ratio all arc, so
  // the pane pins its ceiling and spends most of it on the loop. `paneHeight`
  // lowers that ceiling for the session that wants it, and the drawing scales
  // into it rather than being cropped.
  test('paneHeight lowers the ceiling a square layout would pin', async () => {
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GraphComputeLayout'
        ? Promise.resolve({
            result: {
              nodePositions: {
                '1+': [
                  { x: 0, y: 0 },
                  { x: 100, y: 100 },
                ],
              },
            },
            duration: 5,
          })
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'square')
    expect(model.canvasHeight).toBe(600)

    applyPatch(model, { op: 'replace', path: '/paneHeight', value: 420 })
    expect(model.canvasHeight).toBe(420)
    model.zoomToFit()
    expect(extent(model).h * model.scale).toBeLessThanOrEqual(420 - 80 + 1e-6)
  })

  // More rows than the pane's ceiling holds is the case a row layout is
  // expected to reach — it fits on x alone, and rowSpacing.ts says the rest are
  // reached by panning. Centring the overflow split the loss across both ends,
  // which spent the top row first: at 41 rows it landed 100 px above the pane.
  // The top row is the reference backbone, i.e. the thing the layout exists to
  // line up with the linear view.
  test('an overflowing row layout keeps the reference row on screen', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(manyRankGfa(40), '41 rows')
    model.zoomToFit()

    const rows = model.drawnRowLabels
    expect(rows).toHaveLength(41)
    // the drawing genuinely does not fit, or this asserts nothing
    expect(model.layoutBounds!.h).toBeGreaterThan(model.canvasHeight)
    expect(rows[0]!.label).toBe('Reference (rank 0)')
    expect(rows[0]!.y * model.scaleY + model.translateY).toBe(40)
  })

  // and the ordinary case still centres, so nothing that already fits moves
  test('a row layout that fits is still centred in its pane', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA_FOUR_RANKS, 'four ranks')
    model.zoomToFit()

    const h = extent(model).h * model.scaleY
    expect(model.translateY).toBeCloseTo((model.canvasHeight - h) / 2, 5)
  })

  test('an isotropic pane is as tall as its drawing at the fit, past its row labels', async () => {
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GraphComputeLayout'
        ? Promise.resolve({
            result: {
              ...MOCK_LAYOUT,
              rowLabels: [{ label: 'a label wider than the padding', y: 0 }],
            },
            duration: 5,
          })
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'labelled')
    model.zoomToFit()
    expect(model.fitPadLeft).toBeGreaterThan(40)
    expect(model.canvasHeight).toBeCloseTo(
      model.layoutBounds!.h * model.scale + model.fitPadTop + 40,
      6,
    )
  })

  // The floor is the reason a pane has a minimum at all: below it there is no
  // room to hover a node and read its tooltip, so a smaller request loses.
  test('paneHeight cannot go under the hover floor', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA_FOUR_RANKS, 'four ranks')

    applyPatch(model, { op: 'replace', path: '/paneHeight', value: 40 })
    expect(model.canvasHeight).toBe(160)
  })

  // A pane taller than the drawing is dead space, which is what the whole
  // shrink-to-fit exists to remove, so a raised ceiling changes nothing for a
  // flat layout.
  test('a raised paneHeight does not re-inflate a flat pane', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA_FOUR_RANKS, 'four ranks')
    const fitted = model.canvasHeight

    applyPatch(model, { op: 'replace', path: '/paneHeight', value: 900 })
    expect(model.canvasHeight).toBe(fitted)
  })
})

// A 22 kb cut of 1,295 nodes fitted whole drew at 3.4%, a strip of 1 px
// tubes. On its own axis a tube map fits no smaller than 5 px tubes and is
// panned along, as in sequenceTubeMap.
describe('zoomToFit on a tube map', () => {
  // A SNP between each pair of backbone nodes, so the boxes cannot merge
  function snpChainGfa(snps: number) {
    const lines = ['H\tVN:Z:1.0', 'S\tb0\t*\tLN:i:1000']
    const ref = ['b0+']
    const alt = ['b0+']
    for (let i = 1; i <= snps; i++) {
      lines.push(
        `S\tr${i}\tA`,
        `S\ta${i}\tC`,
        `S\tb${i}\t*\tLN:i:1000`,
        `L\tb${i - 1}\t+\tr${i}\t+\t0M`,
        `L\tb${i - 1}\t+\ta${i}\t+\t0M`,
        `L\tr${i}\t+\tb${i}\t+\t0M`,
        `L\ta${i}\t+\tb${i}\t+\t0M`,
      )
      ref.push(`r${i}+`, `b${i}+`)
      alt.push(`a${i}+`, `b${i}+`)
    }
    lines.push(`P\tref\t${ref.join(',')}\t*`, `P\talt\t${alt.join(',')}\t*`)
    return `${lines.join('\n')}\n`
  }

  async function tubeMap(snps: number) {
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'tubemap',
    })
    await model.loadGFA(snpChainGfa(snps), `${snps} SNPs`)
    model.zoomToFit()
    return model
  }

  function tubePx(model: Awaited<ReturnType<typeof tubeMap>>) {
    return model.layoutResult!.tubeMap!.layout.tracks[0]!.width * model.scale
  }

  test('a cut too long for the pane opens at 5 px tubes, its left end on screen', async () => {
    const model = await tubeMap(100)
    const bounds = model.layoutBounds!
    expect(model.width - 80).toBeLessThan(bounds.w * model.scale)

    expect(tubePx(model)).toBeCloseTo(5, 10)
    expect(bounds.minX * model.scale + model.translateX).toBeCloseTo(40, 5)
    expect(model.canvasHeight).toBe(Math.max(160, bounds.h * model.scale + 80))
  })

  // An action's reads are untracked, so an autorun that called zoomToFit
  // refitted on a new layout and on nothing else
  test('a view the user has not moved refits when its pane widens', async () => {
    const model = await tubeMap(2)
    model.startRenderingBackend(fakeRenderer())
    const before = model.scale

    model.setWidth(model.width * 2)
    expect(model.scale).toBeGreaterThan(before)
  })

  test('a cut that fits with wider tubes still fits whole', async () => {
    const model = await tubeMap(2)
    const bounds = model.layoutBounds!

    expect(tubePx(model)).toBeGreaterThan(5)
    const left = bounds.minX * model.scale + model.translateX
    const right = left + bounds.w * model.scale
    expect(left).toBeGreaterThanOrEqual(40 - 1e-6)
    expect(right).toBeLessThanOrEqual(model.width - 40 + 1e-6)
  })

  test('Reference position tints the boxes on the ramp and greys the tubes by role', async () => {
    const model = await tubeMap(2)
    model.setColorScheme('reference-position')
    expect(model.referenceRampDomain).toBeDefined()

    const colors = model.tubeMapNodeColors!
    expect(model.tubeMapPicture!.nodes.every(n => colors.has(n.name))).toBe(
      true,
    )
    // red to magenta along the backbone, the alleles off it charcoal
    expect(colors.get('b0+')).toBe('rgba(217,38,38,1)')
    expect(colors.get('b2+')).toBe('rgba(217,38,217,1)')
    expect(colors.get('a1+')).toBe('rgba(60,65,72,1)')
    // greys by role, keyed reference and haplotype rather than walk by walk
    expect(model.tubeMapTubeColors).toEqual(['#4d4d4d', '#8c8c8c'])
    expect(model.pathLegend).toEqual([])
    expect(model.tubeMapKeys).toMatchObject({
      roles: true,
      haplotypeTube: '#8c8c8c',
    })
  })

  // on an anchored graph, where Auto paints every other layout on the ramp
  test('Auto leaves the boxes clear and the tubes their path hues', async () => {
    const model = await tubeMap(2)
    expect(model.graph!.anchoredBy).toBeDefined()

    expect(model.effectiveColorScheme).toBe('uniform')
    expect(model.tubeMapNodeColors).toBeUndefined()
    expect(model.tubeMapTubeColors).toEqual(
      model.layoutResult!.tubeMap!.pathColors,
    )
    expect(model.referenceRampDomain).toBeUndefined()
  })

  // the folded drawing's boxes are the coarse graph's nodes, not the cut's
  test('a folded tube map tints its merged boxes', async () => {
    const model = await tubeMap(2)
    model.setColorScheme('reference-position')
    model.setTubeMapFold(1000)
    await model.recomputeLayout()

    expect(model.drawnGraph).not.toBe(model.graph)
    const { nodes } = model.tubeMapPicture!
    expect(nodes.length).toBeGreaterThan(0)
    expect(nodes.every(n => model.tubeMapNodeColors!.has(n.name))).toBe(true)
  })

  test('a fold change lays the tube map out again', async () => {
    rpcRespond()
    const { view: model } = types
      .model({ view: stateModelFactory() })
      .create({ view: { type: 'GraphGenomeView', layoutMode: 'tubemap' } })
    await model.loadGFA(snpChainGfa(2), '2 SNPs')
    expect(model.layoutResult!.tubeMap!.coarse).toBeUndefined()
    model.setTubeMapFold(1000)
    expect(model.layoutResult!.tubeMap!.coarse).toBeDefined()
    model.setTubeMapFold(0)
    expect(model.layoutResult!.tubeMap!.coarse).toBeUndefined()
  })
  test('a hovered lane row keeps its tube and fades the rest', async () => {
    const model = await tubeMap(2)
    const drawn = model.layoutResult!.tubeMap!.pathColors
    const alt = model.drawnGraph!.paths!.findIndex(p => p.name === 'alt')
    model.setHoveredRowWalks(['alt'])
    const tubes = model.tubeMapTubeColors!
    expect(tubes[alt]).toBe(drawn[alt])
    expect(tubes.filter((_, i) => i !== alt).every(c => c !== drawn[alt])).toBe(
      true,
    )
    expect(new Set(tubes.filter((_, i) => i !== alt)).size).toBe(1)
    model.setHoveredRowWalks([])
    expect(model.tubeMapTubeColors).toEqual(drawn)
  })
})

// A cut made for a region draws on that region's axis, which is the whole claim
// of the reference-anchored layouts: the graph pane's x is meant to match the
// linear view stacked above it. One allele can anchor far outside the window and
// still be correct -- in the E. coli pggb graph a 75 bp CFT073 segment attaches
// at K12:997,574 and rejoins at K12:1,004,667, a real 7 kb deletion -- and
// fitting the drawing to that redrew a 484 bp window at 6% of the frame. It got
// there when the graph-context default went from None to 1 hop, which is what
// first fetches the distant anchor.
const FAR_ANCHORED_RGFA =
  'H\tVN:Z:1.0\n' +
  // in the window
  'S\tin1\tACGTACGTAC\tSN:Z:chr\tSO:i:100000\tSR:i:0\n' +
  'S\tin2\tACGTACGTAC\tSN:Z:chr\tSO:i:100380\tSR:i:0\n' +
  // the same reference, 99 kb upstream of the window: reached because the
  // allele below links to it, never walked through
  'S\tfar\tACGTACGTAC\tSN:Z:chr\tSO:i:1000\tSR:i:0\n' +
  // the allele that bridges them
  'S\talt\tTTTT\tSN:Z:other\tSO:i:0\tSR:i:1\n' +
  'L\tfar\t+\talt\t+\t0M\nL\talt\t+\tin1\t+\t0M\nL\tin1\t+\tin2\t+\t0M\n'

const FAR_REGION = {
  refName: 'chr',
  assemblyName: 'hg38',
  start: 100000,
  end: 100400,
}

describe('layoutBounds on a reference axis', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = [TEST_TRACK]
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? Promise.resolve(FAR_ANCHORED_RGFA)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
  })

  test('x is the cut region, not how far the drawing reaches', async () => {
    const model = createAnchoredModel()
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, FAR_REGION)

    // the drawing does reach the far anchor -- this is not a fetch change
    const drawnX = Object.values(model.nodePositions!)
      .flat()
      .map(s => s.x)
    expect(minOf(drawnX)).toBeLessThan(FAR_REGION.start)

    expect(model.layoutBounds!.minX).toBe(FAR_REGION.start)
    expect(model.layoutBounds!.w).toBe(FAR_REGION.end - FAR_REGION.start)
  })

  // The fit is only half of it. Row spacing and the off-reference floor are
  // both fractions of the reference span, so a backbone stretched by the far
  // anchor pushed the rows 15x apart and set a 111 bp floor inside a 484 bp
  // window -- a pane too tall for its own viewport, with the drawing at the top
  // of it.
  test('rows are spaced against the region, not the stretched backbone', async () => {
    const model = createAnchoredModel()
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, FAR_REGION)
    const rowYs = [...new Set(model.drawnRowLabels.map(r => r.y))].sort(
      (a, b) => a - b,
    )
    expect(rowYs.length).toBeGreaterThan(1)
    // whatever the fraction is, one row step has to stay inside the window it
    // is a fraction of
    expect(rowYs[1]! - rowYs[0]!).toBeLessThan(
      FAR_REGION.end - FAR_REGION.start,
    )
  })

  test('y still comes from the rows, which are not on the reference', async () => {
    const model = createAnchoredModel()
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, FAR_REGION)
    const drawnY = Object.values(model.nodePositions!)
      .flat()
      .map(s => s.y)
    expect(model.layoutBounds!.h).toBe(maxOf(drawnY) - minOf(drawnY))
  })

  test('a force layout keeps the extent it measured', async () => {
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? Promise.resolve(FAR_ANCHORED_RGFA)
        : method === 'GraphComputeLayout'
          ? Promise.resolve({ result: MOCK_LAYOUT, duration: 5 })
          : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createModel()
    model.setLayoutMode('force')
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, FAR_REGION)
    // MOCK_LAYOUT's own units, which no region bounds
    const drawnX = Object.values(model.nodePositions!)
      .flat()
      .map(s => s.x)
    expect(model.layoutBounds!.minX).toBe(minOf(drawnX))
    expect(model.layoutBounds!.w).toBe(maxOf(drawnX) - minOf(drawnX))
  })
})

// The two axes are two numbers, and only on a row layout do they differ. x is
// reference bp and zooms; y is a row pitch in screen px and does not. Three
// separate complaints were the one scale that used to drive both — see
// rowSpacing.ts — and these are what each of them turns into.
describe('a row layout draws y in pixels', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  // one rank-0 backbone of `spanBp`, plus `rankCount` alleles bridging it, each
  // at its own rank, so the layout draws rankCount + 1 rows
  function ranksGfa(rankCount: number, spanBp: number) {
    return [
      'H\tVN:Z:1.0',
      `S\t1\t*\tLN:i:${spanBp / 4}\tSN:Z:chr\tSO:i:0\tSR:i:0`,
      `S\t2\t*\tLN:i:${spanBp / 4}\tSN:Z:chr\tSO:i:${(spanBp * 3) / 4}\tSR:i:0`,
      ...Array.from({ length: rankCount }, (_, i) => [
        `S\ta${i}\t*\tLN:i:100\tSN:Z:alt${i}\tSO:i:0\tSR:i:${i + 1}`,
        `L\t1\t+\ta${i}\t+\t0M`,
        `L\ta${i}\t+\t2\t+\t0M`,
      ]).flat(),
    ].join('\n')
  }

  async function anchored(rankCount: number, spanBp = 100_000) {
    const model = createAnchoredModel()
    await model.loadGFA(ranksGfa(rankCount, spanBp), 'ranks')
    model.zoomToFit()
    return model
  }

  test('scaleY is pinned at 1 while scaleX carries the zoom', async () => {
    const model = await anchored(3)
    expect(model.pixelRows).toBe(true)
    expect(model.scaleY).toBe(1)
    expect(model.scaleX).toBe(model.scale)
    expect(model.scaleX).toBeLessThan(0.1)
  })

  // ...and a force layout is one space with one scale, exactly as before.
  test('an isotropic layout keeps one scale for both axes', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'force')
    expect(model.pixelRows).toBe(false)
    expect(model.scaleY).toBe(model.scale)
  })

  // The pane is the rows, plus one padding gap top and bottom. It used to be
  // derived from the drawing's aspect ratio against the x-fit scale, which is
  // why a two-row window over a megabase got a 46 px pitch and a twenty-row one
  // got 8 px.
  test('the pane is the row count times the pitch', async () => {
    const model = await anchored(9)
    expect(model.canvasHeight).toBe(9 * ROW_HEIGHT_PX + 80)
  })

  test('the pitch does not move with the window span', async () => {
    const narrow = await anchored(9, 2_000)
    const wide = await anchored(9, 4_000_000)
    expect(wide.canvasHeight).toBe(narrow.canvasHeight)
  })

  // The bug this axis change is for, in the one configuration that can still
  // show it: 41 rows is 800 px of drawing in a 600 px pane, and over a window
  // narrow enough that the vertical overflow is the tighter of the two fits. A
  // fit allowed to bind on y takes the tighter one and draws the backbone at
  // 520 px of the 720 it has — out from under the linear view's x axis, which is
  // the one thing a row layout is for. It binds on x, and the rows past the pane
  // are panned to, the way a track's are.
  test('rows past the pane do not shrink the drawing', async () => {
    const model = await anchored(40, 800)
    expect(model.layoutBounds!.h).toBe(40 * ROW_HEIGHT_PX)
    expect(model.canvasHeight).toBe(600)
    // the vertical fit is the tighter one, and is not the one taken
    expect((model.canvasHeight - 80) / model.layoutBounds!.h).toBeLessThan(
      (model.width - model.fitPadLeft - 40) / model.layoutBounds!.w,
    )

    const xs = Object.values(model.nodePositions!)
      .flat()
      .map(p => p.x * model.scaleX + model.translateX)
    expect(maxOf(xs) - minOf(xs)).toBeCloseTo(
      model.width - model.fitPadLeft - 40,
      5,
    )
  })

  // Rows are a track's row height, so zooming the sequence axis leaves them
  // where they are — pitch and position both. Moving translateY by the zoom
  // ratio would slide them out from under their own labels.
  test('zooming x leaves the rows where they are', async () => {
    const model = await anchored(5)
    const rowsAt = () =>
      model.drawnRowLabels.map(r => r.y * model.scaleY + model.translateY)
    const before = rowsAt()
    const scaleBefore = model.scaleX

    model.zoom(4, model.width / 2, model.canvasHeight / 2)

    expect(model.scaleX).toBeCloseTo(scaleBefore * 4, 10)
    expect(rowsAt()).toEqual(before)
  })
})

// The whole pipeline, ending in pixels: the layout, the geometry, the transform
// and Canvas2DRenderer, asked where they actually put the drawing. The unit
// tests above each pin one link; this is the one that would catch two of them
// disagreeing, which is the failure mode a change to a shared axis has.
describe('what the row axis draws, in pixels', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  // 4 rows: a rank-0 backbone over 0-100 kb, and one allele each at ranks 1-3
  const FOUR_ROWS = [
    'H\tVN:Z:1.0',
    // abutting, so the reference route itself skips nothing and the only
    // deletion in the graph is the link that bypasses `m`
    'S\t1\t*\tLN:i:25000\tSN:Z:chr\tSO:i:0\tSR:i:0',
    'S\tm\t*\tLN:i:20000\tSN:Z:chr\tSO:i:25000\tSR:i:0',
    'S\t2\t*\tLN:i:25000\tSN:Z:chr\tSO:i:45000\tSR:i:0',
    // the reference route through the middle segment...
    'L\t1\t+\tm\t+\t0M',
    'L\tm\t+\t2\t+\t0M',
    // ...and the one that skips it, i.e. a deletion, which is in the fixture
    // because its BOW is the only thing here whose shape depends on both axes.
    // A node polyline in a row layout is horizontal, so its normals are (0,±1)
    // under any axis and its position comes from the transform — without an arc
    // these tests pass with the axis wrong, which is what they were doing. The
    // bow also needs backbone BETWEEN the anchors to size itself against, which
    // is what `m` is for: with nothing to pass around, bowAround returns 0 and
    // the arc is a straight chord that notices nothing either.
    'L\t1\t+\t2\t+\t0M',
    ...[1, 2, 3].flatMap(rank => [
      `S\ta${rank}\t*\tLN:i:500\tSN:Z:alt${rank}\tSO:i:0\tSR:i:${rank}`,
      `L\t1\t+\ta${rank}\t+\t0M`,
      `L\ta${rank}\t+\t2\t+\t0M`,
    ]),
  ].join('\n')

  // render whatever transform the model is currently in, and report where the
  // renderer put every coordinate
  function render(model: ReturnType<typeof createAnchoredModel>) {
    const { canvas, points } = recordingCanvas()
    const renderer = new Canvas2DRenderer(canvas)
    renderer.resize(model.width, model.canvasHeight)
    renderer.uploadGeometry(
      buildGeometry({
        nodePositions: model.nodePositions!,
        graph: model.graph!,
        nodeById: model.nodeById!,
        colorScheme: 'uniform',
        contigThickness: model.contigThickness,
        connectorThickness: model.connectorThickness,
        drawPaths: false,
        axis: model.axisScale,
        deletions: model.deletionEdgeIndexes,
        hiddenEdges: model.hiddenEdgeIndexes,
      }),
    )
    renderer.updateTransform({
      scaleX: model.scaleX,
      scaleY: model.scaleY,
      translateX: model.translateX,
      translateY: model.translateY,
      dpr: 1,
    })
    renderer.render([1, 1, 1, 1])
    return points
  }

  async function fitted(props: { layers?: GraphLayers } = {}) {
    const model = createAnchoredModel(props)
    await model.loadGFA(FOUR_ROWS, 'four rows')
    model.zoomToFit()
    return model
  }

  const spread = (v: number[]) => maxOf(v) - minOf(v)

  test('the rows are one pitch apart and the pane holds them', async () => {
    const model = await fitted()
    const points = render(model)
    expect(points.length).toBeGreaterThan(0)
    // the node tubes, which is what a row pitch is about: the arc reaches above
    // them by design, so it is measured on its own below
    const rowYs = model.drawnRowLabels.map(
      r => r.y * model.scaleY + model.translateY,
    )

    // three row gaps, and each tube half a thickness either side of its row
    expect(spread(rowYs)).toBeCloseTo(3 * ROW_HEIGHT_PX, 5)
    expect(minOf(rowYs) - model.contigThickness / 2).toBeGreaterThan(0)
    expect(maxOf(rowYs) + model.contigThickness / 2).toBeLessThan(
      model.canvasHeight,
    )
  })

  // The assertion that actually depends on both scales. A deletion's bow is
  // sized off the run it passes around, in x units; put on a y axis ~100x finer
  // without the conversion it is a ~100x balloon that leaves the pane entirely
  // and takes its label with it. Everything else in this drawing is horizontal
  // and would not notice.
  test('the deletion arc bows a legible distance, not a hundred rows', async () => {
    const model = await fitted()
    expect(model.deletions).toHaveLength(1)
    const points = render(model)

    const top = minOf(points.map(p => p.y))
    const bottom = maxOf(points.map(p => p.y))
    // it does bow past the rows — a flat arc would mean the bow was dropped,
    // not converted; the rows themselves span three pitches
    expect(bottom - top).toBeGreaterThanOrEqual(3 * ROW_HEIGHT_PX)
    // ...and it bows in screen px, so the whole drawing still fits its pane
    expect(top).toBeGreaterThan(-model.canvasHeight)
    expect(bottom).toBeLessThan(2 * model.canvasHeight)
  })

  test('a deletion edge draws only in a view that shows it', async () => {
    const hidden = await fitted({ layers: { deletions: false } })
    expect([...hidden.hiddenEdgeIndexes!]).toEqual(
      hidden.allDeletions.map(d => d.edgeIndex),
    )
    expect(hidden.deletions).toEqual([])
    const shown = await fitted()
    expect(shown.showDeletionEdges).toBe(true)
    expect(shown.hiddenEdgeIndexes!.size).toBe(0)

    expect(render(hidden).length).toBeLessThan(render(shown).length)

    hidden.setLayer('deletions', true)
    expect(hidden.hiddenEdgeIndexes!.size).toBe(0)
  })

  test('the legend keys the dashed links only while they draw', async () => {
    const deletionRows = (model: Awaited<ReturnType<typeof fitted>>) =>
      legendSections(model)
        .filter(s => s.testid === 'graph-deletion-legend')
        .flatMap(s => s.rows)
    const shown = await fitted()
    expect(deletionRows(shown)).toMatchObject([
      {
        label: expect.stringMatching(/^skips .* sequence/),
        swatch: { kind: 'line', dashed: true },
      },
    ])
    expect(
      deletionRows(await fitted({ layers: { deletions: false } })),
    ).toEqual([])
  })

  // The panel-alignment half: the backbone is drawn across the pane rather than
  // squeezed into whatever the vertical fit left it. The recorded points are
  // the stroke's coordinates; the round caps the canvas adds past them are not
  // in the path.
  test('the backbone spans the pane', async () => {
    const model = await fitted()
    expect(spread(render(model).map(p => p.x))).toBeCloseTo(
      model.width - model.fitPadLeft - 40,
      5,
    )
  })

  test('the fit starts the drawing right of the row labels', async () => {
    const model = await fitted()
    const labelsEnd = maxOf(
      model.drawnRowLabels.map(r => rowLabelBox(r.label, 0).x1),
    )
    expect(labelsEnd).toBeGreaterThan(40)
    expect(minOf(render(model).map(p => p.x))).toBeGreaterThan(labelsEnd)
  })

  // Zoom is an x-only gesture on this axis, so afterwards the rows are drawn in
  // exactly the same pixels and only x has moved.
  test('zooming x redraws the rows where they were', async () => {
    const model = await fitted()
    // the ROWS, not every drawn point: the deletion arc's bow is sized in x
    // units, so it grows with the zoom by design and would mask this
    const rowYs = () =>
      model.drawnRowLabels.map(r => r.y * model.scaleY + model.translateY)
    const rowsBefore = rowYs()
    const before = render(model)

    model.zoom(3, model.width / 2, model.canvasHeight / 2)
    const after = render(model)

    expect(rowYs()).toEqual(rowsBefore)
    const tube = (points: { x: number }[]) => spread(points.map(p => p.x))
    expect(tube(after)).toBeCloseTo(tube(before) * 3, 5)
  })
})

describe('keeping the drawing on screen', () => {
  function screenBox(model: ReturnType<typeof createModel>) {
    const b = model.layoutBounds!
    const left = b.minX * model.scaleX + model.translateX
    const top = b.minY * model.scaleY + model.translateY
    return {
      left,
      top,
      right: left + b.w * model.scaleX,
      bottom: top + b.h * model.scaleY,
    }
  }

  async function forceModel() {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'simple')
    model.startRenderingBackend(fakeRenderer())
    model.setWidth(800)
    return model
  }

  test('a pan stops with some of the drawing still in the pane', async () => {
    const model = await forceModel()
    model.setTransform(model.scale, model.translateX + 10_000, -10_000)
    const box = screenBox(model)
    expect(box.left).toBeLessThanOrEqual(model.viewBox.width - 48 + 1e-6)
    expect(box.bottom).toBeGreaterThanOrEqual(48 - 1e-6)
  })

  test('a zoom about a point far from the drawing keeps it in the pane', async () => {
    const model = await forceModel()
    model.zoom(50, model.viewBox.width, model.viewBox.height)
    const box = screenBox(model)
    expect(box.right).toBeGreaterThan(0)
    expect(box.left).toBeLessThan(model.viewBox.width)
    expect(box.bottom).toBeGreaterThan(0)
    expect(box.top).toBeLessThan(model.viewBox.height)
  })

  // A fresh force run, or a new cut as a linear view moves, lands in
  // coordinates of its own; the old zoom showed empty paper
  test('a new force layout refits a drawing the user had moved', async () => {
    const model = await forceModel()
    model.zoom(4, 0, 0)
    expect(model.viewportOwner).toBe('user')
    const shifted = {
      nodePositions: Object.fromEntries(
        Object.entries(MOCK_LAYOUT.nodePositions).map(([k, segs]) => [
          k,
          segs.map(p => ({ x: p.x + 5000, y: p.y - 3000 })),
        ]),
      ),
    }
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GraphComputeLayout'
        ? Promise.resolve({ result: shifted, duration: 5 })
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    await toggleDeletionEdges(model)

    expect(model.viewportOwner).toBe('fit')
    expect(model.scale).toBeCloseTo(model.fittedTransform!.scale, 10)
    expect(model.translateX).toBeCloseTo(model.fittedTransform!.translateX, 10)
  })

  test('a graph loaded after clearing one is fitted, not left where the old one was moved', async () => {
    const model = await forceModel()
    model.setTransform(model.scale * 4, -2000, -2000)
    model.clearGraph()
    await model.loadGFA(SIMPLE_GFA, 'again')

    expect(model.viewportOwner).toBe('fit')
    expect(model.scale).toBeCloseTo(model.fittedTransform!.scale, 10)
  })

  // the force drawing's scale means nothing on the reference's bp
  test('switching from force to a layout on the reference refits a moved view', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA, 'rgfa')
    model.startRenderingBackend(fakeRenderer())
    model.setWidth(800)
    model.zoom(1.2, 400, 100)
    expect(model.viewportOwner).toBe('user')

    await model.switchLayout('auto')
    expect(model.xIsReferenceBp).toBe(true)
    expect(model.viewportOwner).toBe('fit')
    expect(model.scale).toBeCloseTo(model.fittedTransform!.scale, 10)
  })

  test('a layout handed back unchanged keeps the user’s zoom', async () => {
    const model = await forceModel()
    model.zoom(4, 100, 50)
    const { scale, translateX } = model
    await model.recomputeLayout()
    expect(model.viewportOwner).toBe('user')
    expect(model.scale).toBe(scale)
    expect(model.translateX).toBe(translateX)
  })
})
