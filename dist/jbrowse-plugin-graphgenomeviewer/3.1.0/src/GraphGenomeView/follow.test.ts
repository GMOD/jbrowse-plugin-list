import { observable, observableRef } from 'mobx'

import { followCut } from './follow'
import stateModelFactory from './model'

import type { SubgraphTier } from '../GetSubgraph'
import type { FollowWindow } from './follow'
import type { Renderer } from './renderer/types'
import type { SubgraphRegion } from '../launchSubgraph/launchSubgraphView'

const mockRpcCall = vi.fn()
const mockSession = {
  tracks: [] as Record<string, unknown>[],
  rpcManager: { call: mockRpcCall },
  views: [] as unknown[],
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

const REF = 'chr1'
const ASM = 'hg38'
const CONTIG = 10_000_000
const WIDTH_PX = 1000
// 1 Mb across the 1000 px view
const COARSE_ABOVE_BP_PER_PX = 1000

function graphTrack(adapter: Record<string, unknown>) {
  return { trackId: 'graph', assemblyNames: [ASM], adapter }
}
const TIERED = graphTrack({
  type: 'RgfaTabixAdapter',
  uri: 'graph',
  coarse: { uri: 'graph.tier10000', aboveBpPerPx: COARSE_ABOVE_BP_PER_PX },
})
const UNTIERED = graphTrack({ type: 'RgfaTabixAdapter', uri: 'graph' })

// One backbone segment per `step` bp, ids fixed by position so overlapping cuts
// name the same segment the same way, and an allele over every other one. Past
// 1.5 Mb the fine tier's alleles nest eight ranks deep, so a cut there has
// more rows than one before it.
function syntheticGraph(tier: SubgraphTier, region: SubgraphRegion) {
  const step = tier === 'fine' ? 10_000 : 250_000
  const lines = ['H\tVN:Z:1.0']
  const first = Math.floor(region.start / step)
  const last = Math.ceil(region.end / step)
  for (let k = first; k < last; k++) {
    const id = `${tier[0]}${k}`
    lines.push(
      `S\t${id}\t*\tLN:i:${step}\tSN:Z:${REF}\tSO:i:${k * step}\tSR:i:0`,
    )
    if (k > first) {
      lines.push(`L\t${tier[0]}${k - 1}\t+\t${id}\t+\t0M`)
    }
    if (k % 2 === 0 && k + 1 < last) {
      const deep = tier === 'fine' && k * step >= 1_500_000 ? 8 : 1
      let from = id
      for (let rank = 1; rank <= deep; rank++) {
        const allele = `${id}r${rank}`
        lines.push(
          `S\t${allele}\t*\tLN:i:100\tSN:Z:HG${rank}#1#${REF}\tSO:i:${k * step}\tSR:i:${rank}`,
          `L\t${from}\t+\t${allele}\t+\t0M`,
        )
        from = allele
      }
      lines.push(`L\t${from}\t+\t${tier[0]}${k + 1}\t+\t0M`)
    }
  }
  return lines.join('\n')
}

// The fine tier's backbone with one allele per sample per bubble, sized so the
// samples rank HG1, HG2 by what they carry before 1.15 Mb and HG2, HG3, HG1
// past it: the order a fresh cut of a window past 1.15 Mb sorts to.
function samplesGraph(_tier: SubgraphTier, region: SubgraphRegion) {
  const step = 10_000
  const lines = ['H\tVN:Z:1.0']
  const first = Math.floor(region.start / step)
  const last = Math.ceil(region.end / step)
  for (let k = first; k < last; k++) {
    lines.push(
      `S\tf${k}\t*\tLN:i:${step}\tSN:Z:${REF}\tSO:i:${k * step}\tSR:i:0`,
    )
    if (k > first) {
      lines.push(`L\tf${k - 1}\t+\tf${k}\t+\t0M`)
    }
    if (k % 2 === 0 && k + 1 < last) {
      const carried: [string, number][] =
        k * step < 1_150_000
          ? [
              ['HG1', 1000],
              ['HG2', 100],
            ]
          : [
              ['HG2', 1000],
              ['HG3', 500],
              ['HG1', 100],
            ]
      for (const [sample, bp] of carried) {
        const allele = `f${k}${sample}`
        lines.push(
          `S\t${allele}\t*\tLN:i:${bp}\tSN:Z:${sample}#1#${REF}\tSO:i:${k * step}\tSR:i:1`,
          `L\tf${k}\t+\t${allele}\t+\t0M`,
          `L\t${allele}\t+\tf${k + 1}\t+\t0M`,
        )
      }
    }
  }
  return lines.join('\n')
}

interface Cut {
  tier: SubgraphTier
  region: SubgraphRegion
  hops: number | undefined
}

interface Reads {
  cuts: Cut[]
  bubbleReads: SubgraphRegion[]
}

const FORCE_LAYOUT = {
  nodePositions: {
    'f100+': [
      { x: 0, y: 0 },
      { x: 400, y: 0 },
    ],
    'f101+': [
      { x: 500, y: 300 },
      { x: 900, y: 300 },
    ],
  },
}

function stubSubgraphs({ cuts, bubbleReads }: Reads, graph = syntheticGraph) {
  mockRpcCall.mockImplementation(
    (
      _sid: unknown,
      method: string,
      args: {
        region: SubgraphRegion
        regions?: SubgraphRegion[]
        opts?: { tier?: SubgraphTier; hops?: number }
      },
    ) => {
      if (method === 'GraphComputeLayout') {
        return Promise.resolve({ result: FORCE_LAYOUT, duration: 1 })
      }
      if (method === 'CoreGetFeatures') {
        bubbleReads.push(args.regions![0]!)
        return Promise.resolve([])
      }
      if (method !== 'GetSubgraph') {
        return Promise.reject(new Error(`Unexpected RPC: ${method}`))
      }
      const cut = {
        tier: args.opts?.tier ?? 'fine',
        region: args.region,
        hops: args.opts?.hops,
      }
      cuts.push(cut)
      return Promise.resolve(graph(cut.tier, cut.region))
    },
  )
}

interface Block {
  key: string
  refName: string
  assemblyName: string
  start: number
  end: number
  offsetPx: number
  displayedRegionIndex: number
}

// The members of a LinearGenomeView the follow reads, over one displayed
// region starting at 0, so a bp's px is bp / bpPerPx. `settle` is what the
// LGV's 500 ms coarse-blocks autorun does.
function mockLinearView(windowStart: number, windowBp: number) {
  const view = observable(
    {
      id: 'lgv',
      type: 'LinearGenomeView',
      assemblyNames: [ASM],
      initialized: true,
      width: WIDTH_PX,
      windowStartBp: windowStart,
      windowWidthBp: windowBp,
      displayedRegions: [
        { refName: REF, assemblyName: ASM, start: 0, end: CONTIG },
      ],
      coarseDynamicBlocks: [] as Block[],
      get bpPerPx() {
        return this.windowWidthBp / this.width
      },
      get offsetPx() {
        return this.windowStartBp / this.bpPerPx
      },
      get dynamicBlocks() {
        const start = Math.max(0, this.windowStartBp)
        const end = Math.min(CONTIG, this.windowStartBp + this.windowWidthBp)
        return {
          contentBlocks: [
            {
              key: `${REF}:${start}-${end}`,
              refName: REF,
              assemblyName: ASM,
              start,
              end,
              offsetPx: start / this.bpPerPx,
              displayedRegionIndex: 0,
            },
          ],
        }
      },
      navToLocString() {},
      horizontalScroll(distancePx: number) {
        this.windowStartBp += distancePx * this.bpPerPx
        return distancePx
      },
      zoomTo(bpPerPx: number, offset = this.width / 2) {
        const anchor = this.windowStartBp + offset * this.bpPerPx
        this.windowWidthBp = bpPerPx * this.width
        this.windowStartBp = anchor - offset * bpPerPx
        return bpPerPx
      },
      settle() {
        this.coarseDynamicBlocks = this.dynamicBlocks.contentBlocks
      },
      panBy(bp: number) {
        this.windowStartBp += bp
      },
      showWidth(bp: number) {
        const center = this.windowStartBp + this.windowWidthBp / 2
        this.windowWidthBp = bp
        this.windowStartBp = center - bp / 2
      },
    },
    { coarseDynamicBlocks: observableRef },
  )
  return view
}

type LinearView = ReturnType<typeof mockLinearView>

function liveWindow(view: LinearView): FollowWindow {
  const block = view.dynamicBlocks.contentBlocks[0]!
  return {
    refName: REF,
    assemblyName: ASM,
    start: block.start,
    end: block.end,
    bpPerPx: view.bpPerPx,
    span: view.windowWidthBp,
    regionStart: 0,
    regionEnd: CONTIG,
  }
}

function fakeRenderer() {
  return {
    resize: () => {},
    uploadGeometry: () => {},
    updateTransform: () => {},
    render: () => {},
    setNodeHighlights: () => {},
    setEdgeHighlight: () => {},
    destroy: () => {},
  } as unknown as Renderer
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

// Where a bp lands on screen in each view. Following means these agree.
function lgvX(view: LinearView, bp: number) {
  return (bp - view.windowStartBp) / view.bpPerPx
}

function graphX(model: { scale: number; translateX: number }, bp: number) {
  return bp * model.scale + model.translateX
}

async function followingModel({
  windowStart = 1_000_000,
  windowBp = 60_000,
  layoutMode = 'auto',
  tiered = true,
  graph = syntheticGraph,
}: {
  windowStart?: number
  windowBp?: number
  layoutMode?: string
  tiered?: boolean
  graph?: typeof syntheticGraph
} = {}) {
  const cuts: Cut[] = []
  const bubbleReads: SubgraphRegion[] = []
  stubSubgraphs({ cuts, bubbleReads }, graph)
  const view = mockLinearView(windowStart, windowBp)
  mockSession.views = [view]
  if (!tiered) {
    mockSession.tracks = [UNTIERED]
  }
  const model = stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode,
    loadedTrackId: 'graph',
    // a follow under way: the window and its margins
    loadedRegion: followCut(liveWindow(view), Infinity),
    connectedViewId: view.id,
    followLinearView: true,
  } as never)
  // the mount order the app has: the cut lands, the canvas mounts, then the
  // width is measured
  await model.refetchIfNeeded()
  model.startRenderingBackend(fakeRenderer())
  model.setWidth(WIDTH_PX)
  view.settle()
  await flush()
  return { model, view, cuts, bubbleReads }
}

