import stateModelFactory from './viewModel'

const mockRpcCall = vi.fn()
const mockSession = {
  tracks: [] as Record<string, unknown>[],
  rpcManager: { call: mockRpcCall },
  assemblyManager: {
    has: () => false,
    assemblyList: [] as { name: string; aliases: string[] }[],
  },
}

vi.mock('@jbrowse/core/util', () => ({
  getSession: () => mockSession,
  getContainingView: () => {
    throw new Error('no containing view found')
  },
  getContainingTrack: () => {
    throw new Error('not in a track')
  },
  getRpcSessionId: () => 'test',
  isSessionModelWithWidgets: () => false,
  parseLocString: () => ({}),
  getEnv: () => ({}),
  useWidthSetter: () => {},
  measureText: () => 0,
  IntervalTree: class {},
  getSnapshot: () => ({}),
  applySnapshot: () => {},
  objectHash: () => '',
}))

vi.mock(import('@jbrowse/core/configuration'), async importOriginal => ({
  ...(await importOriginal()),
  readConfObject: vi.fn(
    (obj: Record<string, unknown>, key: string) => obj[key],
  ),
}))

// pangenome_hprc's segments track once NA20809 haplotype 2 is loaded
const TRACK = {
  trackId: 'segments',
  assemblyNames: ['hg38', 'NA20809.2'],
  adapter: { type: 'RgfaTabixAdapter' },
}

// A GRCh38 backbone s1, s3 and one NA20809#2 allele between them, which is what
// the adapter returns for a window on either assembly.
const GFA = [
  'H\tVN:Z:1.0',
  'S\ts1\t*\tLN:i:1000\tSN:Z:GRCh38#0#chr6\tSO:i:32000000\tSR:i:0',
  'S\ts3\t*\tLN:i:900\tSN:Z:GRCh38#0#chr6\tSO:i:32001100\tSR:i:0',
  'S\th1\t*\tLN:i:200\tSN:Z:NA20809#2#CM094351.1\tSO:i:31901000\tSR:i:1',
  'L\ts1\t+\th1\t+\t0M',
  'L\th1\t+\ts3\t+\t0M',
].join('\n')

const ON_HG38 = {
  refName: 'chr6',
  assemblyName: 'hg38',
  start: 32_000_000,
  end: 32_002_000,
}

const ON_NA20809 = {
  refName: 'CM094351.1',
  assemblyName: 'NA20809.2',
  start: 31_900_900,
  end: 31_901_300,
}

function createView(snapshot: Record<string, unknown> = {}) {
  return stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'auto',
    ...snapshot,
  } as never)
}

async function cut(region: typeof ON_HG38, gfa = GFA) {
  mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
    method === 'GetSubgraph'
      ? Promise.resolve(gfa)
      : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
  )
  const model = createView({
    loadedTrackId: TRACK.trackId,
    loadedRegion: region,
  })
  await model.load()
  return model
}

beforeEach(() => {
  mockRpcCall.mockReset()
  mockSession.tracks = [TRACK]
  mockSession.assemblyManager.assemblyList = []
})

test('a cut on the reference draws', async () => {
  const model = await cut(ON_HG38)
  expect(model.error).toBeUndefined()
  expect(model.nodeCount).toBe(3)
})

// Framed on NA20809.2's contig, the anchored layouts, the colour ramp and every
// highlight would put GRCh38 coordinates on CM094351.1.
test('a cut on another assembly the track names is refused, naming the reference', async () => {
  const model = await cut(ON_NA20809)
  expect(String(model.error)).toMatch(/cut on its reference, hg38/)
  expect(model.hasGraph).toBe(false)
  expect(mockRpcCall).not.toHaveBeenCalled()
})

test('a cut that finds no segments is an error, not an empty graph', async () => {
  const model = await cut(ON_HG38, 'H\tVN:Z:1.0')
  expect(String(model.error)).toMatch(/No graph segments/)
  expect(model.hasGraph).toBe(false)
})

