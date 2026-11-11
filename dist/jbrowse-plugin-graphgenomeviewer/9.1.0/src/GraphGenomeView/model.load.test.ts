import { departureTable } from '@jbrowse/bandage-core/gfa/departures'
import { walkRows } from '@jbrowse/bandage-core/layout/walkRows'
import { loadGraph } from '@jbrowse/bandage-core/pipeline'
import { walkHighlight } from '@jbrowse/bandage-core/walkHighlight'
import { readConfObject } from '@jbrowse/core/configuration'
import { applySnapshot, getSnapshot } from '@jbrowse/mobx-state-tree'

import { MAX_GRAPH_REGION_BP, formatSpanBp } from './model'
import { mockReadFile, mockRpcCall, mockSession } from './modelTestMocks'
import {
  MOCK_LAYOUT,
  SIMPLE_GFA,
  TEST_REGION,
  TEST_TRACK,
  WALKED_GFA,
  attachedModel,
  createModel,
  fakeRenderer,
  layoutsSettled,
  restoredView,
  rpcRespond,
} from './modelTestSupport'
import stateModelFactory from './viewModel'
import { walkCutFor } from '../RgfaTabixAdapter/walkCut.ts'

import type { SubgraphCutOptions } from '../GetSubgraph'
import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'

vi.mock('@jbrowse/core/util', async () =>
  (await import('./modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('./modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('./modelTestMocks')).ioMock(),
)

// A 4.0 session or a docs spec states a view cut from a track; the view cuts
// it once.
describe('restoring a stated cut', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = [TEST_TRACK]
  })

  test('does nothing when no track is stated', async () => {
    const model = createModel()
    await model.load()
    expect(mockRpcCall).not.toHaveBeenCalled()
  })

  test('does nothing when no region is stated', async () => {
    const model = restoredView({ loadedRegion: undefined })
    await model.load()
    expect(mockRpcCall).not.toHaveBeenCalled()
  })

  test('fetches from the stated track and region', async () => {
    rpcRespond()
    const model = restoredView()
    await model.load()
    expect(mockRpcCall).toHaveBeenCalledWith(
      expect.any(String),
      'GetSubgraph',
      expect.objectContaining({
        adapterConfig: { type: 'RgfaTabixAdapter' },
        region: TEST_REGION,
      }),
    )
    expect(model.graph).toBeDefined()
    expect(model.graphRegion).toEqual(TEST_REGION)
  })

  test('passes the stated context and haplotypes to the cut', async () => {
    rpcRespond()
    const model = restoredView({
      subgraphContext: 2,
      subgraphHaplotypes: ['HG002#1', 'HG005#2'],
    })
    await model.load()
    expect(mockRpcCall).toHaveBeenCalledWith(
      expect.any(String),
      'GetSubgraph',
      expect.objectContaining({
        opts: { hops: 2, haplotypes: ['HG002#1', 'HG005#2'] },
      }),
    )
  })

  // Only a GBZ cut follows snarls past the window; a walk file cuts the same
  // graph either way, so the strip's toggle has nothing to fetch.
  test.each([
    ['RgfaTabixAdapter', 0],
    ['GbzBaseSyntenyAdapter', 1],
  ])('the walk strip on a %s track cuts again %i times', async (type, n) => {
    rpcRespond()
    mockSession.tracks = [{ trackId: 'rgfa-track', adapter: { type } }]
    const model = attachedModel({
      layoutMode: 'force',
      loadedTrackId: 'rgfa-track',
      loadedRegion: TEST_REGION,
    })
    await vi.waitFor(() => {
      expect(model.graph).toBeDefined()
    })
    const cuts = () =>
      mockRpcCall.mock.calls.filter(c => c[1] === 'GetSubgraph').length
    const before = cuts()
    model.setWalkStrip(!model.walkStrip)
    await layoutsSettled(model)
    expect(cuts()).toBe(before + n)
  })

  test('a stated track the session lacks is reported without a fetch', async () => {
    mockSession.tracks = []
    const model = restoredView()
    await model.load()
    expect(String(model.error)).toMatch(/not in this session/)
    expect(mockRpcCall).not.toHaveBeenCalled()
  })

  test('keeps a restored pan and zoom', async () => {
    rpcRespond()
    const model = restoredView({ scale: 3.5, translateX: 120, translateY: 80 })
    await model.load()
    expect(model.graph!.nodes.length).toBeGreaterThan(0)
    expect(model.scale).toBe(3.5)
    expect(model.translateX).toBe(120)
    expect(model.translateY).toBe(80)
  })

  // saved in a wider window than the pane's width before it is measured
  test('keeps a restored view placed past the unmeasured width', async () => {
    rpcRespond()
    const model = restoredView()
    // a root model never attaches, so the restored view is placed by hand
    model.setTransform(2, 1200, 80)
    await model.load()
    expect(model.viewportOwner).toBe('user')
    expect(model.translateX).toBe(1200)
  })

  test('a restored view off a narrower pane is pulled back in, not refitted', async () => {
    rpcRespond()
    const model = restoredView()
    model.setTransform(2, 1200, 80)
    await model.load()
    model.startRenderingBackend(fakeRenderer())
    model.setWidth(600)
    expect(model.viewportOwner).toBe('user')
    expect(model.scale).toBe(2)
    // a drawing narrower than the margin comes back whole, against the edge
    const b = model.layoutBounds!
    const left = b.minX * model.scaleX + model.translateX
    expect(left + b.w * model.scaleX).toBeCloseTo(600, 6)
  })
})

