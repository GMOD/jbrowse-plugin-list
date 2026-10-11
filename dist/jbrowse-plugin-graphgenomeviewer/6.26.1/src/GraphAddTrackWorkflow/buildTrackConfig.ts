import { makeIndexType } from '@jbrowse/core/util/tracks'

import { besideSegments } from './graphManifest'
import { locationName, readsSiblings, renamed } from '../locationName'

import type { GraphManifest } from './graphManifest'
import type { FileLocation } from '@jbrowse/core/util'

export type GraphFileChoice =
  'RgfaTabixAdapter' | 'GbzBaseSyntenyAdapter' | 'MinigraphBubbleAdapter'

export const GRAPH_FILE_LABELS: Record<GraphFileChoice, string> = {
  RgfaTabixAdapter: 'rGFA segments (tabix BED pair)',
  GbzBaseSyntenyAdapter: 'GBZ database (.gbz.db)',
  MinigraphBubbleAdapter: 'Minigraph bubbles (tabix BED)',
}

export const GRAPH_FILE_FIELDS: Record<GraphFileChoice, string> = {
  RgfaTabixAdapter:
    'Path to segments BED (.segs.bed.gz from gfa-to-tabix; the .links.bed.gz, its index and any .graph.json are read beside it)',
  GbzBaseSyntenyAdapter: 'Path to the .gbz.db written by gbz-base construct',
  MinigraphBubbleAdapter: 'Path to bubbles BED (.bed.gz from gfatools bubble)',
}

const TABIX_INDEX_FIELD =
  'Path to tabix index (optional; the sibling .tbi is assumed, a .csi is recognised by name)'

export const GRAPH_INDEX_FIELDS: Record<GraphFileChoice, string> = {
  RgfaTabixAdapter: TABIX_INDEX_FIELD,
  GbzBaseSyntenyAdapter:
    'Path to the haplotype index (optional; graph.haplotype-index.db beside the database is assumed)',
  MinigraphBubbleAdapter: TABIX_INDEX_FIELD,
}

const SEGMENTS_SUFFIX = '.segs.bed.gz'

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

function coarseTier(
  loc: FileLocation,
  indexLoc: FileLocation | undefined,
  tier: GraphManifest['tier'],
) {
  if (!tier) {
    return {}
  }
  const segs = besideSegments(loc, `${tier.prefix}${SEGMENTS_SUFFIX}`)
  const links = besideSegments(loc, `${tier.prefix}.links.bed.gz`)
  return {
    coarse: {
      foldBelowBp: tier.foldBelowBp,
      segmentsLocation: segs,
      segmentsIndex: siblingIndex(segs, indexLoc),
      linksLocation: links,
      linksIndex: siblingIndex(links, indexLoc),
    },
  }
}

// The user's sample wins; the manifest's reference stands in when blank
function manifestPanSN(
  assembly: string,
  sample: string,
  reference: string | undefined,
) {
  const fromManifest = reference === assembly ? undefined : reference
  return panSN(assembly, sample.trim() || fromManifest || '')
}

// a bgzipped GAF is read by its tabix index, a plain one whole
function readsConfig(readsLoc: FileLocation | undefined) {
  return readsLoc
    ? {
        readsLocation: readsLoc,
        ...(locationName(readsLoc).endsWith('.gz') && readsSiblings(readsLoc)
          ? { readsIndex: { location: sibling(readsLoc, '.tbi') } }
          : {}),
      }
    : {}
}

export function buildAdapterConfig({
  choice,
  loc,
  indexLoc,
  readsLoc,
  manifest,
  assembly,
  sample,
}: {
  choice: GraphFileChoice
  loc: FileLocation
  indexLoc: FileLocation | undefined
  // a GBZ track's GAF reads, which no other choice takes
  readsLoc?: FileLocation
  // the `.graph.json` beside an rGFA segments file
  manifest?: GraphManifest
  assembly: string
  sample: string
}) {
  if (choice === 'GbzBaseSyntenyAdapter') {
    return {
      type: 'GbzBaseSyntenyAdapter',
      gbzDbLocation: loc,
      ...(indexLoc ? { haplotypeIndexLocation: indexLoc } : {}),
      assemblyNames: [assembly],
      ...readsConfig(readsLoc),
      ...panSN(assembly, sample),
    }
  }
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
    ...manifestPanSN(assembly, sample, manifest?.reference),
    ...coarseTier(loc, indexLoc, manifest?.tier),
  }
}

export function buildTrackConfig(args: {
  choice: GraphFileChoice
  loc: FileLocation
  indexLoc: FileLocation | undefined
  readsLoc?: FileLocation
  manifest?: GraphManifest
  assembly: string
  sample: string
  trackId: string
  name: string
}) {
  const { choice, assembly, trackId, name } = args
  return {
    type: choice === 'MinigraphBubbleAdapter' ? 'FeatureTrack' : 'GraphTrack',
    trackId,
    name,
    assemblyNames: [assembly],
    adapter: buildAdapterConfig(args),
    ...(choice === 'RgfaTabixAdapter'
      ? { displayDefaults: { showLabels: 'none' } }
      : {}),
  }
}
