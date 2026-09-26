import { MAX_GRAPH_REGION_BP, formatSpanBp } from '../GraphGenomeView/model'
import { locLabel } from '../launchFromGraph/contributors'

import type { NotificationLevel, Region } from '@jbrowse/core/util'

// Only the two session members the launch uses, so the return type of addView
// (which this ignores) can't couple the launcher to a session shape.
export interface SubgraphLaunchSession {
  addView: (type: string, snapshot: Record<string, unknown>) => unknown
  notify: (message: string, level?: NotificationLevel) => void
}

// The launch item's wording, shared by the two places that offer the same
// extent: the linear view's own menu and a graph track's track menu. They said
// "(visible region)" and "(this region)" for one thing until they were made to
// agree, and the tutorials only ever documented the second — so one constant
// holds the agreement rather than a comment on one of the two copies asking
// for it.
//
// Still a literal in `src/`, which is what jbrowse-components'
// `website/scripts/check-menu-labels.ts` scans to catch a documented
// `**Track menu → …**` path naming a dropdown this plugin no longer renders.
export const SUBGRAPH_REGION_LABEL = 'Graph genome view (this region)'

export interface SubgraphRegion {
  refName: string
  assemblyName: string
  start: number
  end: number
}

// Half the segment's own length on either side, so it opens with the graph
// around it rather than clipped to its own ends, and within the displayed
// region it sits in, since navTo refuses a span outside one. The 10 bp floor
// keeps a single-base segment from opening a degenerate region.
export function regionAroundSegment(
  region: SubgraphRegion,
  within: { start: number; end: number } = { start: 0, end: Infinity },
): SubgraphRegion {
  const padding = Math.max(10, Math.floor((region.end - region.start) * 0.5))
  return {
    ...region,
    start: Math.max(within.start, region.start - padding),
    end: Math.min(within.end, region.end + padding),
  }
}

// The one block a launch runs on, out of however many the view or the selection
// covers. A subgraph spans one stable sequence, so a span crossing a region
// boundary has to pick: the widest, which is the sequence the user is mostly
// looking at. Taking the first is worse here than anywhere, because the size cap
// then reads the wrong block — a view scrolled 3 bp past a boundary offers an
// enabled menu item that cuts a 3 bp graph, where the widest block would have
// said "zoom in".
//
// Widest in bp rather than in pixels: a dynamic block carries widthPx and a
// selected region does not, and within one view bpPerPx is uniform, so the two
// orders agree.
export function widestBlock<T extends { start: number; end: number }>(
  blocks: T[],
) {
  return blocks.reduce<T | undefined>(
    (best, block) =>
      best && best.end - best.start >= block.end - block.start ? best : block,
    undefined,
  )
}

// The span of a linear view or of a selection in one, as a region to cut from.
export function regionFromViewport(blocks: Region[]) {
  const block = widestBlock(blocks)
  return block
    ? {
        refName: block.refName,
        assemblyName: block.assemblyName,
        start: Math.max(0, Math.floor(block.start)),
        end: Math.floor(block.end),
      }
    : undefined
}

// Why a region can't be cut, or undefined if it can. A menu item shows this as
// the reason it is greyed out, so the cap is something the user reads before
// clicking rather than a notification afterwards.
export function subgraphRegionProblem(region: SubgraphRegion) {
  const span = region.end - region.start
  return span > MAX_GRAPH_REGION_BP
    ? `Region is ${formatSpanBp(span)} — zoom in or select a smaller range (max ${formatSpanBp(MAX_GRAPH_REGION_BP)})`
    : undefined
}

// The launch is a plain snapshot: `loadedTrackId`/`loadedRegion` are persisted
// view props, and the view fetches them when its canvas mounts — the same path
// a reloaded session takes, so a launched view is restorable for free and the
// menu does no RPC of its own.
//
// The size cap is checked here as well as in loadFromTabixSubgraph because past
// it the view would open only to display its own error.
export function launchSubgraphView({
  session,
  region,
  trackId,
  connectedViewId,
  haplotypes,
}: {
  session: SubgraphLaunchSession
  region: SubgraphRegion
  trackId: string
  // The linear view being launched from. Pairs the two views for the hover
  // sync (hoverSync/graphViewHighlights), and the graph follows it.
  connectedViewId?: string
  // The set the cut is for, from the track's own lane selection; undefined is
  // every haplotype. See subgraphHaplotypes on the view.
  haplotypes?: string[] | undefined
}) {
  const regionSize = region.end - region.start
  if (regionSize > MAX_GRAPH_REGION_BP) {
    session.notify(
      `Region too large (${formatSpanBp(regionSize)}) — zoom in to open a graph view (max ${formatSpanBp(MAX_GRAPH_REGION_BP)})`,
      'warning',
    )
  } else {
    // A launch from a linear view follows it, which needs x to be reference
    // bp, so it opens anchored; force stays one click away behind Pin.
    session.addView('GraphGenomeView', {
      // 1-based, as the linear view this was launched from reads
      displayName: `Graph — ${locLabel(region)}`,
      loadedTrackId: trackId,
      loadedRegion: region,
      subgraphHaplotypes: haplotypes,
      connectedViewId,
      followLinearView: connectedViewId !== undefined,
      ...(connectedViewId === undefined ? {} : { layoutMode: 'auto' }),
    })
  }
}