describe('formatSpanBp', () => {
  test('reports Mb at and above a megabase, kb below it', () => {
    expect(formatSpanBp(MAX_GRAPH_REGION_BP)).toBe('5 Mb')
    expect(formatSpanBp(4_900_000)).toBe('4.9 Mb')
    expect(formatSpanBp(1_000_000)).toBe('1 Mb')
    expect(formatSpanBp(999_999)).toBe('1000 kb')
    expect(formatSpanBp(60_000)).toBe('60 kb')
  })
})

describe('region size cap on a stated cut', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = [TEST_TRACK]
  })

  test('declines regions over the cap without an RPC call', async () => {
    rpcRespond()
    const model = restoredView({
      loadedRegion: { ...TEST_REGION, start: 0, end: MAX_GRAPH_REGION_BP + 1 },
    })
    await model.load()
    expect(model.graph).toBeUndefined()
    expect(String(model.error)).toMatch(/zoom in/i)
    expect(mockRpcCall).not.toHaveBeenCalled()
  })

  // A level-of-detail tier breaks the bp proxy: a whole 249 Mb chromosome is
  // 474 nodes off the hosted HPRC tier. maxGraphNodes still counts what came
  // back.
  test('a session can raise the bp cap for a coarse tier', async () => {
    rpcRespond()
    const model = restoredView({
      maxRegionBp: 250_000_000,
      loadedRegion: { ...TEST_REGION, start: 0, end: 248_956_422 },
    })
    await model.load()
    expect(model.error).toBeUndefined()
    expect(mockRpcCall).toHaveBeenCalled()
  })

  test('accepts a region exactly at the cap', async () => {
    rpcRespond()
    const model = restoredView({
      loadedRegion: { ...TEST_REGION, start: 0, end: MAX_GRAPH_REGION_BP },
    })
    await model.load()
    expect(model.graph).toBeDefined()
    expect(model.error).toBeUndefined()
  })
})

describe('empty subgraph handling', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  test('sets an error when the adapter returns no GFA', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? Promise.resolve('')
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createModel()
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    expect(model.graph).toBeUndefined()
    expect(model.error).toBeInstanceOf(Error)
    expect(String(model.error)).toMatch(/no GFA/i)
    expect(model.isLoading).toBe(false)
    consoleSpy.mockRestore()
  })
})

