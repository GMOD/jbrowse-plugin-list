import stateModelFactory from './model'

const mockRpcCall = vi.fn()
const mockSession = {
  tracks: [] as Record<string, unknown>[],
  rpcManager: { call: mockRpcCall },
}

vi.mock('@jbrowse/core/util', () => ({
  getSession: () => mockSession,
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
  const model = createView()
  await model.loadFromTabixSubgraph(TRACK.adapter, region, {
    trackId: TRACK.trackId,
  })
  return model
}

beforeEach(() => {
  mockRpcCall.mockReset()
  mockSession.tracks = [TRACK]
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
    const first = model.reloadSubgraph()
    const second = model.reloadSubgraph()
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
    const load = model.reloadSubgraph()
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
    void model.reloadSubgraph()
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
    void model.reloadSubgraph()
    void model.reloadSubgraph()
    expect(cutSignal(0).aborted).toBe(true)
    expect(cutSignal(1).aborted).toBe(false)
  })

  test('a reload over a drawn graph cannot be canceled', async () => {
    const model = await cut(ON_HG38)
    pendingCuts()
    void model.reloadSubgraph()
    expect(model.canCancelLoad).toBe(false)

    model.cancelLoad()
    expect(model.isLoading).toBe(true)
    expect(model.nodeCount).toBe(3)
  })

  test('a stored track the session no longer has is reported', async () => {
    mockSession.tracks = []
    const model = launchedView()
    await model.refetchIfNeeded()
    expect(String(model.error)).toMatch(/"segments", is not in this session/)
    expect(model.canRetryLoad).toBe(true)
    expect(mockRpcCall).not.toHaveBeenCalled()
  })
})
