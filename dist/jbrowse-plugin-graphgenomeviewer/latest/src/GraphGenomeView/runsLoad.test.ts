import { layoutEngine } from '@jbrowse/bandage-core/layoutEngines'

import stateModelFactory from './viewModel'
import Adapter from '../RgfaTabixAdapter/RgfaTabixAdapter.ts'
import configSchema from '../RgfaTabixAdapter/configSchema.ts'

import type { SubgraphCutOptions } from '../GetSubgraph'
import type { EngineRequest } from '@jbrowse/bandage-core/pipeline'

const mockRpcCall = vi.fn()
const mockSession = {
  tracks: [] as Record<string, unknown>[],
  rpcManager: { call: mockRpcCall },
  assemblyManager: {
    has: () => false,
    get: () => undefined,
    assemblyList: [],
  },
}

vi.mock('@jbrowse/core/util', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getSession: () => mockSession,
  getRpcSessionId: () => 'test',
}))

// Twelve 500 bp reference nodes over chr1:0-6000 in one 10 kb tile:
//   W GRCh38  0 chr1 >1>2>3>4>5>6>7>8>9>10>11>12
//   W HG002   1 chr1 >1>2>3>20>21>9>10>11>12   20 and 21, 2 kb each, replace 4-8
//   W HG002   2 chr1 >1>2>3>4>5>6>7>8>9>10>11>12
//   W HG003   1 chr1 >1>2>3>22                 the contig ends on 22, 300 bp
const prefix = require
  .resolve('../RgfaTabixAdapter/test_data/walks8/rejoin.GRCh38.walks.gz')
  .replace(/\.walks\.gz$/, '')
const local = (path: string) => ({
  localPath: path,
  locationType: 'LocalPathLocation',
})
const adapter = new Adapter(
  configSchema.create({
    walksLocation: local(`${prefix}.walks.gz`),
    walksIndex: local(`${prefix}.walks.gz.idx`),
    assemblyNameToPanSN: { hg38: 'GRCh38' },
  }),
)
const TRACK = { trackId: 'walks', adapter: { type: 'RgfaTabixAdapter' } }
const region = { refName: 'chr1', assemblyName: 'hg38', start: 0, end: 6000 }

// GetSubgraph as the worker answers it: runs where the cut is for a fold to
// threads, unless `refuse` stands in for runs graph-fold will not fold
function answer({ refuse = false } = {}) {
  mockRpcCall.mockImplementation(
    async (
      _sid: unknown,
      method: string,
      args: EngineRequest & { opts?: SubgraphCutOptions },
    ) => {
      const read = args.opts?.foldRuns
        ? await adapter.getSubgraphRuns(region, args.opts)
        : undefined
      return method === 'GraphComputeLayout'
        ? layoutEngine(args)
        : method !== 'GetSubgraph'
          ? Promise.reject(new Error(`Unexpected RPC: ${method}`))
          : read
            ? refuse
              ? { runs: { ...read.runs, revisited: Number.NaN } }
              : read
            : adapter.getSubgraph(region, args.opts)
    },
  )
}

const asked = () =>
  mockRpcCall.mock.calls
    .filter(([, method]) => method === 'GetSubgraph')
    .map(([, , args]) => !!(args as { opts: SubgraphCutOptions }).opts.foldRuns)

function createView(snapshot: Record<string, unknown> = {}) {
  return stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'auto',
    ...snapshot,
  } as never)
}

beforeEach(() => {
  mockRpcCall.mockReset()
  mockSession.tracks = [TRACK]
})

test("a cut folded to threads reads the window's walks as runs, and lists the cut's walks from them", async () => {
  answer()
  const model = createView()
  await model.cutSubgraph(TRACK.adapter, region, {}, 500)
  expect(model.error).toBeUndefined()
  expect(asked()).toEqual([true])
  expect(model.foldedBelowBp).toBe(500)
  expect(model.unfoldedGraph).toBeUndefined()
  expect(model.cutWalks?.map(walk => walk.name)).toEqual([
    'GRCh38#0#chr1',
    'HG002#1#chr1',
    'HG002#2#chr1',
    'HG003#1#chr1',
  ])
  expect(model.walkChoices.map(choice => choice.name)).toEqual(
    model.cutWalks?.map(walk => walk.name),
  )
  expect(model.pathCount).toBe(4)
  expect(model.notLoadedNames.size).toBe(0)
  expect(model.graph?.threadFold?.haplotypes).toBe(4)
})

test("on a cut folded to threads, a hovered node on a lifted thread says nothing of where it lies on the thread's contig, and one off it says it is not on it", async () => {
  answer()
  const model = createView()
  await model.cutSubgraph(TRACK.adapter, region, {}, 500)
  model.liftWalks(['HG002#1#chr1'])
  const walk = model.walkLift?.walks[0]
  const on = model.graph?.nodes.find(node => walk?.nodeIds.has(node.id))
  const off = model.graph?.nodes.find(node => !walk?.nodeIds.has(node.id))
  expect(walk?.members).toEqual(['HG002#1#chr1'])
  expect([on, off].every(Boolean)).toBe(true)
  model.setHoveredNode(on?.id ?? null)
  expect(walk && model.hoveredOn(walk)).toBeUndefined()
  model.setHoveredNode(off?.id ?? null)
  expect(walk && model.hoveredOn(walk)).toBe('not on this walk')
})

test('runs graph-fold refuses are cut instead, and the cut folds as before', async () => {
  answer({ refuse: true })
  const model = createView()
  await model.cutSubgraph(TRACK.adapter, region, {}, 500)
  expect(model.error).toBeUndefined()
  expect(asked()).toEqual([true, false])
  expect(model.cutWalks).toBeUndefined()
  expect(model.unfoldedGraph?.paths).toHaveLength(4)
  expect(model.graph?.threadFold?.haplotypes).toBe(4)
})

test('a cut under the size walks fold from, or anchored on a path the user picked, is cut as before', async () => {
  answer()
  const model = createView()
  await model.cutSubgraph(TRACK.adapter, region, {}, 0)
  model.setReferencePath('HG002#2#chr1')
  await model.cutSubgraph(TRACK.adapter, region, {}, 500)
  expect(asked()).toEqual([false, false])
  expect(model.cutWalks).toBeUndefined()
})