describe('loadGFAFromLocation', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockReadFile.mockReset()
  })

  const location = {
    uri: 'https://example.com/graphs/small.gfa',
    locationType: 'UriLocation' as const,
  }

  test('is loading while the file is still being fetched', async () => {
    rpcRespond()
    let respond = (_text: string) => {}
    mockReadFile.mockReturnValue(
      new Promise<string>(resolve => {
        respond = resolve
      }),
    )
    const model = createModel()
    const load = model.loadGFAFromLocation(location)

    expect(model.isLoading).toBe(true)
    expect(model.statusMessage).toBe('Fetching GFA')

    respond(SIMPLE_GFA)
    await load
    expect(model.isLoading).toBe(false)
    expect(model.nodeCount).toBe(2)
  })

  test('a failed fetch ends the load with its error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockReadFile.mockRejectedValue(new Error('404'))
    const model = createModel()
    await model.loadGFAFromLocation(location)

    expect(model.isLoading).toBe(false)
    expect(String(model.error)).toMatch(/404/)
  })

  test('a picked file loads with the view loading while it is read', async () => {
    rpcRespond()
    const model = createModel()
    const load = model.loadGFAFile(new Blob([SIMPLE_GFA]), 'picked.gfa')
    expect(model.isLoading).toBe(true)
    expect(model.statusMessage).toBe('Reading file')
    await load
    expect(model.nodeCount).toBe(2)
  })

  test('a url opened from the import form is the source a saved session reopens', async () => {
    rpcRespond()
    mockReadFile.mockResolvedValue(SIMPLE_GFA)
    const model = stateModelFactory().create({ type: 'GraphGenomeView' })
    await model.openGfaLocation(location)
    expect(model.nodeCount).toBe(2)
    expect(getSnapshot(model).gfaLocation).toEqual(location)
    expect(model.displayName).toBe('small.gfa')
  })

  test('a url opened after clearing names the view by its own file', async () => {
    rpcRespond()
    mockReadFile.mockResolvedValue(SIMPLE_GFA)
    const model = stateModelFactory().create({ type: 'GraphGenomeView' })
    await model.openGfaLocation(location)
    model.clearGraph()
    await model.openGfaLocation({
      ...location,
      uri: 'https://example.com/b.gfa',
    })
    expect(model.displayName).toBe('b.gfa')

    model.setDisplayName('my graph')
    model.clearGraph()
    expect(model.displayName).toBe('my graph')
  })

  test('a url that fails to open stays out of the saved session', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockReadFile.mockRejectedValue(new Error('404'))
    const model = stateModelFactory().create({ type: 'GraphGenomeView' })
    await model.openGfaLocation(location)
    expect(String(model.error)).toMatch(/404/)
    expect(model.gfaLocation).toBeUndefined()
    expect(model.canRetryLoad).toBe(false)
  })

  test('the region a file was stated beside outlives a failed fetch, so a retry has it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    rpcRespond()
    mockReadFile.mockRejectedValueOnce(new Error('404'))
    mockReadFile.mockResolvedValue(SIMPLE_GFA)
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      gfaLocation: location,
      loadedRegion: TEST_REGION,
    })
    await model.load()
    expect(String(model.error)).toMatch(/404/)

    model.retryLoad()
    await vi.waitFor(() => {
      expect(model.nodeCount).toBe(2)
    })
    expect(model.error).toBeUndefined()
    expect(model.graphRegion).toEqual(TEST_REGION)
  })

  test('a gene track in tabix shorthand turns genes on', async () => {
    rpcRespond()
    mockReadFile.mockResolvedValue(SIMPLE_GFA)
    mockSession.tracks = [
      {
        trackId: 'ncbiRefSeq',
        name: 'NCBI RefSeq',
        assemblyNames: ['hg38'],
        adapter: {
          type: 'Gff3TabixAdapter',
          uri: 'https://jbrowse.org/ucsc/hg38/ncbiRefSeq.gff.gz',
          csi: true,
        },
      },
    ]
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      gfaLocation: location,
      loadedRegion: TEST_REGION,
    })
    await model.load()
    expect(model.showGenes).toBe(true)
    expect(model.geneTrack?.trackId).toBe('ncbiRefSeq')
    mockSession.tracks = []
  })

  test('canceling aborts the fetch without reporting an error', async () => {
    mockReadFile.mockImplementation(
      ({ signal }: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'))
          })
        }),
    )
    const model = createModel()
    const load = model.loadGFAFromLocation(location)
    model.cancelLoad()
    await load

    expect(model.loadCanceled).toBe(true)
    expect(model.isLoading).toBe(false)
    expect(model.error).toBeUndefined()
  })
})

