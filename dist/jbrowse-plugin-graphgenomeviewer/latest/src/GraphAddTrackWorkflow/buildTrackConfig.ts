import { makeIndexType } from '@jbrowse/core/util/tracks'

import { besideSegments, segmentsSibling } from './graphManifest'
import {
  SEGMENTS_SUFFIX,
  WALKS_SUFFIX,
  locationName,
  readsSiblings,
  renamed,
  walkFileSample,
} from '../locationName'

import type { GraphManifest } from './graphManifest'
import type { FileLocation } from '@jbrowse/core/util'

// 'RgfaTabixWalks' is an RgfaTabixAdapter read from a walk file
export type GraphFileChoice =
  | 'RgfaTabixAdapter'
  | 'RgfaTabixWalks'
  | 'GbzBaseSyntenyAdapter'
  | 'MinigraphBubbleAdapter'

export const GRAPH_FILE_LABELS: Record<GraphFileChoice, string> = {
  RgfaTabixAdapter: 'rGFA segments (tabix BED pair)',
  RgfaTabixWalks: 'Haplotype walks (.walks.bed.gz)',
  GbzBaseSyntenyAdapter: 'GBZ database (.gbz.db)',
  MinigraphBubbleAdapter: 'Minigraph bubbles (tabix BED)',
}

export const GRAPH_FILE_FIELDS: Record<GraphFileChoice, string> = {
  RgfaTabixAdapter:
    'Path to segments BED (.segs.bed.gz from gfa-to-tabix; the .links.bed.gz, its index and any .graph.json are read beside it)',
  RgfaTabixWalks:
    'Path to a walk file (<prefix>.<sample>.walks.bed.gz from gfa-to-tabix --walks, for the sample this assembly is)',
  GbzBaseSyntenyAdapter: 'Path to the .gbz.db written by gbz-base construct',
  MinigraphBubbleAdapter: 'Path to bubbles BED (.bed.gz from gfatools bubble)',
}

const TABIX_INDEX_FIELD =
  'Path to tabix index (optional; the sibling .tbi is assumed, a .csi is recognised by name)'

export const GRAPH_INDEX_FIELDS: Record<GraphFileChoice, string> = {
  RgfaTabixAdapter: TABIX_INDEX_FIELD,
  RgfaTabixWalks: TABIX_INDEX_FIELD,
  GbzBaseSyntenyAdapter:
    'Path to the haplotype index (optional; graph.haplotype-index.db beside the database is assumed)',
  MinigraphBubbleAdapter: TABIX_INDEX_FIELD,
}

function sibling(loc: FileLocation, suffix: string) {
  return renamed(loc, name => name + suffix)
}

function linksLocation(loc: FileLocation) {
  if (!locationName(loc).endsWith(SEGMENTS_SUFFIX)) {
    throw new Error(
      `Expected a segments BED ending in ${SEGMENTS_SUFFIX}, got ${locationName(loc)}`,
    )
  }
  return segmentsSibling(loc, '.links.bed.gz')
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

// none for a guessed config, which knows no assembly yet; see withWalkReference
function panSN(assembly: string, sample: string) {
  const name = sample.trim()
  return name && assembly ? { assemblyNameToPanSN: { [assembly]: name } } : {}
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

// The user's sample wins; the reference the graph's files name (a manifest's,
// or a walk file's own) stands in when blank
function referencePanSN(
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

// Names typed as a list, by comma or space
export function parseHaplotypes(text: string) {
  return text.split(/[\s,]+/).filter(name => name !== '')
}

export function buildAdapterConfig({
  choice,
  loc,
  indexLoc,
  readsLoc,
  manifest,
  assembly,
  sample,
  haplotypes = [],
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
  // a walk file's haplotypes to cut for until the user picks others
  haplotypes?: string[]
}) {
  if (choice === 'RgfaTabixWalks') {
    if (!locationName(loc).endsWith(WALKS_SUFFIX)) {
      throw new Error(
        `Expected a walk file ending in ${WALKS_SUFFIX}, got ${locationName(loc)}`,
      )
    }
    return {
      type: 'RgfaTabixAdapter',
      walksLocation: loc,
      walksIndex: tabixIndex(loc, indexLoc),
      ...referencePanSN(assembly, sample, walkFileSample(loc)),
      ...(haplotypes.length > 0 ? { defaultHaplotypes: haplotypes } : {}),
    }
  }
  if (choice === 'GbzBaseSyntenyAdapter') {
    return {
      type: 'GbzBaseSyntenyAdapter',
      gbzDbLocation: loc,
      ...(indexLoc ? { haplotypeIndexLocation: indexLoc } : {}),
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
    ...referencePanSN(assembly, sample, manifest?.reference),
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
  haplotypes?: string[]
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
    ...(choice === 'RgfaTabixAdapter' || choice === 'RgfaTabixWalks'
      ? { displayDefaults: { showLabels: 'none' } }
      : {}),
  }
}
