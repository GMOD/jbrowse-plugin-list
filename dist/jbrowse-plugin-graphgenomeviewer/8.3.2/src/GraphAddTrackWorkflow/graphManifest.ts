import { openLocation } from '@jbrowse/core/util/io'

import {
  GRAPH_SUFFIX,
  SEGMENTS_SUFFIX,
  locationName,
  readsSiblings,
  renamed,
} from '../locationName'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { FileLocation } from '@jbrowse/core/util'

// The part of `<prefix>.graph.json`, written by `gfa-to-tabix build`, that
// Open track reads
export interface GraphManifest {
  reference?: string
  // `format: 2` when the tier is one `<prefix>.graph.bed.gz`, as gfa-to-tabix
  // 2 writes it, rather than a segments and links pair
  tier?: { prefix: string; foldBelowBp: number; format?: 2 }
}

const FETCH_TIMEOUT_MS = 5000

// A bare file name beside the manifest: no directory, scheme or leading dot
function isSiblingName(name: unknown): name is string {
  return typeof name === 'string' && /^[\w+-][\w.+-]*$/.test(name)
}

function isAbsent(value: unknown) {
  return value === undefined || value === null
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTier(tier: unknown): tier is NonNullable<GraphManifest['tier']> {
  return (
    isPlainRecord(tier) &&
    isSiblingName(tier.prefix) &&
    typeof tier.foldBelowBp === 'number' &&
    Number.isFinite(tier.foldBelowBp) &&
    tier.foldBelowBp > 0
  )
}

export function parseGraphManifest(text: string): GraphManifest | undefined {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return undefined
  }
  if (!isPlainRecord(json) || json.schema !== 1) {
    return undefined
  }
  const { reference, tier, index, contig, bubbles, alleles } = json
  const valid =
    (isAbsent(reference) ||
      (typeof reference === 'string' && reference.trim() !== '')) &&
    (isAbsent(tier) || isTier(tier)) &&
    [index, contig, bubbles, alleles].every(
      f => isAbsent(f) || isSiblingName(f),
    )
  if (!valid) {
    return undefined
  }
  return {
    ...(typeof reference === 'string' ? { reference: reference.trim() } : {}),
    ...(isTier(tier)
      ? {
          tier: {
            prefix: tier.prefix,
            foldBelowBp: tier.foldBelowBp,
            ...(tier.format === 2 ? { format: 2 as const } : {}),
          },
        }
      : {}),
  }
}

// A file the manifest names, in the directory of the segments file opened
export function besideSegments(segs: FileLocation, fileName: string) {
  return renamed(segs, name => name.replace(/[^/\\]*$/, fileName))
}

// The suffix of a gfa-to-tabix index file: format 1's segments BED or format
// 2's graph BED
function indexSuffix(loc: FileLocation) {
  const name = locationName(loc)
  return [SEGMENTS_SUFFIX, GRAPH_SUFFIX].find(suffix => name.endsWith(suffix))
}

// A segments BED, or format 2's graph BED, the rest of the index and the
// manifest can be found beside
export function isGraphIndexLocation(loc: FileLocation) {
  return readsSiblings(loc) && indexSuffix(loc) !== undefined
}

// `<prefix><suffix>` beside `<prefix>.segs.bed.gz` or `<prefix>.graph.bed.gz`
export function segmentsSibling(segs: FileLocation, suffix: string) {
  const own = indexSuffix(segs) ?? SEGMENTS_SUFFIX
  return renamed(segs, name => `${name.slice(0, -own.length)}${suffix}`)
}

export function manifestLocation(segs: FileLocation) {
  return isGraphIndexLocation(segs)
    ? segmentsSibling(segs, '.graph.json')
    : undefined
}

// Undefined for a manifest that is missing, unreadable or not schema 1, so
// Open track falls back to the files beside the segments alone
export async function readGraphManifest(
  segs: FileLocation,
  pluginManager?: PluginManager,
) {
  const loc = manifestLocation(segs)
  if (!loc) {
    return undefined
  }
  try {
    const text = await openLocation(loc, pluginManager).readFile({
      encoding: 'utf8',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    return parseGraphManifest(text)
  } catch {
    return undefined
  }
}
