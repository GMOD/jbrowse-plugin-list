import { spreadFor } from '@jbrowse/bandage-core/bubbleSpreads'
import {
  PROPORTIONAL_LENGTH,
  bandageAutoScale,
  drawnLengthFor,
  layoutScaling,
} from '@jbrowse/bandage-core/layout/drawnScale'
import { abgrAlpha } from '@jbrowse/bandage-core/renderer/colorBits'
import { destroy, getSnapshot } from '@jbrowse/mobx-state-tree'

import { mockRpcCall, mockSession } from './modelTestMocks'
import {
  MOCK_LAYOUT,
  RGFA,
  SIMPLE_GFA,
  TEST_REGION,
  TEST_TRACK,
  WALKED_GFA,
  attachedModel,
  createAnchoredModel,
  createModel,
  layoutsSettled,
  maxOf,
  minOf,
  restoredView,
  rpcRespond,
  toggleDeletionEdges,
} from './modelTestSupport'
import { EMPTY_BATCH } from './pane/paneBase'
import stateModelFactory from './viewModel'

import type { MenuItem } from './modelTestSupport'
import type { Graph } from '@jbrowse/bandage-core/types'

vi.mock('@jbrowse/core/util', async () =>
  (await import('./modelTestMocks')).coreUtilMock(),
)
vi.mock(import('@jbrowse/core/configuration'), async importOriginal =>
  (await import('./modelTestMocks')).configurationMock(await importOriginal()),
)
vi.mock('@jbrowse/core/util/io', async () =>
  (await import('./modelTestMocks')).ioMock(),
)

