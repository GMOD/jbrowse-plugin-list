import type { SubgraphRegion } from '../launchSubgraph/launchSubgraphView'

// The members of a LinearGenomeView the follow reads and drives. Structural,
// because this plugin takes no runtime dependency on the LGV plugin (see
// hoverSync/index.tsx).
export interface FollowedBlock {
  refName: string
  assemblyName: string
  start: number
  end: number
  offsetPx: number
  reversed?: boolean
  displayedRegionIndex?: number
}

export interface FollowedView {
  id: string
  initialized: boolean
  bpPerPx: number
  offsetPx: number
  width: number
  displayedRegions: readonly { start: number; end: number }[]
  dynamicBlocks: { contentBlocks: readonly FollowedBlock[] }
  coarseDynamicBlocks: readonly FollowedBlock[]
  horizontalScroll: (distance: number) => number
  zoomTo: (bpPerPx: number, offset?: number) => number
}

export function isFollowable(view: unknown): view is FollowedView {
  if (typeof view !== 'object' || view === null) {
    return false
  }
  const v = view as Record<string, unknown>
  return (
    typeof v.horizontalScroll === 'function' &&
    typeof v.zoomTo === 'function' &&
    'coarseDynamicBlocks' in v &&
    'dynamicBlocks' in v
  )
}

// launchSubgraphView's widestBlock, restated rather than imported: that module
// imports the model, which imports this.
function widest(blocks: readonly FollowedBlock[]) {
  return blocks.reduce<FollowedBlock | undefined>(
    (best, b) => (best && best.end - best.start >= b.end - b.start ? best : b),
    undefined,
  )
}

export interface FollowWindow {
  refName: string
  assemblyName: string
  start: number
  end: number
  bpPerPx: number
  // the view's width in bp, which the margin is sized by: a block at a contig
  // end is clipped, the zoom is not
  span: number
  regionStart: number
  regionEnd: number
}

// x is reference bp on an anchored layout, so the graph shows what the linear
// view shows when one bp is as many px in both and the cut's refName sits at
// the same screen x. Undefined when the linear view shows no block of that
// refName, which is a re-cut's job rather than the frame's.
export function followFrame(view: FollowedView, region: SubgraphRegion) {
  const block = widest(
    view.dynamicBlocks.contentBlocks.filter(
      b =>
        b.refName === region.refName && b.assemblyName === region.assemblyName,
    ),
  )
  const { bpPerPx } = view
  return block && bpPerPx > 0
    ? {
        scale: 1 / bpPerPx,
        translateX: block.offsetPx - view.offsetPx - block.start / bpPerPx,
      }
    : undefined
}

// Read off the LIVE blocks even when the coarse ones woke the caller: those
// name where the window was half a second ago (SyntenyFollow/CLAUDE.md).
export function followWindow(view: FollowedView): FollowWindow | undefined {
  const block = widest(view.dynamicBlocks.contentBlocks)
  const displayed =
    block?.displayedRegionIndex === undefined
      ? undefined
      : view.displayedRegions[block.displayedRegionIndex]
  return block && view.bpPerPx > 0
    ? {
        refName: block.refName,
        assemblyName: block.assemblyName,
        start: block.start,
        end: block.end,
        bpPerPx: view.bpPerPx,
        span: view.bpPerPx * view.width,
        regionStart: displayed?.start ?? block.start,
        regionEnd: displayed?.end ?? block.end,
      }
    : undefined
}

// The window plus one window-width each side, clamped to the displayed
// region, with the margins narrowed until the whole cut fits under `capBp`.
export function followCut(window: FollowWindow, capBp: number): SubgraphRegion {
  const visible = window.end - window.start
  const margin = Math.max(0, Math.min(window.span, (capBp - visible) / 2))
  return {
    refName: window.refName,
    assemblyName: window.assemblyName,
    start: Math.max(window.regionStart, Math.floor(window.start - margin)),
    end: Math.min(window.regionEnd, Math.ceil(window.end + margin)),
  }
}

export function cutHolds(
  cut: SubgraphRegion | undefined,
  window: FollowWindow,
) {
  return (
    cut?.refName === window.refName &&
    cut.assemblyName === window.assemblyName &&
    cut.start <= window.start &&
    window.end <= cut.end
  )
}
