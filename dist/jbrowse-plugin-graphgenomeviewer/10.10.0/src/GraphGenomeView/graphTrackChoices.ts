import { toTrackConfigEntry } from '@jbrowse/core/util/tracks'

import { GRAPH_ADAPTERS } from '../graphTrackConfig'
import { graphTrackReach, hasCoarseTier } from '../graphTrackReach'
import { isArray, isRecord } from '../isRecord'
import { withRows } from '../launchFromGraph/linearViewTarget'

import type { AnyTrackConfig } from '@jbrowse/core/configuration'

export interface GraphTrackChoice {
  trackId: string
  name: string
  // the graph's reference, the assembly a linear view shows it on
  assembly: string
  reach: string
  anyZoom: boolean
}

// under the node cap on a walk graph dense enough to put ~40,000 nodes in
// 100 kb
export const FIRST_LOOK_BP = 20_000

function choiceOf(track: AnyTrackConfig): GraphTrackChoice[] {
  const entry: unknown = toTrackConfigEntry(track)
  const { trackId, name, assemblyNames, adapter } = isRecord(entry) ? entry : {}
  const assembly = isArray(assemblyNames) ? assemblyNames[0] : undefined
  return typeof trackId === 'string' &&
    isRecord(adapter) &&
    typeof adapter.type === 'string' &&
    GRAPH_ADAPTERS.has(adapter.type) &&
    typeof assembly === 'string'
    ? [
        {
          trackId,
          name: typeof name === 'string' && name ? name : trackId,
          assembly,
          reach: graphTrackReach(adapter),
          anyZoom: hasCoarseTier(adapter),
        },
      ]
    : []
}

// The session's graph tracks, those drawing at any zoom first
export function graphTrackChoices(tracks: AnyTrackConfig[]) {
  const choices = tracks.flatMap(choiceOf)
  return [...choices.filter(c => c.anyZoom), ...choices.filter(c => !c.anyZoom)]
}

// What an open linear view on `assembly` shows, when one view alone does
export function viewedLocString(views: unknown[], assembly: string) {
  const shown = withRows(views).flatMap(view =>
    isRecord(view) &&
    view.type === 'LinearGenomeView' &&
    Array.isArray(view.assemblyNames) &&
    view.assemblyNames.includes(assembly) &&
    typeof view.visibleLocStrings === 'string' &&
    view.visibleLocStrings !== ''
      ? [view.visibleLocStrings]
      : [],
  )
  return shown.length === 1 ? shown[0] : undefined
}

// A first region that draws: a whole contig where the track has a coarse
// tier for it, else its first FIRST_LOOK_BP
export function firstLookLocString(
  choice: GraphTrackChoice,
  firstRegion: { refName: string; start: number; end: number },
) {
  const { refName, start, end } = firstRegion
  return choice.anyZoom
    ? refName
    : `${refName}:${(start + 1).toLocaleString('en-US')}-${Math.min(end, start + FIRST_LOOK_BP).toLocaleString('en-US')}`
}