describe('performance instrumentation', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  test('captures fetch and layout timing on a tabix subgraph load', async () => {
    rpcRespond()
    const model = createModel()
    await model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    // GetSubgraph round-trip is timed with performance.now() — a resolved
    // promise still takes a measurable, non-negative amount of time.
    expect(typeof model.lastFetchMs).toBe('number')
    expect(model.lastFetchMs).toBeGreaterThanOrEqual(0)
    // layout duration is passed straight through from the GraphComputeLayout
    // RPC return (mock reports duration: 5)
    expect(model.lastLayoutMs).toBe(5)
  })

  test('captures layout timing on loadGFA', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'imported')
    expect(model.lastLayoutMs).toBe(5)
  })

  test('showLoading holds until the built geometry is painted', async () => {
    rpcRespond()
    const model = createModel()
    expect(model.showLoading).toBe(false)
    await model.loadGFA(SIMPLE_GFA, 'imported')
    expect(model.showLoading).toBe(true)
    model.setGeometryMetrics(1, EMPTY_BATCH, {
      scale: 1,
      bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
    })
    expect(model.showLoading).toBe(true)
    model.markPainted()
    expect(model.showLoading).toBe(false)

    model.setGeometryMetrics(1, EMPTY_BATCH, {
      scale: 1,
      bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
    })
    expect(model.showLoading).toBe(true)
    model.markPainted()
    expect(model.showLoading).toBe(false)

    model.setViewportDirty()
    expect(model.showLoading).toBe(true)
  })

  test('clearGraph resets perf metrics', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'imported')
    expect(model.lastLayoutMs).toBe(5)
    model.clearGraph()
    expect(model.lastFetchMs).toBeUndefined()
    expect(model.lastLayoutMs).toBeUndefined()
    expect(model.lastGeometryMs).toBeUndefined()
    expect(model.lastGeometryStrokeCount).toBeUndefined()
  })

  test('clearGraph lets go of the drawn geometry and a morph in progress', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'imported')
    const batch = { ...model.drawnBatch, nodeStrokes: [] }
    model.setGeometryMetrics(1, batch, {
      scale: 1,
      bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
    })
    model.setMorphFrame({
      layout: model.layoutResult!,
      ids: new Set(['1']),
      alpha: 0.5,
    })
    model.clearGraph()
    expect(model.drawnBatch).not.toBe(batch)
    expect(model.drawnBatch.nodeStrokes).toHaveLength(0)
    expect(model.morphEntering).toBeUndefined()
  })

  test('only the force run the live layout waits on writes the status line', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'imported')
    const runs: ((status: string) => void)[] = []
    mockRpcCall.mockImplementation(
      (_sid: unknown, _method: string, args: { statusCallback: never }) => {
        runs.push(args.statusCallback)
        return new Promise(() => {})
      },
    )
    model.setLayoutQuality(3)
    void model.recomputeLayout()
    model.setLayoutQuality(1)
    void model.recomputeLayout()
    runs[0]!('superseded')
    expect(model.statusMessage).toBe('Computing layout')
    runs[1]!('live')
    expect(model.statusMessage).toBe('live')

    // back to a run still in flight, which the force cache shares
    model.setLayoutQuality(3)
    void model.recomputeLayout()
    expect(runs).toHaveLength(2)
    runs[0]!('shared')
    expect(model.statusMessage).toBe('shared')

    model.stopLoad()
    runs[0]!('stopped')
    expect(model.statusMessage).toBe('')
  })

  // each GraphComputeLayout call held, to be answered by hand
  function heldLayouts() {
    const runs: {
      signal: AbortSignal
      resolve: (value: unknown) => void
      reject: (reason: unknown) => void
    }[] = []
    mockRpcCall.mockImplementation(
      (_sid: unknown, _method: string, args: { signal: AbortSignal }) =>
        new Promise((resolve, reject) => {
          runs.push({ signal: args.signal, resolve, reject })
        }),
    )
    return runs
  }

  test('a force run no live layout waits on is aborted, and a shared one is not', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(RGFA, 'imported')
    const runs = heldLayouts()
    model.setLayoutQuality(3)
    void model.recomputeLayout()
    void model.recomputeLayout()
    expect(runs).toHaveLength(1)
    expect(runs[0]!.signal.aborted).toBe(false)

    model.setLayoutQuality(1)
    void model.recomputeLayout()
    expect(runs[0]!.signal.aborted).toBe(true)
    expect(runs[1]!.signal.aborted).toBe(false)

    model.setLayoutMode('auto')
    void model.recomputeLayout()
    expect(runs[1]!.signal.aborted).toBe(true)
  })

  test('a layout back on an aborted run that fails asks the engine again', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'imported')
    const runs = heldLayouts()
    model.setLayoutQuality(3)
    void model.recomputeLayout()
    model.setLayoutQuality(1)
    void model.recomputeLayout()
    model.setLayoutQuality(3)
    const back = model.recomputeLayout()
    expect(runs).toHaveLength(2)
    expect(runs[1]!.signal.aborted).toBe(true)

    runs[0]!.reject(new DOMException('aborted', 'AbortError'))
    await vi.waitFor(() => {
      expect(runs).toHaveLength(3)
    })
    expect(runs[2]!.signal.aborted).toBe(false)
    runs[2]!.resolve({ result: structuredClone(MOCK_LAYOUT), duration: 5 })
    await back
    expect(model.error).toBeUndefined()
    expect(model.isLoading).toBe(false)
    vi.unstubAllGlobals()
  })

  test('a layout started after a stop is aborted by the next load, clearGraph or destroy', async () => {
    const model = createModel()
    async function layoutAfterStop(quality: number) {
      rpcRespond()
      await model.loadGFA(SIMPLE_GFA, 'imported')
      model.stopLoad()
      const runs = heldLayouts()
      model.setLayoutQuality(quality)
      void model.recomputeLayout()
      expect(runs).toHaveLength(1)
      expect(runs[0]!.signal.aborted).toBe(false)
      return runs[0]!.signal
    }

    const beforeNextLoad = await layoutAfterStop(3)
    void model.loadGFA(WALKED_GFA, 'next')
    expect(beforeNextLoad.aborted).toBe(true)

    const beforeClear = await layoutAfterStop(1)
    model.clearGraph()
    expect(beforeClear.aborted).toBe(true)

    const beforeDestroy = await layoutAfterStop(3)
    destroy(model)
    expect(beforeDestroy.aborted).toBe(true)
  })

  test('clearGraph drops every hover naming a part of the graph', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'imported')
    model.setHoveredNode('1+', { x: 5, y: 5 })
    model.setHoveredTube({ track: 1 })
    model.setHoveredRowWalks(['A#1#ctg'])
    model.setStripHover({ row: 'A#1#ctg', offset: 3 })
    model.clearGraph()
    expect(model.hoveredAt).toBeNull()
    expect(model.hoveredTube).toBeNull()
    expect(model.hoveredRowWalks).toEqual([])
    expect(model.stripHover).toBeNull()
  })

  test('clearGraph drops the source with the graph, so the import form is not a view still loading', async () => {
    rpcRespond()
    mockSession.tracks = [TEST_TRACK]
    const model = restoredView()
    await model.load()
    expect(model.hasGraph).toBe(true)

    model.clearGraph()
    expect(model.hasGraph).toBe(false)
    expect(model.showLoading).toBe(false)
    expect(model.canRetryLoad).toBe(false)
    expect(getSnapshot(model)).toMatchObject({ loadedTrackId: '' })
    expect(model.loadedRegion).toBeUndefined()
  })

  test('a load still in flight does not land after clearGraph', async () => {
    let respond = (_gfa: string) => {}
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? new Promise<string>(resolve => {
            respond = resolve
          })
        : Promise.resolve({ result: MOCK_LAYOUT, duration: 5 }),
    )
    const model = createModel()
    const load = model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    model.clearGraph()
    respond(SIMPLE_GFA)
    await load
    expect(model.hasGraph).toBe(false)
    expect(model.isLoading).toBe(false)
  })

  // each GetSubgraph call waits to be answered by hand
  function heldCuts() {
    const answers: ((gfa: string) => void)[] = []
    let holdLayout: (() => void) | undefined
    const layouts: (() => void)[] = []
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? new Promise<string>(resolve => {
            answers.push(resolve)
          })
        : method === 'GraphComputeLayout' && holdLayout
          ? new Promise(resolve => {
              layouts.push(() => {
                resolve({ result: MOCK_LAYOUT, duration: 5 })
              })
            })
          : Promise.resolve({ result: MOCK_LAYOUT, duration: 5 }),
    )
    return {
      answers,
      layouts,
      holdLayouts() {
        holdLayout = () => {}
      },
    }
  }

  test('a layout of the graph on screen leaves a fetch its spinner', async () => {
    const { answers } = heldCuts()
    const model = createModel()
    const first = model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    answers[0]!(SIMPLE_GFA)
    await first
    expect(model.isLoading).toBe(false)

    const second = model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    await model.recomputeLayout()
    expect(model.isLoading).toBe(true)

    answers[1]!(SIMPLE_GFA)
    await second
    expect(model.isLoading).toBe(false)
  })

  test('a load whose layout was replaced leaves the spinner to the replacement', async () => {
    const { answers, layouts, holdLayouts } = heldCuts()
    holdLayouts()
    const model = createModel()
    const load = model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    answers[0]!(SIMPLE_GFA)
    await vi.waitFor(() => {
      expect(layouts).toHaveLength(1)
    })
    model.setLayoutQuality(4)
    const relayout = model.recomputeLayout()
    await vi.waitFor(() => {
      expect(layouts).toHaveLength(2)
    })

    layouts[0]!()
    await load
    expect(model.isLoading).toBe(true)

    layouts[1]!()
    await relayout
    expect(model.isLoading).toBe(false)
  })

  test('a load that fails while an outrun one is laying out ends with that layout', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { answers, layouts, holdLayouts } = heldCuts()
    holdLayouts()
    const model = createModel()
    const first = model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    answers[0]!(SIMPLE_GFA)
    await vi.waitFor(() => {
      expect(layouts).toHaveLength(1)
    })
    const second = model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    answers[1]!('')
    await second
    expect(String(model.error)).toMatch(/no GFA/)

    layouts[0]!()
    await first
    expect(model.isLoading).toBe(false)
    consoleSpy.mockRestore()
  })

  test('a stop before a new graph is laid out draws nothing of the last one, and stops loading', async () => {
    const { answers, layouts, holdLayouts } = heldCuts()
    const model = createModel()
    const first = model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    answers[0]!(SIMPLE_GFA)
    await first
    expect(model.layoutResult).toBeDefined()

    holdLayouts()
    const second = model.cutSubgraph({ type: 'RgfaTabixAdapter' }, TEST_REGION)
    answers[1]!(SIMPLE_GFA)
    await vi.waitFor(() => {
      expect(layouts).toHaveLength(1)
    })
    model.stopLoad()
    expect(model.layoutResult).toBeUndefined()
    expect(model.graph).toBeUndefined()
    expect(model.loadCanceled).toBe(true)
    expect(model.showLoading).toBe(false)
    layouts[0]!()
    await second
    expect(model.layoutResult).toBeUndefined()
    expect(model.showLoading).toBe(false)
  })
})

