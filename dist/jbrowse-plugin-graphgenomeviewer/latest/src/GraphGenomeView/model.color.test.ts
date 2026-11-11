import { applySnapshot, getSnapshot } from '@jbrowse/mobx-state-tree'

import { mockRpcCall, mockSession } from './modelTestMocks'
import {
  MOCK_LAYOUT,
  RGFA,
  SIMPLE_GFA,
  TEST_REGION,
  TEST_TRACK,
  createAnchoredModel,
  createModel,
  fakeRenderer,
  rpcRespond,
} from './modelTestSupport'
import { SELECT_BRIGHTEN } from './pane/paneBase'

vi.mock('@jbrowse/core/util', async () =>
  (await import('./modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('./modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('./modelTestMocks')).ioMock(),
)

describe('graphRegion', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  test('is the region the graph on screen was cut for', async () => {
    rpcRespond()
    const model = createModel()
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    expect(model.graphRegion).toEqual(TEST_REGION)
  })

  test('a whole file states none, replacing the cut before it', async () => {
    rpcRespond()
    const model = createModel()
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    await model.loadGFA(SIMPLE_GFA, 'imported')
    expect(model.graphRegion).toBeUndefined()
  })
})

// What the reference-position ramp spans. A file-loaded graph has no
// region at all, so without a stated domain the ramp is whatever the file
// happens to contain — which is why a figure pairing a linear track with a
// file-loaded graph states the window instead of measuring it.
describe('rampDomain', () => {
  test('is the cut region when the graph came from a track', async () => {
    rpcRespond()
    mockSession.tracks = [TEST_TRACK]
    const model = createModel()
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    expect(model.rampDomain).toEqual(TEST_REGION)
  })

  test('is undefined for a file-loaded graph that states nothing', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA)
    expect(model.rampDomain).toBeUndefined()
  })

  test('a stated color domain survives loading a GFA file, and wins', async () => {
    rpcRespond()
    const model = createModel()
    applySnapshot(model, {
      ...getSnapshot(model),
      color: { scale: { domainMin: 1445000, domainMax: 1474500 } },
      loadedRegion: TEST_REGION,
    })
    await model.loadGFA(SIMPLE_GFA)
    expect(model.rampDomain).toEqual({ start: 1445000, end: 1474500 })
  })
})

// hoveredEdge is an index into graph.edges, so it addresses the graph it was set
// against; carrying it across a load pointed the tooltip and the highlight at
// whatever ended up at that index in the new graph.
// Ribbons fill the space between nodes, so an edge under a pointer on its way
// to a node is a hover nobody meant
test('an edge hovers only when asked to', async () => {
  rpcRespond()
  const model = createModel()
  await model.loadGFA(RGFA, 'first')
  model.setHoveredEdge(0)
  expect(model.hoveredEdge).toBeNull()
  model.setHover('everything')
  model.setHoveredEdge(0)
  expect(model.hoveredEdge).toBe(0)
  model.setHover('nodes')
  expect(model.hoveredEdge).toBeNull()
})

describe('interaction state across a graph swap', () => {
  test('loading a graph clears hover and selection', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA, 'first')
    model.setHover('everything')
    model.setHoveredEdge(0)
    expect(model.hoveredEdge).toBe(0)
    model.setHoveredNode('1+')
    model.setSelectedNode('1+')

    await model.loadGFA(SIMPLE_GFA, 'second')

    expect(model.hoveredEdge).toBeNull()
    expect(model.hoveredNode).toBeNull()
    expect(model.selectedNode).toBeNull()
  })
})

