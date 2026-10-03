import { makeIndexType } from '@jbrowse/core/util/tracks'

import type { FileLocation } from '@jbrowse/core/util'

export type GraphFileChoice = 'RgfaTabixAdapter' | 'MinigraphBubbleAdapter'

export const GRAPH_FILE_LABELS: Record<GraphFileChoice, string> = {
  RgfaTabixAdapter: 'rGFA segments (tabix BED pair)',
  MinigraphBubbleAdapter: 'Minigraph bubbles (tabix BED)',
}

export const GRAPH_FILE_FIELDS: Record<GraphFileChoice, string> = {
  RgfaTabixAdapter:
    'Path to segments BED (.segs.bed.gz from build_rgfa_tabix.sh; the .links.bed.gz and both .tbi are assumed beside it)',
  MinigraphBubbleAdapter:
    'Path to bubbles BED (.bed.gz from gfatools bubble; the .tbi is assumed beside it)',
}

const SEGMENTS_SUFFIX = '.segs.bed.gz'

// A url's query string (a presigned signature, a token) follows the file name
export function splitUri(uri: string) {
  const end = uri.search(/[?#]/)
  return end === -1
    ? { name: uri, query: '' }
    : { name: uri.slice(0, end), query: uri.slice(end) }
}

export function locationName(loc: FileLocation) {
  return 'uri' in loc
    ? splitUri(loc.uri).name
    : 'localPath' in loc
      ? loc.localPath
      : loc.name
}

// A file picked in the browser comes without the directory it sat in
export function readsSiblings(loc: FileLocation) {
  return 'uri' in loc || 'localPath' in loc
}

export function renamed(loc: FileLocation, rename: (name: string) => string) {
  if ('uri' in loc) {
    const { name, query } = splitUri(loc.uri)
    return { ...loc, uri: rename(name) + query }
  } else if ('localPath' in loc) {
    return { ...loc, localPath: rename(loc.localPath) }
  } else {
    throw new Error(
      `${loc.name} was picked in the browser, which reads no file beside it; open it by URL`,
    )
  }
}

function sibling(loc: FileLocation, suffix: string) {
  return renamed(loc, name => name + suffix)
}

// A segments BED the links BED can be found beside
export function isSegmentsLocation(loc: FileLocation) {
  return readsSiblings(loc) && locationName(loc).endsWith(SEGMENTS_SUFFIX)
}

function linksLocation(loc: FileLocation) {
  if (!locationName(loc).endsWith(SEGMENTS_SUFFIX)) {
    throw new Error(
      `Expected a segments BED ending in ${SEGMENTS_SUFFIX}, got ${locationName(loc)}`,
    )
  }
  return renamed(
    loc,
    name => `${name.slice(0, -SEGMENTS_SUFFIX.length)}.links.bed.gz`,
  )
}

function tabixIndex(loc: FileLocation, indexLoc: FileLocation | undefined) {
  return indexLoc
    ? {
        location: indexLoc,
        indexType: makeIndexType(locationName(indexLoc), 'CSI', 'TBI'),
      }
    : { location: sibling(loc, '.tbi'), indexType: 'TBI' }
}

// The links file's index is assumed beside it, of the kind the segments' is.
function siblingIndex(loc: FileLocation, indexLoc: FileLocation | undefined) {
  const csi =
    indexLoc !== undefined &&
    makeIndexType(locationName(indexLoc), 'CSI', 'TBI') === 'CSI'
  return csi
    ? { location: sibling(loc, '.csi'), indexType: 'CSI' }
    : { location: sibling(loc, '.tbi'), indexType: 'TBI' }
}

function panSN(assembly: string, sample: string) {
  const name = sample.trim()
  return name ? { assemblyNameToPanSN: { [assembly]: name } } : {}
}

export function buildAdapterConfig({
  choice,
  loc,
  indexLoc,
  assembly,
  sample,
}: {
  choice: GraphFileChoice
  loc: FileLocation
  indexLoc: FileLocation | undefined
  assembly: string
  sample: string
}) {
  if (choice === 'MinigraphBubbleAdapter') {
    return {
      type: 'MinigraphBubbleAdapter',
      bubblesLocation: loc,
      index: tabixIndex(loc, indexLoc),
      ...panSN(assembly, sample),
    }
  }
  const links = linksLocation(loc)
  return {
    type: 'RgfaTabixAdapter',
    segmentsLocation: loc,
    segmentsIndex: tabixIndex(loc, indexLoc),
    linksLocation: links,
    linksIndex: siblingIndex(links, indexLoc),
    ...panSN(assembly, sample),
  }
}

export function buildTrackConfig(args: {
  choice: GraphFileChoice
  loc: FileLocation
  indexLoc: FileLocation | undefined
  assembly: string
  sample: string
  trackId: string
  name: string
}) {
  const { choice, assembly, trackId, name } = args
  return {
    type: choice === 'RgfaTabixAdapter' ? 'GraphTrack' : 'FeatureTrack',
    trackId,
    name,
    assemblyNames: [assembly],
    adapter: buildAdapterConfig(args),
    ...(choice === 'RgfaTabixAdapter'
      ? { displayDefaults: { showLabels: 'none' } }
      : {}),
  }
}
