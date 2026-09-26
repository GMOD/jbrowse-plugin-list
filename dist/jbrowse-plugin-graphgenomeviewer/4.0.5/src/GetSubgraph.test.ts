import PluginManager from '@jbrowse/core/PluginManager'
import { getAdapter } from '@jbrowse/core/data_adapters/dataAdapterCache'

import GetSubgraph from './GetSubgraph'
import { convertGFAToGraph } from './GraphGenomeView/gfa/gfaConverter'
import { anchoredLayout } from './GraphGenomeView/layout/anchoredLayout'
import { parseGFA, stableCoordinate } from './gfa-core/index'
import GraphPlugin from './index'

import type { AbstractRootModel } from '@jbrowse/core/util'

vi.mock('@jbrowse/core/data_adapters/dataAdapterCache')

const mockGetAdapter = vi.mocked(getAdapter)

const region = {
  refName: 'chr',
  assemblyName: 'K12',
  start: 993236,
  end: 997574,
}

function makeArgs(sessionId = 'graph') {
  return {
    adapterConfig: { type: 'RgfaTabixAdapter' },
    region,
    sessionId,
  }
}

function makeMethod() {
  const pluginManager = new PluginManager([new GraphPlugin()])
  pluginManager.createPluggableElements()
  pluginManager.configure()
  return new GetSubgraph(pluginManager)
}

// GraphGenomeView.loadFromTabixSubgraph calls rpcManager by this exact string;
// nothing else checks that a method answers to it, and when the method went
// missing the view failed only at runtime.
test('the plugin registers GetSubgraph under the name the view calls', () => {
  const pluginManager = new PluginManager([new GraphPlugin()])
  pluginManager.createPluggableElements()
  pluginManager.configure()
  expect(pluginManager.getRpcMethodType('GetSubgraph').name).toBe('GetSubgraph')
})

test('forwards the region and context to the adapter', async () => {
  const getSubgraph = vi.fn().mockResolvedValue('H\tVN:Z:1.0')
  mockGetAdapter.mockResolvedValue({
    dataAdapter: { getSubgraph },
  })

  const result = await makeMethod().execute(
    { ...makeArgs(), opts: { hops: 2 } },
    'MainThreadRpcDriver',
  )
  expect(getSubgraph).toHaveBeenCalledWith(region, { hops: 2 })
  expect(result).toBe('H\tVN:Z:1.0')
})

// The signal is the call's, not the payload's, so it reaches `execute` beside
// `opts` rather than in it and has to be handed on by name. Dropped there, a
// cut the view had replaced went on reading to the end.
test('hands the call its signal on to the adapter', async () => {
  const getSubgraph = vi.fn().mockResolvedValue('')
  mockGetAdapter.mockResolvedValue({
    dataAdapter: { getSubgraph },
  })
  const { signal } = new AbortController()

  await makeMethod().execute(
    { ...makeArgs(), opts: { hops: 1 }, signal },
    'MainThreadRpcDriver',
  )
  expect(getSubgraph.mock.calls[0]![1].signal).toBe(signal)
})

// The set rides in `opts` as plain JSON: serializeArguments renames the region
// and leaves the rest alone, so what the view sends is what the adapter gets.
test('forwards the haplotype set to the adapter', async () => {
  const getSubgraph = vi.fn().mockResolvedValue('H\tVN:Z:1.1')
  mockGetAdapter.mockResolvedValue({
    dataAdapter: { getSubgraph },
  })

  await makeMethod().execute(
    { ...makeArgs(), opts: { hops: 1, haplotypes: ['HG002#1', 'HG005'] } },
    'MainThreadRpcDriver',
  )
  expect(getSubgraph).toHaveBeenCalledWith(region, {
    hops: 1,
    haplotypes: ['HG002#1', 'HG005'],
  })
})

