import { SATURATED_PATH_COUNT } from '../../MinigraphBubbleAdapter/bubbleLine'

import type { MinigraphBubble } from '../../MinigraphBubbleAdapter/bubbleLine'

// What kind of variation a bubble is, read off the numbers `gfatools bubble`
// states: the reference interval it replaces, its shortest and longest route,
// how many routes, and whether one of them inverts. The reference route is one
// of the routes and its length is the interval, so the shortest and longest
// against the interval say whether the alternatives add sequence, remove it,
// or swap it. Whether it is a repeat is not in those numbers: a
// presence/absence insertion carried by many haplotypes has the same shape as
// an expanding array, so that comes from the session's repeat annotation.
export type BubbleKind =
  | 'snp'
  | 'substitution'
  | 'insertion'
  | 'deletion'
  | 'inversion'
  | 'repeat'
  | 'superbubble'
  | 'complex'

export interface BubbleClass {
  kind: BubbleKind
  label: string
}

// An annotated tandem repeat array over the cut (repeats/repeatFeatures).
// Its refName is not compared: the arrays are read over the same window as
// the bubbles, which spell the reference their own way (PanSN).
export interface RepeatSpan {
  start: number
  end: number
  name?: string
}

// How far past its reference length an array's alleles may run and still be
// copies of it: KIV-2's 40 kb array carries 175 kb alleles
const REPEAT_GROWTH = 10

// The array covering at least half the bubble's reference interval, or the
// point of an insertion, and long enough to account for its alleles: a
// microsatellite at an insertion point does not make the insertion a repeat.
function coveringRepeat(b: MinigraphBubble, repeats: readonly RepeatSpan[]) {
  const span = b.end - b.start
  const growth = b.longestAlleleLength - b.shortestAlleleLength
  return repeats.find(
    r =>
      growth <= REPEAT_GROWTH * (r.end - r.start) &&
      (span === 0
        ? r.start <= b.start && b.start <= r.end
        : Math.min(b.end, r.end) - Math.max(b.start, r.start) >= span / 2),
  )
}

const SUPERBUBBLE_SEGMENTS = 40

export function formatBp(bp: number) {
  if (bp >= 10_000) {
    return `${(bp / 1000).toFixed(0)} kb`
  }
  if (bp >= 1000) {
    return `${(bp / 1000).toFixed(1)} kb`
  }
  return `${bp} bp`
}

function formatBpRange(shortest: number, longest: number) {
  const low = formatBp(shortest)
  const high = formatBp(longest)
  const unit = high.slice(high.indexOf(' '))
  return low.endsWith(unit)
    ? `${low.slice(0, -unit.length)}–${high}`
    : `${low}–${high}`
}

function routes(count: number) {
  if (count >= SATURATED_PATH_COUNT) {
    return '≥2.1B routes'
  }
  if (count >= 100_000) {
    return `${(count / 1000).toFixed(0)}k routes`
  }
  return `${count} routes`
}

export function classifyBubble(
  b: MinigraphBubble,
  repeats: readonly RepeatSpan[] = [],
): BubbleClass {
  const c = classifyShape(b, repeats)
  return b.partial ? { ...c, label: `${c.label}, partial` } : c
}

function classifyShape(
  b: MinigraphBubble,
  repeats: readonly RepeatSpan[],
): BubbleClass {
  const refSpan = b.end - b.start
  const {
    shortestAlleleLength: shortest,
    longestAlleleLength: longest,
    pathCount,
    segmentCount,
    inversion,
  } = b
  const range = formatBpRange(shortest, longest)
  if (segmentCount >= SUPERBUBBLE_SEGMENTS) {
    return {
      kind: 'superbubble',
      label: `${range} superbubble, ${segmentCount} segments, ${routes(pathCount)}${inversion ? ', inv' : ''}`,
    }
  }
  if (inversion) {
    return { kind: 'inversion', label: `${formatBp(longest)} inv` }
  }
  // routes of one length are substitutions inside an array, not copies
  const repeat = longest !== shortest ? coveringRepeat(b, repeats) : undefined
  if (repeat) {
    const name = repeat.name ? ` (${repeat.name})` : ''
    return {
      kind: 'repeat',
      label: `${range} repeat array${name}, ${routes(pathCount)}`,
    }
  }
  const alleles = pathCount > 2 ? `, ${pathCount} alleles` : ''
  if (shortest === longest && shortest === refSpan) {
    return refSpan <= 1
      ? { kind: 'snp', label: 'SNP' }
      : { kind: 'substitution', label: `${formatBp(refSpan)} sub` }
  }
  if (refSpan === 0 || shortest === refSpan) {
    return {
      kind: 'insertion',
      label: `≤${formatBp(longest - refSpan)} ins${alleles}`,
    }
  }
  if (longest === refSpan) {
    return {
      kind: 'deletion',
      label: `${formatBp(refSpan - shortest)} del${alleles}`,
    }
  }
  return {
    kind: 'complex',
    label: `${formatBp(refSpan)} ref → ${range}, ${pathCount} alleles`,
  }
}

// One hue per kind, the deletion arc's near-black and the reference blue kept
// clear of, so a glyph is not mistaken for either.
export const BUBBLE_KIND_COLORS: Record<BubbleKind, string> = {
  snp: '#5b6b7a',
  substitution: '#5b6b7a',
  insertion: '#2f8fd6',
  deletion: '#c94040',
  inversion: '#e07b00',
  repeat: '#8e3fbf',
  superbubble: '#8e3fbf',
  complex: '#8e3fbf',
}

// The kind as a short name, for a place that has no room for the label
export const BUBBLE_KIND_NAMES: Record<BubbleKind, string> = {
  snp: 'SNP',
  substitution: 'substitution',
  insertion: 'insertion',
  deletion: 'deletion',
  inversion: 'inversion',
  repeat: 'repeat array',
  superbubble: 'superbubble',
  complex: 'site',
}

export function bubbleSegmentIds(b: MinigraphBubble) {
  return b.segments.split(',').filter(Boolean)
}