// The bp cap bounds the fetch, but cost tracks node count and bp-per-node varies
// by orders of magnitude between graph types, so a dense graph clears the bp cap
// and still swamps the renderer. The import path had no cap of any kind.
describe('node budget', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  function withLimit(limit: number) {
    const model = createModel()
    applySnapshot(model, { ...getSnapshot(model), maxGraphNodes: limit })
    return model
  }

  test('declines a graph over the budget without laying it out', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    rpcRespond()
    const model = withLimit(1)

    await model.loadGFA(SIMPLE_GFA, 'two nodes')

    expect(model.layoutResult).toBeUndefined()
    expect(String(model.error)).toMatch(/too large to draw/i)
    expect(String(model.error)).toMatch(/2 nodes/)
    // the layout is downstream of the check, so it must not have run
    expect(
      mockRpcCall.mock.calls.filter(c => c[1] === 'GraphComputeLayout'),
    ).toHaveLength(0)
    expect(model.isLoading).toBe(false)
    consoleSpy.mockRestore()
  })

  test('the refusal offers walk rows only to a graph with walks', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    rpcRespond()
    const bare = withLimit(1)
    await bare.loadGFA(SIMPLE_GFA, 'two nodes')
    const walked = withLimit(1)
    await walked.loadGFA(WALKED_GFA, 'two nodes')

    expect(String(bare.error)).not.toMatch(/walk rows/i)
    expect(String(walked.error)).toMatch(/walk rows/i)
    consoleSpy.mockRestore()
  })

  test('a layout that lands clears the error the last one raised', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    rpcRespond()
    const model = withLimit(1)
    await model.loadGFA(WALKED_GFA, 'two nodes')
    expect(String(model.error)).toMatch(/too large to draw/i)

    await model.switchLayout('walkrows')

    expect(model.error).toBeUndefined()
    consoleSpy.mockRestore()
  })

  // walk rows hand a graph with no walks to the force engine, which draws
  // every node
  test('walk rows of a graph with no walks keep the budget', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    rpcRespond()
    const model = withLimit(1)
    model.setLayoutMode('walkrows')
    await model.loadGFA(SIMPLE_GFA, 'two nodes')
    expect(String(model.error)).toMatch(/too large to draw/i)
    expect(
      mockRpcCall.mock.calls.filter(c => c[1] === 'GraphComputeLayout'),
    ).toHaveLength(0)
    consoleSpy.mockRestore()
  })

  test('a declined graph does not keep the last graph drawn under it', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    rpcRespond()
    const model = withLimit(2)
    await model.loadGFA(SIMPLE_GFA, 'two nodes')
    expect(model.layoutResult).toBeDefined()

    await model.loadGFA(
      'H\tVN:Z:1.0\nS\t1\tACGT\nS\t2\tGGCC\nS\t3\tTT\nL\t1\t+\t2\t+\t0M\nL\t2\t+\t3\t+\t0M\n',
      'three nodes',
    )

    expect(String(model.error)).toMatch(/too large to draw/i)
    expect(model.graph!.nodes).toHaveLength(3)
    expect(model.layoutResult).toBeUndefined()
    expect(model.drawnLayoutMode).toBeUndefined()
    consoleSpy.mockRestore()
  })

  test('walk rows draw a graph over the budget, since they draw no nodes', async () => {
    rpcRespond()
    const model = withLimit(1)
    model.setLayoutMode('walkrows')
    await model.loadGFA(WALKED_GFA, 'two nodes')
    expect(model.error).toBeUndefined()
    expect(model.layoutResult).toBeDefined()
  })

  test('draws the same graph once the budget is raised', async () => {
    rpcRespond()
    const model = withLimit(10)

    await model.loadGFA(SIMPLE_GFA, 'two nodes')

    expect(model.graph).toBeDefined()
    expect(model.error).toBeUndefined()
  })
})