// The bug this pins: a launch passes the region in the *assembly's* spelling,
// and hg38 on every GRCh38 FASTA jbrowse.org hosts calls chr6 `6`, while an HPRC
// graph's stable names are `GRCh38#0#chr6`. Renaming is what closes that gap, and
// it happens in the base class's serializeArguments, so a GetSubgraph extending
// the plain RpcMethodType asked the adapter for `GRCh38#0#6`, matched nothing,
// and opened an empty graph view with no error at all.
//
// The fake root model carries only what renameRegionsIfNeeded reaches for. Its
// one cast is the price of not building an entire session to assert a refName.
test('renames the region onto the adapter spelling before the call', async () => {
  const assembly = {
    getRefNameMapForAdapter: async () => ({ '6': 'chr6' }),
    getSeqAdapterRefName: (refName: string) => refName,
  }
  // requireAssembly as well as waitForAssembly: renameRegionsIfNeeded resolves
  // through require (a named assembly that will not resolve is a rename that
  // cannot be done, not a no-op), and a fake carrying only the wait form throws
  // at the call rather than failing a type check, since the cast below is what
  // gets it past one.
  const assemblyManager = {
    waitForAssembly: async () => assembly,
    requireAssembly: async () => assembly,
  }
  const method = makeMethod()
  method.pluginManager.rootModel = {
    session: { assemblyManager },
  } as unknown as AbstractRootModel

  const serialized = await method.serializeArguments(
    {
      adapterConfig: { type: 'RgfaTabixAdapter' },
      region: { refName: '6', assemblyName: 'hg38', start: 0, end: 100 },
      sessionId: 'graph',
    },
    'MainThreadRpcDriver',
  )
  expect(serialized.region).toMatchObject({ refName: 'chr6' })
})

// An adapter without getSubgraph is the normal case for a PAF-backed synteny
// track, so it returns empty rather than throwing; the view turns that into a
// message.
test('returns empty for an adapter that cannot cut subgraphs', async () => {
  mockGetAdapter.mockResolvedValue({
    dataAdapter: { getFeatures: vi.fn() },
  })

  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const result = await makeMethod().execute(makeArgs(), 'MainThreadRpcDriver')
  expect(result).toBe('')
  expect(warn).toHaveBeenCalled()
  warn.mockRestore()
})

// The GFA an rGFA-backed adapter returns: no sequence, spans as LN, and the
// SN/SO/SR tags that let the view lay the subgraph out from the file rather
// than from a force simulation. Byte-for-byte what RgfaTabixAdapter emits for
// the region above (see its test).
const SUBGRAPH_GFA = [
  'H\tVN:Z:1.0',
  'S\ts1727\t*\tLN:i:226\tSN:Z:CFT073#1#chr\tSO:i:1044024\tSR:i:2',
  'S\ts1728\t*\tLN:i:75\tSN:Z:CFT073#1#chr\tSO:i:1048515\tSR:i:2',
  'S\ts322\t*\tLN:i:74\tSN:Z:K12#1#chr\tSO:i:993236\tSR:i:0',
  'S\ts323\t*\tLN:i:4264\tSN:Z:K12#1#chr\tSO:i:993310\tSR:i:0',
  'S\ts324\t*\tLN:i:7093\tSN:Z:K12#1#chr\tSO:i:997574\tSR:i:0',
  'L\ts1727\t+\ts323\t+\t0M',
  'L\ts322\t+\ts323\t+\t0M',
  'L\ts323\t+\ts1728\t+\t0M',
  'L\ts323\t+\ts324\t+\t0M',
].join('\n')

test('a sequenceless subgraph keeps its lengths and stable coordinates', () => {
  const gfa = parseGFA(SUBGRAPH_GFA)
  expect(gfa.nodes.map(n => n.length)).toEqual([226, 75, 74, 4264, 7093])
  expect(gfa.nodes.map(n => stableCoordinate(n))).toEqual([
    { refName: 'CFT073#1#chr', start: 1044024, rank: 2 },
    { refName: 'CFT073#1#chr', start: 1048515, rank: 2 },
    { refName: 'K12#1#chr', start: 993236, rank: 0 },
    { refName: 'K12#1#chr', start: 993310, rank: 0 },
    { refName: 'K12#1#chr', start: 997574, rank: 0 },
  ])
})

test('a subgraph lays out anchored, without the layout WASM', () => {
  const graph = convertGFAToGraph(parseGFA(SUBGRAPH_GFA), 'test')
  const layout = anchoredLayout(graph)
  expect(layout).toBeDefined()
  // node ids carry the canonical strand, so `s322` becomes `s322+`
  const at = (id: string) => layout!.nodePositions[id]![0]!
  // rank-0 segments sit at the offset they declare, all on row 0
  expect(at('s322+')).toEqual({ x: 993236, y: 0 })
  expect(at('s323+')).toEqual({ x: 993310, y: 0 })
  expect(at('s324+')).toEqual({ x: 997574, y: 0 })
  // rank 2 hangs off the backbone on a row of its own, from where it branches
  expect(at('s1727+').y).toBeGreaterThan(0)
  expect(at('s1727+').y).toBe(at('s1728+').y)
})