// What a connected linear view draws a band over. The reverse direction (an LGV
// hover selecting a node) is the pure functions in hoverSync/lgvHover.
describe('hoverHighlight', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  async function loadedFromTrack() {
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? Promise.resolve(RGFA)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createModel()
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    return model
  }

  test('nothing hovered highlights nothing', async () => {
    const model = await loadedFromTrack()
    expect(model.hoverHighlight).toBeUndefined()
  })

  test('a hovered backbone node highlights its own span', async () => {
    const model = await loadedFromTrack()
    model.setHoveredNode('2+')
    expect(model.hoverHighlight).toEqual({
      refName: TEST_REGION.refName,
      assemblyName: TEST_REGION.assemblyName,
      start: 4,
      end: 8,
    })
  })

  // Node 3 is rank 1 on stable sequence `alt`, so its own offset means nothing on
  // chr. It resolves through the backbone it hangs off.
  test('a hovered off-reference allele highlights where it branches', async () => {
    const model = await loadedFromTrack()
    model.setHoveredNode('3+')
    expect(model.hoverHighlight).toMatchObject({ start: 0, end: 4 })
  })

  test('turning hover highlighting off lights nothing', async () => {
    const model = await loadedFromTrack()
    model.setHover('off')
    model.setHoveredNode('2+')
    expect(model.hoverHighlight).toBeUndefined()
    expect(model.litNode).toBeNull()
    expect(model.hoverLayerNode).toBeNull()
  })

  // the selection's own brightening already marks it, so hovering it adds
  // nothing over the top
  test('the hover layer lights a node the selection does not', async () => {
    const model = await loadedFromTrack()
    model.setHoveredNode('2+')
    expect(model.hoverLayerNode).toBe('2+')
    model.setSelectedNode('2+')
    expect(model.hoverLayerNode).toBeNull()
    const lit: ReadonlyMap<string, number>[] = []
    model.applySelection({
      ...fakeRenderer(),
      setNodeHighlights: (m: ReadonlyMap<string, number>) => lit.push(m),
    })
    expect(lit).toEqual([new Map([['2+', SELECT_BRIGHTEN]])])
  })

  // A whole-file import has no region, so its stable names need not name anything
  // in a loaded assembly and there is nothing to project onto.
  test('a whole-file import publishes no highlight', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA, 'imported')
    model.setHoveredNode('2+')
    expect(model.hoverHighlight).toBeUndefined()
  })
})

// The default used to be a colour, so a launched graph opened flat grey and both
// tutorials spent a step saying "now pick a colour" — one figure drives that
// click as part of the picture. 'auto' is a value the model resolves, the way
// layoutModes' 'auto' is.
describe('the auto color scheme', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  // no SN/SO/SR and no P/W records, so nothing gives a segment a coordinate
  const UNANCHORED = 'H\tVN:Z:1.0\nS\t1\tACGT\nS\t2\tGGCC\nL\t1\t+\t2\t+\t0M\n'

  test('a graph with reference coordinates opens on the ramp', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA, 'rgfa')

    expect(model.chosenColorScheme).toBe('auto')
    expect(model.effectiveColorScheme).toBe('reference-position')
  })

  // ...and the layout is not what decides it. This is the force drawing of an
  // rGFA, which `pangenome/rgfa_segment_neighbourhood` is: the layout has no
  // reference axis and the hue still says where on the reference each node came
  // from, which is the only quantity the linear lane beside it can share.
  test('a force layout of the same graph opens on the ramp too', async () => {
    rpcRespond()
    const model = createModel()
    model.setLayoutMode('force')
    await model.loadGFA(RGFA, 'rgfa')

    expect(model.pixelRows).toBe(false)
    expect(model.effectiveColorScheme).toBe('reference-position')
  })

  test('a graph with no coordinates at all stays uniform', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(UNANCHORED, 'plain')

    expect(model.effectiveColorScheme).toBe('uniform')
  })

  test('a stated scheme is left alone', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA, 'rgfa')
    model.setColorScheme('depth')

    expect(model.effectiveColorScheme).toBe('depth')
  })

  // The key beside the drawing, which is what retires the sentence two tutorials
  // carry in prose. It exists only while the ramp is what is painted.
  test('the ramp key spans the cut region, and only while the ramp is on', async () => {
    rpcRespond()
    const model = createModel()
    applySnapshot(model, {
      ...getSnapshot(model),
      color: { scale: { domainMin: 1000, domainMax: 5000 } },
    })
    await model.loadGFA(RGFA, 'rgfa')

    expect(model.referenceRampDomain).toEqual({ start: 1000, end: 5000 })

    model.setColorScheme('depth')
    expect(model.referenceRampDomain).toBeUndefined()
    model.setColorScheme('uniform')
    model.setColorScheme('reference-position')
    expect(model.referenceRampDomain).toEqual({ start: 1000, end: 5000 })
  })

  // With no region stated it falls back to what was drawn, so a file-loaded
  // graph gets a key too rather than a strip with nothing on its ends.
  test('with no stated region the key spans what was drawn', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA, 'rgfa')

    const domain = model.referenceRampDomain!
    expect(domain.end).toBeGreaterThan(domain.start)
  })
})

