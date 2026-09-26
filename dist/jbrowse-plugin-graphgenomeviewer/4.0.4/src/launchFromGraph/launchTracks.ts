import { readConfObject } from '@jbrowse/core/configuration'

import type { TrackScanSession } from '../launchSubgraph/subgraphTracks'

const ANNOTATION_TRACK_TYPE = 'FeatureTrack'

// What to turn on in a linear view the graph opens on `assemblyName`.
//
// A launch used to carry the graph's own track and nothing else, and that track
// is configured for the reference alone — so `Launch view` → `CFT073 chr:…`
// landed on `No tracks active`, which answers "where is this strain's sequence?"
// with an empty pane. What the session does hold for a contributing assembly is
// that assembly's own annotation, and on a pangenome config that is one track
// per strain (`CFT073_genes`), which is exactly what makes the landing readable.
//
// Annotation tracks only, not everything configured for the assembly. A launch
// is a jump to a locus, and an alignments or coverage track turned on behind the
// user's back fetches data nobody asked for; a FeatureTrack at a 50 kb window is
// a tabix range query. The graph's own segments track is a FeatureTrack too, so
// the reference case still gets it from the same scan.
//
// `first` is the graph's own track when the launch is on the reference, so the
// segments the graph drew sit at the top of the view rather than wherever config
// order puts them.
export function launchTracks({
  session,
  assemblyName,
  first,
}: {
  session: TrackScanSession
  assemblyName: string
  first?: string
}) {
  const found: string[] = []
  for (const track of session.tracks) {
    const type: unknown = readConfObject(track, 'type')
    const assemblyNames: unknown = readConfObject(track, 'assemblyNames')
    const trackId: unknown = readConfObject(track, 'trackId')
    if (
      type === ANNOTATION_TRACK_TYPE &&
      Array.isArray(assemblyNames) &&
      assemblyNames.includes(assemblyName) &&
      typeof trackId === 'string' &&
      trackId !== first
    ) {
      found.push(trackId)
    }
  }
  return first ? [first, ...found] : found
}