beforeEach(() => {
  mockRpcCall.mockReset()
  mockSession.tracks = [TIERED]
})

test('a 2 Mb pan in 10 kb steps moves x every step and re-cuts every seventh', async () => {
  const { model, view, cuts } = await followingModel()
  expect(model.followState.active).toBe(true)
  expect(model.viewportOwner).toBe('follow')
  expect(cuts).toHaveLength(1)
  expect(graphX(model, 1_030_000)).toBeCloseTo(lgvX(view, 1_030_000), 6)

  const selected = 'f103+'
  model.setSelectedNode(selected)
  const paneHeight = model.canvasHeight
  const rowExtents = new Set<number>()

  const translateXs: number[] = []
  const recutAtStep: number[] = []
  for (let step = 1; step <= 200; step++) {
    view.panBy(10_000)
    // the frame clock: x moved with the window, before anything settled
    translateXs.push(model.translateX)
    const probe = view.windowStartBp + 30_000
    expect(graphX(model, probe)).toBeCloseTo(lgvX(view, probe), 6)

    const before = cuts.length
    view.settle()
    await flush()
    if (cuts.length > before) {
      recutAtStep.push(step)
    }
    // a re-cut's new layout did not refit x out from under the follow
    expect(graphX(model, probe)).toBeCloseTo(lgvX(view, probe), 6)
    expect(model.canvasHeight).toBe(paneHeight)
    rowExtents.add(model.layoutBounds!.h)
    if (step === 7) {
      expect(model.selectedNode).toBe(selected)
    }
  }

  expect(new Set(translateXs).size).toBe(200)
  // A cut is the window plus 60 kb each side, 180 kb. The window's right edge
  // reaches the cut's after 60 kb (six steps, still inside), so the seventh
  // step re-cuts, and the next cut is centred there: one fetch per 70 kb, 28
  // over 200 steps.
  expect(recutAtStep).toEqual(Array.from({ length: 28 }, (_, i) => (i + 1) * 7))
  expect(model.followRecuts).toBe(28)
  expect(cuts.every(c => c.tier === 'fine')).toBe(true)
  // past 1.5 Mb the rows are eight ranks deep, and the pane held its height
  expect(rowExtents.size).toBeGreaterThan(1)
  // f103 (1.03 Mb) is long out of the last cut, and the selection with it
  expect(model.selectedNode).toBeNull()
  expect(model.error).toBeUndefined()
})

