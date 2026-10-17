import { openLocation } from '@jbrowse/core/util/io'

import {
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
  tier?: { prefix: string; foldBelowBp: number }
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
      ? { tier: { prefix: tier.prefix, foldBelowBp: tier.foldBelowBp } }
      : {}),
  }
}

// A file the manifest names, in the directory of the segments file opened
export function besideSegments(segs: FileLocation, fileName: string) {
  return renamed(segs, name => name.replace(/[^/\\]*$/, fileName))
}

// A segments BED the links BED and the manifest can be found beside
export function isSegmentsLocation(loc: FileLocation) {
  return readsSiblings(loc) && locationName(loc).endsWith(SEGMENTS_SUFFIX)
}

// `<prefix><suffix>` beside `<prefix>.segs.bed.gz`
export function segmentsSibling(segs: FileLocation, suffix: string) {
  return renamed(
    segs,
    name => `${name.slice(0, -SEGMENTS_SUFFIX.length)}${suffix}`,
  )
}

export function manifestLocation(segs: FileLocation) {
  return isSegmentsLocation(segs)
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