describe('opening a bubble', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  const bubble = {
    refName: 'chr',
    start: 4,
    end: 4,
    segmentCount: 3,
    pathCount: 2,
    inversion: false,
    shortestAlleleLength: 0,
    longestAlleleLength: 4,
    segments: '1,3,2',
    shortestAllele: undefined,
    longestAllele: undefined,
  }

  test('opens in place: the graph and its drawing stay, the rest greys', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    model.setLayoutMode('force')
    await model.loadGFA(RGFA, 'rgfa')
    const window = model.graph!
    const layouts = () =>
      mockRpcCall.mock.calls.filter(c => c[1] === 'GraphComputeLayout').length
    const laidOut = layouts()

    model.toggleBubble(bubble)
    expect(model.graph).toBe(window)
    expect(layouts()).toBe(laidOut)
    expect(model.openBubble).toBe(bubble)
    expect([...model.openBubbleFocus!.nodeIds].sort()).toEqual([
      '1+',
      '2+',
      '3+',
    ])
    expect(model.openBubbleFocus!.walks).toEqual([])

    model.toggleBubble(bubble)
    expect(model.openBubble).toBeUndefined()
    expect(model.openBubbleFocus).toBeUndefined()
  })

  test('an open bubble on the reference spans the ramp', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(RGFA, 'rgfa')
    const whole = model.rampDomain
    model.toggleBubble({ ...bubble, end: 8 })
    expect(model.rampDomain).toEqual({ start: 4, end: 8 })
    model.closeBubbles()
    expect(model.rampDomain).toEqual(whole)
  })

  test('a re-cut keeps the bubbles still in it open', async () => {
    let respond = (_gfa: string) => {}
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? new Promise<string>(resolve => {
            respond = resolve
          })
        : Promise.resolve({ result: MOCK_LAYOUT, duration: 5 }),
    )
    const model = createAnchoredModel()
    await model.loadGFA(RGFA, 'rgfa')
    const cut = model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    model.toggleBubble(bubble)

    respond(SIMPLE_GFA)
    await cut
    expect(model.graph!.nodes.map(n => n.name).sort()).toEqual(['1', '2'])
    expect(model.openBubbles).toEqual([bubble])
  })

  // Without an index beside the source the bubbles come from the graph
  // itself, and an open one derives those inside it, so a superbubble opens
  // in steps. 4 flanks the bubble, which would otherwise be the whole graph.
  const RGFA_BUBBLE =
    RGFA +
    'S\t4\tAAAA\tSN:Z:chr\tSO:i:8\tSR:i:0\n' +
    'L\t3\t+\t2\t+\t0M\nL\t2\t+\t4\t+\t0M\n'

  // chr 0 1 2 5, and an alt arm from 1 to 2 with a SNP between a and d:
  // opening 1..2 derives the SNP inside it
  const RGFA_NESTED = [
    'H\tVN:Z:1.0',
    'S\t0\tAAAA\tSN:Z:chr\tSO:i:0\tSR:i:0',
    'S\t1\tACGT\tSN:Z:chr\tSO:i:4\tSR:i:0',
    'S\t2\tGGCC\tSN:Z:chr\tSO:i:8\tSR:i:0',
    'S\t5\tTTAA\tSN:Z:chr\tSO:i:12\tSR:i:0',
    'S\ta\tTT\tSN:Z:alt\tSO:i:0\tSR:i:1',
    'S\tb\tG\tSN:Z:alt\tSO:i:2\tSR:i:1',
    'S\tc\tC\tSN:Z:alt2\tSO:i:0\tSR:i:2',
    'S\td\tAA\tSN:Z:alt\tSO:i:3\tSR:i:1',
    ...['0 1', '1 2', '2 5', '1 a', 'a b', 'a c', 'b d', 'c d', 'd 2'].map(
      l => `L\t${l.replace(' ', '\t+\t')}\t+\t0M`,
    ),
    '',
  ].join('\n')

  test('a graph with no index derives its own bubbles', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(RGFA_BUBBLE, 'rgfa')
    expect(model.indexBubbles).toBeUndefined()
    expect(model.bubbles.map(b => b.segments)).toEqual(['1,3,2'])
  })

  test('a node layout marks each bubble along its own nodes', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    model.setLayoutMode('ordered')
    await model.loadGFA(RGFA_BUBBLE, 'rgfa')
    // off by default
    expect(model.bubbleHalos).toEqual([])
    model.setLayer('bubbles', true)
    expect(
      model.bubbleHalos.map(h => [
        h.label,
        h.members,
        h.path.startsWith('M'),
        h.tick,
      ]),
    ).toEqual([['≤4 bp ins', 1, true, true]])
    model.setLayer('bubbles', false)
    expect(model.bubbleHalos).toEqual([])
  })

  test('opening nests, and each open bubble lists what it holds', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    model.setLayoutMode('ordered')
    await model.loadGFA(RGFA_NESTED, 'rgfa')
    const window = model.graph!
    const [outer] = model.bubbles
    expect(model.bubbles.map(b => b.segments)).toEqual(['1,a,b,c,d,2'])

    model.toggleBubble(outer!)
    const snp = model.bubbles.find(b => b.key === 'a>d')
    expect(snp).toMatchObject({ offReference: true, start: 8 })
    expect(model.bubbles.filter(b => b.covering)).toEqual([])
    expect(model.bubbleFaded({ bubble: snp!, nodeIds: ['a+', 'd+'] })).toBe(
      false,
    )
    expect(model.bubbleFaded({ bubble: snp!, nodeIds: ['0+'] })).toBe(true)

    model.toggleBubble(snp!)
    expect(model.openBubbles).toEqual([outer, snp])
    expect(model.graph).toBe(window)

    // closing the outer one closes what is open inside it
    model.toggleBubble(outer!)
    expect(model.openBubbles).toEqual([])
    expect(model.bubbles.map(b => b.segments)).toEqual(['1,a,b,c,d,2'])
  })

  test('a bubble off the reference lights no reference span', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(RGFA_NESTED, 'rgfa')
    const [outer] = model.bubbles
    model.toggleBubble(outer!)
    const snp = model.bubbles.find(b => b.key === 'a>d')
    model.setHoveredBubble(snp!)
    expect(model.hoveredSpan).toBeUndefined()
    model.setHoveredBubble(outer!)
    expect(model.hoveredSpan).toEqual({ start: 8, end: 8 })
  })

  test('a bubble naming no segment of the graph says so and opens nothing', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(RGFA, 'rgfa')
    mockSession.notify.mockClear()
    model.toggleBubble({ ...bubble, segments: 'x,y' })
    expect(model.openBubble).toBeUndefined()
    expect(mockSession.notify).toHaveBeenCalledWith(
      expect.stringContaining('widen the graph context'),
      'info',
    )
  })
})