test('a re-cut keeps the selection, found again by id', async () => {
  const { model, view } = await followingModel()
  model.setSelectedNode('f103+')
  model.setHoveredEdge(0)
  view.panBy(70_000)
  view.settle()
  await flush()
  expect(model.followRecuts).toBe(1)
  expect(model.nodeById?.has('f103+')).toBe(true)
  expect(model.selectedNode).toBe('f103+')
  // an edge index means nothing in another graph
  expect(model.hoveredEdge).toBeNull()
})

test('sample rows keep their order across a re-cut, and a fresh cut sorts them', async () => {
  const { model, view } = await followingModel({
    layoutMode: 'samplerows',
    graph: samplesGraph,
  })
  const rows = () => model.rowLabels.slice(1).map(r => r.label)
  expect(model.followState.active).toBe(true)
  expect(rows()).toEqual(['HG1', 'HG2'])

  view.panBy(200_000)
  view.settle()
  await flush()
  expect(model.followRecuts).toBe(1)
  expect(rows()).toEqual(['HG1', 'HG2', 'HG3'])

  model.setFollowLinearView(false)
  await model.reloadSubgraph()
  expect(rows()).toEqual(['HG2', 'HG3', 'HG1'])
})

test('zooming out to 3 Mb cuts the coarse tier above the threshold, and back in the fine one', async () => {
  // centred at 5 Mb, so no margin is clamped at a contig end
  const { model, view, cuts, bubbleReads } = await followingModel({
    windowStart: 4_970_000,
  })
  const widths = [120_000, 240_000, 480_000, 960_000, 1_920_000, 3_000_000]
  const tierAt = new Map<number, string>()

  async function zoomTo(bp: number) {
    view.showWidth(bp)
    const probe = view.windowStartBp + bp / 3
    expect(graphX(model, probe)).toBeCloseTo(lgvX(view, probe), 6)
    const before = cuts.length
    view.settle()
    await flush()
    if (cuts.length > before) {
      tierAt.set(bp, cuts.at(-1)!.tier)
    }
    expect(model.cutTier).toBe(
      bp / WIDTH_PX > COARSE_ABOVE_BP_PER_PX ? 'coarse' : 'fine',
    )
    expect(graphX(model, probe)).toBeCloseTo(lgvX(view, probe), 6)
  }

  for (const bp of widths) {
    await zoomTo(bp)
  }
  // Each cut holds the next doubling's first half: 120 kb and 480 kb land
  // inside the cuts made at 60 kb and 240 kb. 3 Mb lands inside 1.92 Mb's.
  expect([...tierAt]).toEqual([
    [240_000, 'fine'],
    [960_000, 'fine'],
    [1_920_000, 'coarse'],
  ])
  // 1.92 Mb plus its margins is 5.76 Mb: past the 5 Mb a fine cut may span,
  // and the coarse tier is not held to it
  const coarseSpan = model.loadedRegion!.end - model.loadedRegion!.start
  expect(coarseSpan).toBeGreaterThan(model.maxRegionBp)
  expect(model.error).toBeUndefined()
  expect(model.graph!.nodes.every(n => n.id.startsWith('c'))).toBe(true)
  // a hop past a coarse cut reaches nothing, so none is asked for
  expect(cuts.filter(c => c.tier === 'coarse').map(c => c.hops)).toEqual([0])

  tierAt.clear()
  for (const bp of [...widths].reverse().slice(1).concat(60_000)) {
    await zoomTo(bp)
  }
  expect([...tierAt]).toEqual([[960_000, 'fine']])
  expect(model.graph!.nodes.every(n => n.id.startsWith('f'))).toBe(true)
  // the bubble index is read beside every fine cut and no coarse one
  expect(bubbleReads).toEqual(
    cuts.filter(c => c.tier === 'fine').map(c => c.region),
  )
})