describe('annotation reads beside a cut', () => {
  const gene = (name: string) => ({
    name,
    refName: 'chr1',
    start: 1100,
    end: 1900,
  })
  const track = (trackId: string, name: string, type: string) => ({
    trackId,
    name,
    assemblyNames: ['hg38'],
    adapter: { type, tag: trackId },
  })
  const bySlot = (obj: Record<string, unknown>, key?: unknown) =>
    obj[String(key)]
  const adapterOnly = (obj: Record<string, unknown>, key?: unknown) =>
    key === 'adapter' ? obj.adapter : undefined

  // each CoreGetFeatures read, held open until the test settles it
  let reads: { tag: unknown; settle: (features: unknown[]) => void }[]
  const readOf = (tag: string) => reads.findLast(r => r.tag === tag)!
  const subgraphCuts = () =>
    mockRpcCall.mock.calls.filter(c => c[1] === 'GetSubgraph').length

  beforeEach(() => {
    reads = []
    vi.mocked(readConfObject).mockImplementation(bySlot)
    mockSession.tracks = [
      track('rgfa-track', 'graph', 'RgfaTabixAdapter'),
      track('genes-a', 'Genes A', 'Gff3TabixAdapter'),
      track('genes-b', 'Genes B', 'Gff3TabixAdapter'),
      track('trgt', 'TRGT repeats', 'BedTabixAdapter'),
    ]
    mockRpcCall.mockReset()
    mockRpcCall.mockImplementation(
      (_sid: unknown, method: string, args: Record<string, unknown>) => {
        if (method === 'GetSubgraph') {
          return Promise.resolve(SIMPLE_GFA)
        }
        if (method === 'GraphComputeLayout') {
          return Promise.resolve({ result: MOCK_LAYOUT, duration: 5 })
        }
        return new Promise(resolve => {
          const config = args.adapterConfig as { tag?: unknown; type: string }
          reads.push({ tag: config.tag ?? config.type, settle: resolve })
        })
      },
    )
  })

  afterEach(() => {
    vi.mocked(readConfObject).mockImplementation(adapterOnly)
    mockSession.tracks = []
  })

  function cut(model: ReturnType<typeof createModel>) {
    return model.cutSubgraph(
      { type: 'RgfaTabixAdapter', uri: 'https://example.com/graph' },
      TEST_REGION,
    )
  }

  async function cutAndSettle(model: ReturnType<typeof createModel>) {
    const loaded = cut(model)
    await vi.waitFor(() => {
      expect(reads).toHaveLength(3)
    })
    for (const read of reads) {
      read.settle([])
    }
    await loaded
  }

  test('the bubble, gene and repeat reads go out together', async () => {
    const model = attachedModel()
    const loaded = cut(model)
    // in turn, only one would ever be outstanding
    await vi.waitFor(() => {
      expect(reads.map(r => r.tag)).toEqual([
        'MinigraphBubbleAdapter',
        'genes-a',
        'trgt',
      ])
    })
    expect(model.isLoading).toBe(true)
    readOf('genes-a').settle([gene('ABC1')])
    await vi.waitFor(() => {
      expect(model.geneFeatures?.map(g => g.name)).toEqual(['ABC1'])
    })
    expect(model.isLoading).toBe(true)
    readOf('MinigraphBubbleAdapter').settle([])
    readOf('trgt').settle([])
    await loaded
    expect(model.isLoading).toBe(false)
    expect(model.error).toBeUndefined()
  })

  // most graphs have no bubble index, and a pan re-cuts many times
  test('a bubble index that failed to read is not asked for again', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const bubbleReads = () =>
      mockRpcCall.mock.calls.filter(
        c =>
          (c[2] as { adapterConfig?: { type?: string } }).adapterConfig
            ?.type === 'MinigraphBubbleAdapter',
      ).length
    const respond = mockRpcCall.getMockImplementation()!
    mockRpcCall.mockImplementation(
      (sid: unknown, method: string, args: Record<string, unknown>) =>
        (args.adapterConfig as { type?: string } | undefined)?.type ===
        'MinigraphBubbleAdapter'
          ? Promise.reject(new Error('404'))
          : respond(sid, method, args),
    )
    const model = attachedModel()
    const settleAll = async () => {
      await vi.waitFor(() => {
        expect(reads.length).toBeGreaterThanOrEqual(2)
      })
      for (const read of reads.splice(0)) {
        read.settle([])
      }
    }
    let loaded = cut(model)
    await settleAll()
    await loaded
    expect(bubbleReads()).toBe(1)
    loaded = cut(model)
    await settleAll()
    await loaded
    expect(bubbleReads()).toBe(1)
    warn.mockRestore()
  })

  test('a cut too large to draw still reads its genes, for when the limit is raised', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const model = attachedModel()
    model.setMaxGraphNodes(1)
    const loaded = cut(model)
    await vi.waitFor(() => {
      expect(reads.map(r => r.tag)).toContain('genes-a')
    })
    readOf('genes-a').settle([gene('ABC1')])
    await loaded
    expect(String(model.error)).toMatch(/too large to draw/i)
    await vi.waitFor(() => {
      expect(model.geneFeatures?.map(g => g.name)).toEqual(['ABC1'])
    })
  })

  test('picking another gene track reads it and leaves the graph alone', async () => {
    const model = attachedModel()
    await cutAndSettle(model)
    const { graph, layoutResult } = model

    model.setGeneTrackId('genes-b')
    await vi.waitFor(() => {
      expect(reads.map(r => r.tag)).toContain('genes-b')
    })
    readOf('genes-b').settle([gene('XYZ2')])
    await vi.waitFor(() => {
      expect(model.geneFeatures?.map(g => g.name)).toEqual(['XYZ2'])
    })
    expect(subgraphCuts()).toBe(1)
    expect(model.graph).toBe(graph)
    expect(model.layoutResult).toBe(layoutResult)
  })

  test("a track configured on an alias of the cut's assembly is offered", async () => {
    mockSession.assemblyNames = ['hg38']
    mockSession.assemblyAliases = { GRCh38: 'hg38' }
    mockSession.tracks[1]!.assemblyNames = ['GRCh38']
    const model = attachedModel()
    await cutAndSettle(model)
    expect(model.geneTrackChoices.map(t => t.trackId)).toContain('genes-a')
    mockSession.assemblyNames = []
    mockSession.assemblyAliases = {}
  })

  test('a file stated beside a region reads its annotations inside its load', async () => {
    mockReadFile.mockResolvedValue(SIMPLE_GFA)
    const model = attachedModel()
    const loaded = model.loadGFAFromLocation(
      { uri: 'https://example.com/g.gfa', locationType: 'UriLocation' },
      TEST_REGION,
    )
    await vi.waitFor(() => {
      expect(reads.map(r => r.tag)).toEqual(['genes-a', 'trgt'])
    })
    expect(model.isLoading).toBe(true)
    const featureReads = mockRpcCall.mock.calls.filter(
      c => c[1] === 'CoreGetFeatures',
    )
    expect(featureReads.map(c => c[2].signal)).toEqual([
      expect.any(AbortSignal),
      expect.any(AbortSignal),
    ])

    readOf('genes-a').settle([gene('ABC1')])
    readOf('trgt').settle([])
    await loaded
    expect(model.isLoading).toBe(false)
    expect(model.geneFeatures?.map(g => g.name)).toEqual(['ABC1'])
  })

  test('a slow gene read does not land over the pick that followed it', async () => {
    const model = attachedModel()
    await cutAndSettle(model)

    model.setGeneTrackId('genes-b')
    model.setGeneTrackId('genes-a')
    await vi.waitFor(() => {
      expect(reads.filter(r => r.tag === 'genes-a')).toHaveLength(2)
    })
    readOf('genes-a').settle([gene('ABC1')])
    await vi.waitFor(() => {
      expect(model.geneFeatures?.map(g => g.name)).toEqual(['ABC1'])
    })
    readOf('genes-b').settle([gene('XYZ2')])
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(model.geneFeatures?.map(g => g.name)).toEqual(['ABC1'])
  })

  test('picking another gene track aborts the read of the one it replaced', async () => {
    const model = attachedModel()
    await cutAndSettle(model)

    model.setGeneTrackId('genes-b')
    model.setGeneTrackId('genes-a')
    await vi.waitFor(() => {
      expect(reads.filter(r => r.tag === 'genes-a')).toHaveLength(2)
    })
    const [replaced, chosen] = mockRpcCall.mock.calls
      .filter(c => c[1] === 'CoreGetFeatures')
      .slice(-2)
      .map(c => c[2].signal)
    expect(replaced).toMatchObject({ aborted: true })
    expect(chosen).toMatchObject({ aborted: false })
  })

  test("a cut's gene read does not land over a track picked during it", async () => {
    const model = attachedModel()
    const loaded = cut(model)
    await vi.waitFor(() => {
      expect(reads).toHaveLength(3)
    })
    model.setGeneTrackId('genes-b')
    await vi.waitFor(() => {
      expect(reads.map(r => r.tag)).toContain('genes-b')
    })
    readOf('genes-b').settle([gene('XYZ2')])
    readOf('genes-a').settle([gene('ABC1')])
    readOf('MinigraphBubbleAdapter').settle([])
    readOf('trgt').settle([])
    await loaded

    expect(model.geneFeatures?.map(g => g.name)).toEqual(['XYZ2'])
  })
})