describe('overlapping cuts', () => {
  const TWO_NODES = [
    'H\tVN:Z:1.0',
    'S\ta1\t*\tLN:i:10\tSN:Z:GRCh38#0#chr6\tSO:i:100\tSR:i:0',
    'S\ta2\t*\tLN:i:10\tSN:Z:GRCh38#0#chr6\tSO:i:110\tSR:i:0',
    'L\ta1\t+\ta2\t+\t0M',
  ].join('\n')
  const THREE_NODES = [
    'H\tVN:Z:1.0',
    'S\tb1\t*\tLN:i:10\tSN:Z:GRCh38#0#chr6\tSO:i:100\tSR:i:0',
    'S\tb2\t*\tLN:i:10\tSN:Z:GRCh38#0#chr6\tSO:i:110\tSR:i:0',
    'S\tb3\t*\tLN:i:10\tSN:Z:GRCh38#0#chr6\tSO:i:120\tSR:i:0',
    'L\tb1\t+\tb2\t+\t0M',
    'L\tb2\t+\tb3\t+\t0M',
  ].join('\n')

  // Two re-cuts in flight at once, the way two quick changes in the settings
  // dialog leave them, each answered when the test says.
  function twoCuts() {
    const pending: ((gfa: string) => void)[] = []
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? new Promise<string>(resolve => {
            pending.push(resolve)
          })
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createView({
      loadedTrackId: TRACK.trackId,
      loadedRegion: { ...ON_HG38, start: 0, end: 200 },
    })
    const first = model.load()
    const second = model.load()
    return { model, pending, first, second }
  }

  test('the later cut wins when the earlier one finishes last', async () => {
    const { model, pending, first, second } = twoCuts()
    pending[1]!(THREE_NODES)
    await second
    pending[0]!(TWO_NODES)
    await first
    expect(model.nodeCount).toBe(3)
  })

  test('the spinner stays up until the live cut lands', async () => {
    const { model, pending, first, second } = twoCuts()
    pending[0]!(TWO_NODES)
    await first
    expect(model.isLoading).toBe(true)
    pending[1]!(THREE_NODES)
    await second
    expect(model.isLoading).toBe(false)
    expect(model.nodeCount).toBe(3)
  })
})

describe('canceling and retrying', () => {
  function pendingCuts() {
    const pending: ((gfa: string) => void)[] = []
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? new Promise<string>(resolve => {
            pending.push(resolve)
          })
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    return pending
  }

  function cutSignal(index: number) {
    return (mockRpcCall.mock.calls[index]![2] as { signal: AbortSignal }).signal
  }

  function launchedView() {
    return createView({ loadedTrackId: TRACK.trackId, loadedRegion: ON_HG38 })
  }

  test('canceling a first cut aborts it, and its late answer never lands', async () => {
    const pending = pendingCuts()
    const model = launchedView()
    const load = model.load()
    expect(model.canCancelLoad).toBe(true)

    model.cancelLoad()
    expect(cutSignal(0).aborted).toBe(true)
    expect(model.isLoading).toBe(false)
    expect(model.loadCanceled).toBe(true)

    pending[0]!(GFA)
    await load
    expect(model.hasGraph).toBe(false)
    expect(model.error).toBeUndefined()
  })

  test('retry cuts the same region again', async () => {
    pendingCuts()
    const model = launchedView()
    void model.load()
    model.cancelLoad()

    mockRpcCall.mockResolvedValue(GFA)
    model.retryLoad()
    expect(model.loadCanceled).toBe(false)
    await vi.waitFor(() => {
      expect(model.nodeCount).toBe(3)
    })
  })

  test('a newer cut aborts the one it replaces', () => {
    pendingCuts()
    const model = launchedView()
    void model.load()
    void model.load()
    expect(cutSignal(0).aborted).toBe(true)
    expect(cutSignal(1).aborted).toBe(false)
  })

  test('a reload over a drawn graph cannot be canceled', async () => {
    const model = await cut(ON_HG38)
    pendingCuts()
    void model.load()
    expect(model.canCancelLoad).toBe(false)

    model.cancelLoad()
    expect(model.isLoading).toBe(true)
    expect(model.nodeCount).toBe(3)
  })

  test('a stored track the session no longer has is reported', async () => {
    mockSession.tracks = []
    const model = launchedView()
    await model.load()
    expect(String(model.error)).toMatch(/"segments", is not in this session/)
    expect(model.canRetryLoad).toBe(true)
    expect(mockRpcCall).not.toHaveBeenCalled()
  })
})