test('with no coarse tier the margins narrow to the cap, and past it the last cut holds', async () => {
  const { model, view, cuts } = await followingModel({
    windowStart: 4_970_000,
    tiered: false,
  })
  view.showWidth(2_000_000)
  view.settle()
  await flush()
  expect(cuts).toHaveLength(2)
  const region = model.loadedRegion!
  expect(region.end - region.start).toBe(model.maxRegionBp)

  view.showWidth(6_000_000)
  view.settle()
  await flush()
  expect(cuts).toHaveLength(2)
  expect(model.followNote).toMatch(/6 Mb is past the 5 Mb/)
  expect(model.error).toBeUndefined()
  expect(model.hasGraph).toBe(true)

  view.showWidth(2_000_000)
  view.settle()
  await flush()
  expect(cuts).toHaveLength(2)
  expect(model.followNote).toBeUndefined()
})

test('in-flight re-cuts land latest-window-first', async () => {
  const { model, view } = await followingModel()
  const pending: { resolve: (gfa: string) => void; region: SubgraphRegion }[] =
    []
  mockRpcCall.mockImplementation(
    (_sid: unknown, _method: string, args: { region: SubgraphRegion }) =>
      new Promise<string>(resolve => {
        pending.push({ resolve, region: args.region })
      }),
  )
  view.panBy(100_000)
  view.settle()
  view.panBy(100_000)
  view.settle()
  expect(pending).toHaveLength(2)
  pending[1]!.resolve(syntheticGraph('fine', pending[1]!.region))
  await flush()
  pending[0]!.resolve(syntheticGraph('fine', pending[0]!.region))
  await flush()
  expect(model.loadedRegion).toEqual(pending[1]!.region)
  const starts = model
    .graph!.nodes.filter(n => n.stable?.rank === 0)
    .map(n => n.stable!.start)
  expect(Math.min(...starts)).toBeLessThanOrEqual(pending[1]!.region.start)
  expect(Math.min(...starts)).toBeGreaterThan(pending[0]!.region.start)
})