describe('layoutMode', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  function layoutCalls() {
    return mockRpcCall.mock.calls.filter(c => c[1] === 'GraphComputeLayout')
  }

  function layoutArgs(index: number) {
    return layoutCalls()[index]![2] as {
      graph: { nodes: { x?: number; y?: number }[] }
      options: Record<string, unknown>
    }
  }

  test('a session naming options this build lacks opens on the defaults', () => {
    const model = stateModelFactory().create({
      type: 'GraphGenomeView',
      layoutMode: 'variants',
      bubbleSpread: 'dropped',
      layoutEngine: 'dropped',
    } as never)
    expect(model.layoutMode).toBeUndefined()
    expect(model.chosenLayoutMode).toBe('force')
    expect(model.bubbleSpread).toBe('auto')
    expect(model.layoutEngine).toBe('fmmm')
  })

  test('auto lays an rGFA out from the file, with no layout RPC', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(RGFA, 'rgfa')

    expect(layoutCalls()).toHaveLength(0)
    expect(model.layoutResult).toBeDefined()
  })

  // Seeded, and with the component rotation off, so FMMM keeps the reference
  // running along x rather than curling it (referenceSeeds.ts).
  test('force sends an rGFA to the layout engine instead, seeded', async () => {
    rpcRespond()
    const model = createModel()
    model.setLayoutMode('force')
    await model.loadGFA(RGFA, 'rgfa')

    expect(layoutCalls()).toHaveLength(1)
    const { graph, options } = layoutArgs(0)
    expect(graph.nodes).toHaveLength(3)
    expect(
      graph.nodes.every(
        n => typeof n.x === 'number' && typeof n.y === 'number',
      ),
    ).toBe(true)
    expect(options.rotateComponents).toBe(false)
    // MOCK_LAYOUT already reads left to right, so the orientation pass is a
    // no-op on it
    expect(model.layoutResult).toEqual({ ...MOCK_LAYOUT, stranded: true })
  })

  test('the engine setting reaches the layout request, and a change re-asks', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'plain')
    expect(layoutArgs(0).options.engine).toBe('fmmm')

    model.setLayoutEngine('stress')
    await model.recomputeLayout()

    expect(layoutCalls()).toHaveLength(2)
    expect(layoutArgs(1).options.engine).toBe('stress')
  })

  test('recomputeLayout follows a switch back to auto', async () => {
    rpcRespond()
    const model = createModel()
    model.setLayoutMode('force')
    await model.loadGFA(RGFA, 'rgfa')
    expect(layoutCalls()).toHaveLength(1)

    model.setLayoutMode('auto')
    await model.recomputeLayout()

    // still one — the anchored recompute is local
    expect(layoutCalls()).toHaveLength(1)
    expect(model.layoutResult).not.toEqual(MOCK_LAYOUT)
  })

  test('a plain GFA has no anchored option to offer, and no seeds', async () => {
    rpcRespond()
    const model = createModel()
    await model.loadGFA(SIMPLE_GFA, 'plain')

    expect(layoutCalls()).toHaveLength(1)
    const { graph, options } = layoutArgs(0)
    expect(graph.nodes.some(n => 'x' in n || 'y' in n)).toBe(false)
    expect('rotateComponents' in options).toBe(false)
  })

  // What the settings dialog shows its engine-only controls against. An
  // anchored layout never reaches the engine, so the quality and the bubble
  // spread do nothing there; an anchored mode on a graph it cannot draw falls
  // through to the engine, and they do.
  test('usesLayoutEngine tracks which drawing the engine made', async () => {
    rpcRespond()
    const model = createModel()
    expect(model.usesLayoutEngine).toBe(false)

    await model.loadGFA(RGFA, 'rgfa')
    expect(model.usesLayoutEngine).toBe(true)

    model.setLayoutMode('auto')
    expect(model.usesLayoutEngine).toBe(false)

    // an rGFA with a backbone but nothing off it has no sample rows to draw,
    // so that mode hands off like 'force' does
    model.setLayoutMode('samplerows')
    expect(model.usesLayoutEngine).toBe(false)
    await model.loadGFA(
      'H\tVN:Z:1.0\nS\t1\tACGT\tSN:Z:chr\tSO:i:0\tSR:i:0\n',
      'backbone only',
    )
    expect(model.usesLayoutEngine).toBe(true)
  })

  // A deletion edge holds its bubble open in a force layout, which an anchored
  // drawing never lets it do
  test('toggling deletion edges lays only a force layout out again', async () => {
    rpcRespond()
    const model = attachedModel()
    await model.loadGFA(RGFA, 'rgfa')
    expect(layoutCalls()).toHaveLength(1)

    model.setLayer('deletions', false)
    await layoutsSettled(model)
    expect(layoutCalls()).toHaveLength(2)

    await model.switchLayout('auto')
    model.setLayer('deletions', true)
    await layoutsSettled(model)
    expect(layoutCalls()).toHaveLength(2)
  })

  // the config editor, Reset track settings, undo and a session delta write
  // the layers without the menu
  test('a deletions layer written from outside the menu lays a force layout out again', async () => {
    rpcRespond()
    const model = attachedModel()
    await model.loadGFA(RGFA, 'rgfa')
    expect(layoutCalls()).toHaveLength(1)

    model.writeGrammar({ layers: { deletions: false } })
    await layoutsSettled(model)

    expect(model.showDeletionEdges).toBe(false)
    expect(layoutCalls()).toHaveLength(2)
  })

  test('an engine setting leaves a layout the engine did not draw alone', async () => {
    rpcRespond()
    const model = attachedModel({ layoutMode: 'auto' })
    await model.loadGFA(RGFA, 'rgfa')
    const drawn = model.layoutResult

    model.setLayoutQuality(4)
    model.setLayer('deletions', false)
    await layoutsSettled(model)

    expect(model.layoutResult).toBe(drawn)
    expect(layoutCalls()).toHaveLength(0)
  })

  test('a force engine picked from the menu lays out once', async () => {
    rpcRespond()
    const model = attachedModel({ layoutMode: 'auto' })
    await model.loadGFA(SIMPLE_GFA, 'plain')
    expect(model.usesLayoutEngine).toBe(true)
    expect(layoutCalls()).toHaveLength(1)
    const pick = (label: string) => {
      ;(
        model.graphMenuItems()[0] as {
          subMenu: (MenuItem & { onClick: () => void })[]
        }
      ).subMenu
        .find(item => item.label === label)!
        .onClick()
    }

    const fmmm = model.layoutResult

    pick('Force-directed (stress)')
    await layoutsSettled(model)
    expect(model.chosenLayoutMode).toBe('force')
    expect(layoutArgs(1).options.engine).toBe('stress')
    expect(layoutCalls()).toHaveLength(2)

    pick('Force-directed (FMMM)')
    await layoutsSettled(model)
    expect(layoutCalls()).toHaveLength(2)
    expect(model.layoutResult).toBe(fmmm)
  })

  test('the node cap lays out again only a layout that draws nodes', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    rpcRespond()
    const model = attachedModel()
    await model.loadGFA(WALKED_GFA, 'plain')

    model.setMaxGraphNodes(1)
    await layoutsSettled(model)
    expect(String(model.error)).toMatch(/too large to draw/i)

    await model.switchLayout('walkrows')
    expect(model.error).toBeUndefined()
    const drawn = model.layoutResult
    model.setMaxGraphNodes(5000)
    await layoutsSettled(model)
    expect(model.layoutResult).toBe(drawn)
    consoleSpy.mockRestore()
  })

  // Comparing the two drawings is the workflow the README leads with, and the
  // force half of it costs seconds. Going back to a layout already computed
  // for this graph re-runs nothing.
  test('a force layout already computed for this graph is not recomputed', async () => {
    rpcRespond()
    const model = createModel()
    model.setLayoutMode('force')
    await model.loadGFA(RGFA, 'rgfa')
    expect(layoutCalls()).toHaveLength(1)
    const forceResult = model.layoutResult

    model.setLayoutMode('auto')
    await model.recomputeLayout()
    expect(model.layoutResult).not.toBe(forceResult)

    model.setLayoutMode('force')
    await model.recomputeLayout()

    expect(layoutCalls()).toHaveLength(1)
    expect(model.layoutResult).toBe(forceResult)
  })

  // The engine reads the quality, the linear flag, the bubble spread and, for
  // an anchored graph, the seeds, which follow the reference path. It never
  // reads the colour scheme, so choosing one costs no FMMM run.
  test('a setting the engine does not read costs no layout', async () => {
    rpcRespond()
    const model = createModel()
    model.setLayoutMode('force')
    await model.loadGFA(PGGB_GFA, 'pggb')
    expect(layoutCalls()).toHaveLength(1)

    model.setColorScheme('uniform')
    await model.recomputeLayout()
    expect(layoutCalls()).toHaveLength(1)

    // re-anchoring moves every seed, so it is a fresh layout
    model.setReferencePath('Sakai#1#chr')
    await model.recomputeLayout()
    expect(layoutCalls()).toHaveLength(2)

    model.setBubbleSpread('wide')
    await model.recomputeLayout()
    expect(layoutCalls()).toHaveLength(3)
  })

  test('a reloaded graph does not reuse the old one’s layout', async () => {
    rpcRespond()
    const model = createModel()
    model.setLayoutMode('force')
    await model.loadGFA(RGFA, 'rgfa')
    await model.loadGFA(RGFA, 'rgfa')

    expect(layoutCalls()).toHaveLength(2)
  })

  // A force layout takes seconds and the dropdown does not wait for it, so the
  // slow one is still in flight when the next choice is made. Whichever
  // RESOLVES last used to win, which is the wrong one: the anchored layout
  // lands instantly and the abandoned force result then painted over it, with
  // the dropdown still reading "Anchored".
  test('a superseded layout does not land after the one that replaced it', async () => {
    let releaseForce: (() => void) | undefined
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GraphComputeLayout'
        ? new Promise(resolve => {
            releaseForce = () => {
              resolve({ result: MOCK_LAYOUT, duration: 5 })
            }
          })
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createModel()
    model.setLayoutMode('force')
    const pending = model.loadGFA(RGFA, 'rgfa')

    model.setLayoutMode('auto')
    await model.recomputeLayout()
    const anchored = model.layoutResult
    expect(anchored).not.toEqual(MOCK_LAYOUT)

    releaseForce!()
    await pending

    expect(model.layoutResult).toBe(anchored)
  })

  // Same ordering, on the failure path. The abandoned layout's error is not
  // about the drawing the user is looking at.
  test('a superseded layout that fails does not raise an error over the live one', async () => {
    let failForce: (() => void) | undefined
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GraphComputeLayout'
        ? new Promise((_resolve, reject) => {
            failForce = () => {
              reject(new Error('engine died'))
            }
          })
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createModel()
    model.setLayoutMode('force')
    const pending = model.loadGFA(RGFA, 'rgfa')

    model.setLayoutMode('auto')
    await model.recomputeLayout()
    const anchored = model.layoutResult

    failForce!()
    await pending

    expect(model.error).toBeUndefined()
    expect(model.layoutResult).toBe(anchored)
  })
})

