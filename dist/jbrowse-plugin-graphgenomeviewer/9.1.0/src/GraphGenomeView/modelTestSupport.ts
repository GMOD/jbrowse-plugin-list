import { types } from '@jbrowse/mobx-state-tree'
import { expect, vi } from 'vitest'

import { mockRpcCall } from './modelTestMocks'
import stateModelFactory from './viewModel'

import type { GraphLayers } from './graphLayers'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { Renderer } from '@jbrowse/bandage-core/renderer/types'

export const minOf = (v: number[]) => v.reduce((a, b) => Math.min(a, b))
export const maxOf = (v: number[]) => v.reduce((a, b) => Math.max(a, b))

export const SIMPLE_GFA =
  'H\tVN:Z:1.0\nS\t1\tACGT\nS\t2\tGGCC\nL\t1\t+\t2\t+\t0M\n'
export const WALKED_GFA = `${SIMPLE_GFA}W\tGRCh38\t0\tchr1\t0\t8\t>1>2\nW\tA\t1\tctg\t0\t8\t>1>2\n`

export const MOCK_LAYOUT = {
  nodePositions: {
    '1+': [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ],
    '1-': [
      { x: 0, y: 5 },
      { x: 5, y: 5 },
    ],
    '2+': [
      { x: 10, y: 0 },
      { x: 15, y: 0 },
    ],
    '2-': [
      { x: 10, y: 5 },
      { x: 15, y: 5 },
    ],
  },
}

export function rpcRespond() {
  mockRpcCall.mockImplementation((_sid: unknown, method: string) => {
    if (method === 'GetSubgraph') {
      return Promise.resolve(SIMPLE_GFA)
    }
    if (method === 'GraphComputeLayout') {
      return Promise.resolve({ result: MOCK_LAYOUT, duration: 5 })
    }
    return Promise.reject(new Error(`Unexpected RPC: ${method}`))
  })
}

export function fakeRenderer() {
  return {
    resize: () => {},
    uploadGeometry: () => {},
    updateTransform: () => {},
    render: () => {},
    setNodeHighlights: () => {},
    setEdgeHighlight: () => {},
    dispose: () => {},
  } as unknown as Renderer
}

export function createModel() {
  return stateModelFactory().create({ type: 'GraphGenomeView' })
}

// The view defaults to the force layout, so a test about a reference-anchored
// drawing has to select one — the same way the anchored figures do.
export function createAnchoredModel(props: { layers?: GraphLayers } = {}) {
  return stateModelFactory().create({
    type: 'GraphGenomeView',
    layoutMode: 'auto',
    ...props,
  })
}

// A view attached to a tree, so afterAttach installs its reactions. A root
// model never attaches.
export function attachedModel(
  props: { layoutMode?: LayoutModeValue; [key: string]: unknown } = {},
) {
  return types
    .model({ view: stateModelFactory() })
    .create({ view: { type: 'GraphGenomeView', ...props } }).view
}

// waits until every layout a reaction asked for has finished
export function layoutsSettled(model: { isLoading: boolean }) {
  return vi.waitFor(() => {
    expect(model.isLoading).toBe(false)
  })
}

// The menu's deletions toggle, then the relayout the engine reaction runs on
// an attached view. A root model installs no reactions.
export async function toggleDeletionEdges(
  model: ReturnType<typeof createModel>,
) {
  model.setLayer('deletions', !model.showDeletionEdges)
  await model.recomputeLayout()
}

export const TEST_REGION = {
  refName: 'chr1',
  assemblyName: 'hg38',
  start: 1000,
  end: 5000,
}

export const TEST_TRACK = {
  trackId: 'rgfa-track',
  adapter: { type: 'RgfaTabixAdapter' },
}

export function restoredView(snapshot: Record<string, unknown> = {}) {
  return stateModelFactory().create({
    type: 'GraphGenomeView',
    loadedTrackId: 'rgfa-track',
    loadedRegion: TEST_REGION,
    ...snapshot,
  } as never)
}

// rGFA: SN/SO/SR make the graph anchorable, so `auto` lays it out from the file
// and never reaches the WASM engine.
export const RGFA =
  'H\tVN:Z:1.0\n' +
  'S\t1\tACGT\tSN:Z:chr\tSO:i:0\tSR:i:0\n' +
  'S\t2\tGGCC\tSN:Z:chr\tSO:i:4\tSR:i:0\n' +
  'S\t3\tTTTT\tSN:Z:alt\tSO:i:0\tSR:i:1\n' +
  'L\t1\t+\t2\t+\t0M\nL\t1\t+\t3\t+\t0M\n'

export interface MenuItem {
  label?: string
  checked?: boolean
  subMenu?: MenuItem[]
}