test('a gesture on the followed graph moves the linear view', async () => {
  const { model, view } = await followingModel()
  const start = view.windowStartBp
  const y = model.translateY

  model.setTransform(model.scale, model.translateX + 100, y + 30)
  expect(view.windowStartBp).toBeCloseTo(start - 100 * view.bpPerPx, 6)
  expect(model.translateY).toBe(y + 30)
  expect(model.viewportOwner).toBe('follow')

  const bpPerPx = view.bpPerPx
  model.zoom(2, 250, 50)
  expect(view.bpPerPx).toBeCloseTo(bpPerPx / 2, 9)
  const probe = view.windowStartBp + 10_000
  expect(graphX(model, probe)).toBeCloseTo(lgvX(view, probe), 6)

  // the fit button places the rows and leaves x to the linear view
  model.zoomToFit()
  expect(graphX(model, probe)).toBeCloseTo(lgvX(view, probe), 6)
  model.setTransform(model.scale, model.translateX, y + 30)

  // the rows the reader scrolled to survive a re-cut
  view.panBy(200_000)
  view.settle()
  await flush()
  expect(model.followRecuts).toBe(1)
  expect(model.translateY).toBe(y + 30)
})

test('nothing runs on the force layout, and the toolbar is told why', async () => {
  const { model, view, cuts } = await followingModel({ layoutMode: 'force' })

  expect(model.followState).toEqual({
    active: false,
    reason: 'Not following: x is not reference bp (Force-directed layout)',
  })
  expect(model.viewportOwner).toBe('fit')
  const fitted = [model.scale, model.translateX, model.translateY]
  for (let step = 0; step < 20; step++) {
    view.panBy(10_000)
    view.settle()
    await flush()
  }
  expect(cuts).toHaveLength(1)
  expect(model.followRecuts).toBe(0)
  expect([model.scale, model.translateX, model.translateY]).toEqual(fitted)
})

test('switching an anchored follow to force hands the viewport back to the fit', async () => {
  const { model } = await followingModel()
  expect(model.viewportOwner).toBe('follow')
  model.setLayoutMode('force')
  await model.recomputeLayout()
  expect(model.followState.active).toBe(false)
  expect(model.viewportOwner).toBe('fit')
  const handedBack = [model.scale, model.translateX, model.translateY]
  model.zoomToFit()
  expect([model.scale, model.translateX, model.translateY]).toEqual(handedBack)
})

test('a GBZ cut is too slow to follow, and says so', async () => {
  mockSession.tracks = [graphTrack({ type: 'GbzBaseSyntenyAdapter' })]
  const { model, view, cuts } = await followingModel()
  expect(model.followState).toEqual({
    active: false,
    reason: 'Not following: a GBZ cut takes seconds, too slow to redo per pan',
  })
  view.panBy(200_000)
  view.settle()
  await flush()
  expect(cuts).toHaveLength(1)
})

test('turning the follow off leaves the graph where the follow put it', async () => {
  const { model, view } = await followingModel()
  const transform = [model.scale, model.translateX, model.translateY]
  model.setFollowLinearView(false)
  expect(model.viewportOwner).toBe('user')
  view.panBy(200_000)
  view.settle()
  await flush()
  expect([model.scale, model.translateX, model.translateY]).toEqual(transform)
  expect(model.followRecuts).toBe(0)
})