// pggb/odgi: no segment carries a coordinate, so the only ones in the file are
// in the P line names. One bubble, K12 taking `2` and Sakai taking `3`.
const PGGB_GFA =
  'H\tVN:Z:1.0\n' +
  'S\t1\tAAAAA\n' +
  'S\t2\tC\n' +
  'S\t3\tG\n' +
  'S\t4\tTTTTT\n' +
  'L\t1\t+\t2\t+\t0M\nL\t1\t+\t3\t+\t0M\n' +
  'L\t2\t+\t4\t+\t0M\nL\t3\t+\t4\t+\t0M\n' +
  'P\tK12#1#chr:100-111\t1+,2+,4+\t*\n' +
  'P\tSakai#1#chr:200-211\t1+,3+,4+\t*\n'

describe('reference path', () => {
  beforeEach(() => {
    mockRpcCall.mockReset()
    mockSession.tracks = []
  })

  function layoutCalls() {
    return mockRpcCall.mock.calls.filter(c => c[1] === 'GraphComputeLayout')
  }

  function backboneStarts(model: ReturnType<typeof createModel>) {
    return model
      .graph!.nodes.filter(n => n.stable?.rank === 0)
      .map(n => `${n.name}@${n.stable!.start}`)
      .sort()
  }

  test('a whole-file pggb import anchors on the first path in the file', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(PGGB_GFA, 'pggb')

    expect(model.activeReferencePath).toBe('K12#1#chr')
    // laid out from the walk, so the force engine is never reached
    expect(layoutCalls()).toHaveLength(0)
    expect(backboneStarts(model)).toEqual(['1@100', '2@105', '4@106'])
  })

  test('the picker moves the backbone onto another path', async () => {
    rpcRespond()
    const model = createAnchoredModel()
    await model.loadGFA(PGGB_GFA, 'pggb')

    model.setReferencePath('Sakai#1#chr')
    await model.recomputeLayout()

    expect(model.activeReferencePath).toBe('Sakai#1#chr')
    expect(backboneStarts(model)).toEqual(['1@200', '3@205', '4@206'])
    // re-anchored from the recorded walk, not re-parsed and not re-laid-out
    // by the engine
    expect(layoutCalls()).toHaveLength(0)
  })

  // A subgraph cut from a track was cut against one assembly, and that is the
  // one the linear view beside it is showing — so it is the axis to draw,
  // without the user having to say so.
  test('a subgraph anchors on the assembly it was cut against', async () => {
    mockRpcCall.mockImplementation((_sid: unknown, method: string) =>
      method === 'GetSubgraph'
        ? Promise.resolve(PGGB_GFA)
        : Promise.reject(new Error(`Unexpected RPC: ${method}`)),
    )
    const model = createModel()
    await model.cutSubgraph(
      {},
      { refName: 'chr', assemblyName: 'Sakai', start: 200, end: 211 },
    )

    expect(model.activeReferencePath).toBe('Sakai#1#chr')
  })

  // An explicit choice outranks the inference, and survives a session reload —
  // otherwise a restored view silently redraws against a different axis.
  test('an explicit choice outranks the region and round-trips', async () => {
    rpcRespond()
    const model = createModel()
    model.setReferencePath('Sakai')
    expect(getSnapshot(model).referencePath).toBe('Sakai')

    await model.loadGFA(PGGB_GFA, 'pggb')
    expect(model.activeReferencePath).toBe('Sakai#1#chr')
  })

  // rGFA states its own coordinates, so a stale or wrong path name must not
  // reach them.
  test('rGFA ignores the setting', async () => {
    rpcRespond()
    const model = createModel()
    model.setReferencePath('alt')
    await model.loadGFA(RGFA, 'rgfa')

    expect(model.activeReferencePath).toBeUndefined()
    expect(backboneStarts(model)).toEqual(['1@0', '2@4'])
  })
})