// GRCh38 runs 1>2>4 over chr1:1000-5000; HG002#1 takes 3 for 2, HG003#1
// follows GRCh38
const WALK_TABLES: GraphTables = {
  nodes: {
    names: ['1', '2', '3', '4'],
    lengths: Int32Array.of(1000, 1000, 400, 2000),
    refs: Int32Array.of(0, 0, 1, 0),
    starts: Float64Array.of(1000, 2000, 0, 3000),
    ranks: Int32Array.of(0, 0, 1, 0),
    refNames: ['chr1', 'HG002#1#chr1'],
  },
  links: {
    from: Int32Array.of(0, 0, 1, 2),
    to: Int32Array.of(1, 2, 3, 3),
    strands: new Uint8Array(4),
  },
  walks: {
    names: ['GRCh38#0#chr1', 'HG002#1#chr1', 'HG003#1#chr1'],
    starts: Float64Array.of(1000, 0, 0),
    ends: Float64Array.of(5000, 3400, 4000),
    offsets: Int32Array.of(0, 3, 6, 9),
    steps: Int32Array.of(0, 1, 3, 0, 2, 3, 0, 1, 3),
    reversed: new Uint8Array(9),
  },
  departures: departureTable(),
}

describe('a walk-file cut', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = [
      {
        ...TEST_TRACK,
        adapter: {
          type: 'WalkTabixSyntenyAdapter',
          assemblyNameToPanSN: { hg38: 'GRCh38' },
        },
      },
    ]
    mockRpcCall.mockImplementation(
      (_sid: unknown, method: string, args: { opts: SubgraphCutOptions }) =>
        method === 'GetSubgraph'
          ? Promise.resolve(
              walkCutFor(WALK_TABLES, TEST_REGION, args.opts.walkRows),
            )
          : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
  })

  test.each(['walkrows', 'auto'])(
    'names its walk on the cut assembly as the reference, under %s',
    async layoutMode => {
      const model = restoredView({ layoutMode })
      await model.load()
      expect(model.graph!.anchoredBy).toBe('tags')
      expect(model.graph!.referencePath).toBe('GRCh38#0#chr1')
    },
  )

  test("measures a lifted walk against the reference's", async () => {
    const model = restoredView({ layoutMode: 'auto' })
    await model.load()
    expect(walkHighlight(model.graph!, 'HG002#1#chr1')).toMatchObject({
      bp: 3400,
      referenceBp: 4000,
    })
  })

  test('is asked for in walk rows, and draws the rows walkRows makes', async () => {
    const model = restoredView({ layoutMode: 'walkrows' })
    await model.load()
    expect(mockRpcCall).toHaveBeenCalledWith(
      expect.any(String),
      'GetSubgraph',
      expect.objectContaining({
        opts: expect.objectContaining({ walkRows: true }),
      }),
    )
    const whole = loadGraph(WALK_TABLES, 'whole')
    const bars = walkRows(whole, TEST_REGION)!
    expect(model.walkRowBars?.reference).toEqual(bars.reference)
    expect(model.walkRowBars?.rows).toEqual(bars.rows)
    expect(model.graph!.paths!.slice(1).map(p => p.nodeIds)).toEqual([[], []])
    expect(model.graph!.nodes.map(n => n.depth)).toEqual(
      whole.nodes.map(n => n.depth),
    )
  })

  // HG004#1 leaves the reference at 1500 and rejoins it at 4500 with no step
  // between, so its row is a hairline of no bp
  test("a stepless row's hairline takes the pointer along its length", async () => {
    mockRpcCall.mockImplementation(
      (_sid: unknown, method: string, args: { opts: SubgraphCutOptions }) =>
        method === 'GetSubgraph'
          ? Promise.resolve(
              walkCutFor(
                {
                  ...WALK_TABLES,
                  departures: departureTable([
                    {
                      name: 'HG004#1#chr1',
                      hapStart: 500,
                      ownBp: 0,
                      missingBp: 0,
                      leavePos: 1500,
                      leaveReversed: false,
                      leavePasses: 1,
                      rejoinPos: 4500,
                      rejoinReversed: false,
                      rejoinPasses: 1,
                      fromSteps: false,
                    },
                  ]),
                },
                TEST_REGION,
                args.opts.walkRows,
              ),
            )
          : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = restoredView({ layoutMode: 'walkrows' })
    await model.load()
    const rows = model.walkRowList
    const i = rows.findIndex(r => r.stepless)
    const row = rows[i]!
    const run = row.runs[0]!
    expect(row.bp).toBe(0)
    expect(run).toMatchObject({ start: 500, bp: 3000 })
    const x =
      (model.walkRowBars!.origin + run.start + run.bp / 2) * model.scaleX +
      model.translateX
    const y = model.walkRowPlacement!.rowY(i) * model.scaleY + model.translateY
    expect(model.walkRowAt(x, y)).toBe(i)
  })

  test('parses its walks whole for a layout that draws nodes', async () => {
    const model = restoredView({ layoutMode: 'walkrows' })
    await model.load()
    model.setLayoutMode('auto')
    await model.recomputeLayout()
    expect(model.walkCut).toBeUndefined()
    expect(model.graph!.paths).toEqual(loadGraph(WALK_TABLES, 'whole').paths)
  })
})