describe('reads', () => {
  const READS_TRACK = {
    trackId: 'gbz',
    assemblyNames: ['hg38'],
    adapter: { type: 'GbzBaseSyntenyAdapter', reads: 'reads.gaf.gz' },
  }
  const PATHS = [
    'H\tVN:Z:1.0',
    'S\t1\tACGT',
    'S\t2\tA',
    'S\t3\tG',
    'S\t4\tTTGCA',
    'L\t1\t+\t2\t+\t0M',
    'L\t1\t+\t3\t+\t0M',
    'L\t2\t+\t4\t+\t0M',
    'L\t3\t+\t4\t+\t0M',
    'P\thg38\t1+,2+,4+\t*',
    'P\talt\t1+,3+,4+\t*',
  ].join('\n')
  const READ = {
    name: 'r1',
    queryLength: 7,
    queryStart: 0,
    queryEnd: 7,
    strand: '+',
    path: [
      { name: '1', strand: '+' },
      { name: '3', strand: '+' },
      { name: '4', strand: '+' },
    ],
    pathLength: 10,
    pathStart: 1,
    pathEnd: 8,
    matches: 7,
    blockLength: 7,
    mappingQuality: 60,
    secondary: false,
  }

  function cutWithReads(reads: () => Promise<unknown>) {
    mockSession.tracks = [READS_TRACK]
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? Promise.resolve(PATHS)
        : method === 'GetGraphReads'
          ? reads()
          : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createView({
      layoutMode: 'tubemap',
      loadedTrackId: READS_TRACK.trackId,
      loadedRegion: ON_HG38,
    })
    return model.load().then(() => model)
  }

  test('a track naming reads fetches them over the cut before its layout', async () => {
    const model = await cutWithReads(() =>
      Promise.resolve({ records: [READ], total: 3 }),
    )
    expect(model.error).toBeUndefined()
    const [, method, args] = mockRpcCall.mock.calls.find(
      ([, m]) => m === 'GetGraphReads',
    )!
    expect(method).toBe('GetGraphReads')
    expect((args as { nodeNames: string[] }).nodeNames.sort()).toEqual([
      '1',
      '2',
      '3',
      '4',
    ])
    expect(model.graph?.reads).toEqual([READ])
    expect(model.readsShown).toEqual({ shown: 1, total: 3 })
    expect(model.layoutResult?.tubeMap?.layout.reads).toHaveLength(1)
    // the reads take the reds and blues, so the boxes stay clear
    model.setColorScheme('reference-position')
    expect(model.effectiveColorScheme).toBe('uniform')
    expect(model.tubeMapNodeColors).toBeUndefined()
    expect(model.colorSchemeLock?.value).toBe('By strand')
  })

  // A tube map draws the window alone, so its ramp key speaks for its boxes:
  // h0 is an allele before the window that the tube map trims away
  test("a tube map's ramp key names no node the window trimmed away", async () => {
    const OUTSIDE = [
      'H\tVN:Z:1.0',
      'S\ts0\t*\tLN:i:1000\tSN:Z:GRCh38#0#chr6\tSO:i:31999000\tSR:i:0',
      'S\th0\t*\tLN:i:50\tSN:Z:NA20809#2#CM094351.1\tSO:i:31900000\tSR:i:1',
      'S\ts1\t*\tLN:i:1000\tSN:Z:GRCh38#0#chr6\tSO:i:32000000\tSR:i:0',
      'S\ts2\t*\tLN:i:1000\tSN:Z:GRCh38#0#chr6\tSO:i:32001000\tSR:i:0',
      'L\ts0\t+\th0\t+\t0M',
      'L\th0\t+\ts1\t+\t0M',
      'L\ts0\t+\ts1\t+\t0M',
      'L\ts1\t+\ts2\t+\t0M',
      'P\tref\ts0+,s1+,s2+\t*',
      'P\talt\ts0+,h0+,s1+,s2+\t*',
    ].join('\n')
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? Promise.resolve(OUTSIDE)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createView({
      layoutMode: 'tubemap',
      color: { field: 'position' },
      loadedTrackId: TRACK.trackId,
      loadedRegion: ON_HG38,
    })
    await model.load()

    const drawn = model.tubeMapPicture!.nodes.map(n => n.name)
    const h0 = model.graph!.nodes.find(n => n.name === 'h0')!
    expect(drawn).not.toContain(h0.id)
    expect(model.referenceRampOffKeys.offReference).toBe(false)
  })

  test('reads that fail to load leave the graph drawn without them', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const model = await cutWithReads(() =>
      Promise.reject(new Error('no index')),
    )
    expect(model.error).toBeUndefined()
    expect(model.graph?.reads).toBeUndefined()
    expect(model.layoutResult?.tubeMap?.layout.reads).toHaveLength(0)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  test("a GBZ cut and its reads carry the PanSN names the session's assemblies alias", async () => {
    mockSession.assemblyManager.assemblyList = [
      { name: 'hg38', aliases: ['GRCh38'] },
      { name: 'HG00097.1', aliases: ['HG00097#1'] },
    ]
    await cutWithReads(() => Promise.resolve({ records: [], total: 0 }))
    const sent = mockRpcCall.mock.calls.map(
      ([, method, args]) =>
        [
          method,
          (args as { adapterConfig: Record<string, unknown> }).adapterConfig
            .assemblyNameToPanSN,
        ] as const,
    )
    expect(sent).toEqual([
      ['GetSubgraph', { 'HG00097.1': 'HG00097#1' }],
      ['GetGraphReads', { 'HG00097.1': 'HG00097#1' }],
    ])
  })

  test('a track naming no reads asks for none', async () => {
    const model = await cut(ON_HG38)
    expect(model.hasGraph).toBe(true)
    expect(mockRpcCall.mock.calls.map(([, m]) => m)).not.toContain(
      'GetGraphReads',
    )
  })
})