// The pggb figure drew as a chain of same-sized bubbles because every node in a
// 400 bp window fell below the engine's minimumNodeLength and clamped to one
// drawn length. Guard the property that actually broke — that node lengths stay
// *proportional* — rather than the constant, which is free to be retuned.
describe('bandageAutoScale', () => {
  function drawnLength(opts: ReturnType<typeof bandageAutoScale>, bp: number) {
    return Math.max(
      (opts.nodeLengthPerMegabase * bp) / 1_000_000,
      opts.minimumNodeLength,
    )
  }

  // the real ecoli_pggb_subgraph: 20 SNP alleles of 1 bp plus 11 longer
  // segments, 545 bp total
  const pggbLengths = [
    ...Array<number>(20).fill(1),
    3,
    5,
    5,
    12,
    14,
    35,
    62,
    73,
    75,
    77,
    164,
  ]
  const graphOf = (lengths: number[]) =>
    ({
      nodes: lengths.map((length, i) => ({ id: `${i}`, name: `${i}`, length })),
      edges: [],
    }) as unknown as Parameters<typeof bandageAutoScale>[0]

  test('a 1 bp SNP allele does not draw the size of a 164 bp segment', () => {
    const opts = bandageAutoScale(graphOf(pggbLengths))
    const ratio = drawnLength(opts, 164) / drawnLength(opts, 1)
    expect(ratio).toBeGreaterThan(10)
  })

  test('scales to the graph rather than using a fixed per-megabase constant', () => {
    // same node count, 1000x longer nodes: the derived scale must fall to
    // compensate, so the drawn sizes stay in the same range
    const small = bandageAutoScale(graphOf(pggbLengths))
    const large = bandageAutoScale(graphOf(pggbLengths.map(l => l * 1000)))
    expect(large.nodeLengthPerMegabase).toBeLessThan(
      small.nodeLengthPerMegabase,
    )
    expect(drawnLength(large, 164_000)).toBeCloseTo(drawnLength(small, 164), 5)
  })

  test('an empty graph cannot divide by zero', () => {
    expect(bandageAutoScale(graphOf([])).nodeLengthPerMegabase).toBe(10_000)
  })
})

// Bubble spread is the force layout's legibility knob, and 'auto' has to leave
// the drawing exactly as it was — every existing force figure is committed
// against it, and the proportionality test above is stated at that setting.
describe('bubbleSpread', () => {
  // the real minigraph cut behind `pangenome/graph_resolution`: a 16.4 kb
  // backbone segment and a 4.4 kb one, against five alleles of 6-154 bp
  const minigraphLengths = [16_417, 4_423, 154, 88, 65, 33, 6]
  const graphOf = (lengths: number[]) =>
    ({
      nodes: lengths.map((length, i) => ({ id: `${i}`, name: `${i}`, length })),
      edges: [],
    }) as unknown as Graph

  // What the engine does with what we hand it (`settings.h`,
  // `getDrawnNodeLength`): linear in the node's length, with a floor.
  function drawn(scaling: ReturnType<typeof layoutScaling>, index: number) {
    const { nodeLengthPerMegabase, minimumNodeLength } = scaling.opts
    const length = scaling.nodes[index]!.length
    return Math.max(
      (nodeLengthPerMegabase * length) / 1_000_000,
      minimumNodeLength,
    )
  }

  const lengthsUnder = (spread: string) => {
    const scaling = layoutScaling(graphOf(minigraphLengths), spreadFor(spread))
    return minigraphLengths.map((_, i) => drawn(scaling, i))
  }

  test("'auto' hands the engine the graph's own nodes, untransformed", () => {
    const graph = graphOf(minigraphLengths)
    const scaling = layoutScaling(graph, spreadFor('auto'))
    // identity, not a copy: the proportional path must not round-trip lengths
    // through a rounding step FMMM is free to amplify
    expect(scaling.nodes).toBe(graph.nodes)
    expect(scaling.opts).toStrictEqual(bandageAutoScale(graph))
  })

  // The equivalence that lets the law replace the old linear scale outright
  // rather than sit beside it.
  test("the proportional law reproduces bandageAutoScale's own drawn lengths", () => {
    const graph = graphOf(minigraphLengths)
    const scale = bandageAutoScale(graph)
    const law = drawnLengthFor(graph, PROPORTIONAL_LENGTH)
    for (const bp of minigraphLengths) {
      expect(law(bp)).toBeCloseTo(
        Math.max((scale.nodeLengthPerMegabase * bp) / 1_000_000, 5),
        6,
      )
    }
  })

  test('compressing shrinks the drawn length range', () => {
    const range = (lengths: number[]) => maxOf(lengths) / minOf(lengths)
    // the rope: on the real cut the longest node draws tens of times the
    // shortest, so zoom-to-fit frames the long one and the alleles vanish
    expect(range(lengthsUnder('auto'))).toBeGreaterThan(20)
    expect(range(lengthsUnder('compress'))).toBeLessThan(5)
  })

  // The property a per-node floor did not have, and the reason it could only be
  // afforded on a small cut: compressing against the mean leaves the drawing
  // the size it already was, so the same setting works at any node count.
  test('compressing does not inflate the total drawing', () => {
    const total = (lengths: number[]) => lengths.reduce((a, b) => a + b, 0)
    const proportional = total(lengthsUnder('auto'))
    expect(total(lengthsUnder('compress'))).toBeLessThan(proportional * 1.5)
  })

  test('every allele clears the floor it used to clamp to', () => {
    // 6 bp against a 3 kb mean is 5 units proportionally, which is the engine's
    // own minimum: indistinguishable from the 33 bp and 65 bp beside it
    const auto = lengthsUnder('auto')
    expect(auto.at(-1)).toBe(5)
    expect(auto.at(-2)).toBe(5)
    const compressed = lengthsUnder('compress')
    expect(compressed.at(-1)).toBeGreaterThan(5)
    expect(compressed.at(-1)).toBeLessThan(compressed.at(-2)!)
  })

  test('an unknown spread draws proportionally rather than throwing', () => {
    expect(spreadFor('nonsense')).toStrictEqual({
      law: PROPORTIONAL_LENGTH,
      minNodeLength: 0,
    })
  })

  // The floor and the law are alternatives, not a stack, and the floor-based
  // spreads have to keep drawing exactly what they drew before the law existed:
  // every figure committed against them predates it.
  test('the floor-based spreads still raise a floor and nothing else', () => {
    const graph = graphOf(minigraphLengths)
    for (const spread of ['open', 'wide']) {
      const scaling = layoutScaling(graph, spreadFor(spread))
      expect(scaling.nodes).toBe(graph.nodes)
      expect(scaling.opts.nodeLengthPerMegabase).toBe(
        bandageAutoScale(graph).nodeLengthPerMegabase,
      )
      expect(scaling.opts.minimumNodeLength).toBeGreaterThan(40)
    }
    expect(
      layoutScaling(graph, spreadFor('wide')).opts.minimumNodeLength,
    ).toBeGreaterThan(
      layoutScaling(graph, spreadFor('open')).opts.minimumNodeLength,
    )
  })

  // What each instrument is for: a floor leaves the long node long, the law
  // does not. That difference is why both are kept.
  test('a floor keeps the top end proportional where the law compresses it', () => {
    const longest = (spread: string) => lengthsUnder(spread)[0]!
    expect(longest('open')).toBe(longest('auto'))
    expect(longest('compress')).toBeLessThan(longest('auto') / 3)
  })
})

describe('a morph cut short', () => {
  // a bubble, so no run merges and the layout sees every node
  const BUBBLE =
    'H\tVN:Z:1.0\nS\t1\tACGT\nS\t2\tGG\nS\t3\tCC\nS\t4\tTTTT\nL\t1\t+\t2\t+\t0M\nL\t1\t+\t3\t+\t0M\nL\t2\t+\t4\t+\t0M\nL\t3\t+\t4\t+\t0M\n'
  let frames: [number, () => void][] = []
  let nextFrame = 1
  let now = 0
  const runFrames = (ms: number) => {
    for (let t = 0; t < ms; t += 16) {
      now += 16
      const due = frames
      frames = []
      due.forEach(([, cb]) => {
        cb()
      })
    }
  }

  beforeEach(() => {
    frames = []
    now = 0
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
      frames.push([nextFrame, cb])
      return nextFrame++
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frames = frames.filter(([i]) => i !== id)
    })
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    // the first layout in a row, the second in a column, so a morph between
    // them moves every node
    let calls = 0
    mockRpcCall.mockReset()
    mockRpcCall.mockImplementation(
      (_sid: unknown, method: string, args: { graph: Graph }) => {
        if (method !== 'GraphComputeLayout') {
          return Promise.reject(new Error(`Unexpected RPC: ${method}`))
        }
        const column = calls++ > 0
        const nodePositions = Object.fromEntries(
          args.graph.nodes.map(({ id }, i) => [
            id,
            column
              ? [
                  { x: 1000, y: i * 40 },
                  { x: 1000, y: i * 40 + 20 },
                ]
              : [
                  { x: i * 10, y: 0 },
                  { x: i * 10 + 5, y: 0 },
                ],
          ]),
        )
        return Promise.resolve({ result: { nodePositions }, duration: 5 })
      },
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('leaves the cached layout it was blending at its ends', async () => {
    const model = createModel()
    await model.loadGFA(BUBBLE, 'g')
    const a = model.layoutResult!
    const aEnds = structuredClone(a.nodePositions)
    await toggleDeletionEdges(model)
    const b = model.layoutResult!
    runFrames(1000)
    const bEnds = structuredClone(b.nodePositions)
    await toggleDeletionEdges(model)
    runFrames(1000)
    await toggleDeletionEdges(model)
    expect(model.layoutResult).toBe(b)
    runFrames(100)
    await toggleDeletionEdges(model)
    expect(model.layoutResult).toBe(a)
    runFrames(1000)
    expect(a.nodePositions).toEqual(aEnds)
    await toggleDeletionEdges(model)
    expect(model.layoutResult).toBe(b)
    runFrames(1000)
    expect(b.nodePositions).toEqual(bEnds)
  })

  test('fades in what the next graph brings', async () => {
    const model = createModel()
    await model.loadGFA(BUBBLE, 'g')
    runFrames(1000)
    await model.loadGFA(`${BUBBLE}S\t5\tAA\nL\t4\t+\t5\t+\t0M\n`, 'g')
    expect([...(model.morphEntering?.ids ?? [])]).toEqual(['5+'])
    expect(model.morphEntering?.alpha).toBe(0)
    const alphaOf = (id: string) => {
      const batch = model.buildDrawing(undefined, false)!.batch
      const run = batch.nodeStrokeRuns.get(id)!
      return abgrAlpha(batch.nodeStrokes[run.start]!.color)
    }
    expect(alphaOf('5+')).toBe(0)
    expect(alphaOf('4+')).toBe(255)
    runFrames(160)
    expect(model.morphEntering?.alpha).toBeGreaterThan(0)
    runFrames(1000)
    expect(model.morphEntering).toBeUndefined()
    expect(alphaOf('5+')).toBe(255)
  })

  test('runs on when the cache hands back the layout on screen', async () => {
    const model = createModel()
    await model.loadGFA(BUBBLE, 'g')
    await toggleDeletionEdges(model)
    const b = model.layoutResult!
    runFrames(1000)
    const bEnds = structuredClone(b.nodePositions)
    await toggleDeletionEdges(model)
    runFrames(1000)
    await toggleDeletionEdges(model)
    runFrames(100)
    await model.recomputeLayout()
    expect(model.layoutResult).toBe(b)
    runFrames(1000)
    expect(b.nodePositions).toEqual(bEnds)
  })
})
