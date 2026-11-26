/**
 * Groups each sample's reads by the alleles they share, so the rows of one
 * haplotype sit together instead of interleaving with the other's.
 *
 * A site is a position in the window where a sample's reads disagree too often
 * for read error: a base, a deletion, or an insertion some reads have and others
 * lack. At a tandem array the site is the copy count, split between the alleles
 * the reads call. Reads join the group whose allele counts they contradict
 * least, a site counting for more the more bases its event spans. No ploidy is
 * assumed, since a trio band, a tumour and the X each want a different one.
 */
import { alleleModes } from './alleleModes'
import { ABSENT, SPANNED_GAP } from './readLayout'

import type { ArrayBlock } from './alleles'
import type { ReadLayout } from './readLayout'

const MIN_SITE_FRACTION = 0.25
const MIN_SITE_READS = 2
const MIN_SITE_DEPTH = 0.5
const MAX_DISTANCE = 0.3
const MIN_GROUP_FRACTION = 0.15

const UNKNOWN = -1

interface Site {
  /** bases the event spans, which orders sites and weights their votes */
  bp: number
  pos: number
  states: Map<string, 0 | 1>
}

interface Group {
  counts: [number, number][]
  members: string[]
}

function charAt(read: ReadLayout, pos: number) {
  const i = pos - read.start
  return i >= 0 && i < read.refChars.length ? read.refChars[i]! : ABSENT
}

function spansSlot(read: ReadLayout, pos: number) {
  return (
    read.insertions.has(pos) ||
    (charAt(read, pos) !== ABSENT && charAt(read, pos - 1) !== ABSENT)
  )
}

function isVariant(alt: number, depth: number) {
  const minor = Math.min(alt, depth - alt)
  return minor >= MIN_SITE_READS && minor >= MIN_SITE_FRACTION * depth
}

function isInformative(states: Map<string, 0 | 1>) {
  let alt = 0
  for (const state of states.values()) {
    alt += state
  }
  return isVariant(alt, states.size)
}

const insertedLength = (ins: string) => ins.replaceAll(SPANNED_GAP, '').length

function commonestLength(lengths: number[]) {
  const counts = new Map<number, number>()
  for (const length of lengths) {
    counts.set(length, (counts.get(length) ?? 0) + 1)
  }
  return [...counts].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? 0
}

function insertionSites(reads: ReadLayout[], skip: (pos: number) => boolean) {
  const lengthsAt = new Map<number, number[]>()
  for (const read of reads) {
    for (const [pos, ins] of read.insertions) {
      const length = insertedLength(ins)
      if (length > 0 && !skip(pos)) {
        const lengths = lengthsAt.get(pos) ?? []
        lengths.push(length)
        lengthsAt.set(pos, lengths)
      }
    }
  }
  return [...lengthsAt].map(([pos, lengths]): Site => {
    const typical = commonestLength(lengths)
    const states = new Map<string, 0 | 1>()
    for (const read of reads) {
      if (spansSlot(read, pos)) {
        const length = insertedLength(read.insertions.get(pos) ?? '')
        states.set(read.name, 2 * length >= typical ? 1 : 0)
      }
    }
    return { bp: typical, pos, states }
  })
}

/**
 * A site per position and non-reference base or deletion reads have there.
 * Without a reference row the commonest character stands in for it.
 */
function baseSites(
  reads: ReadLayout[],
  reference: ReadLayout | undefined,
  skip: (pos: number) => boolean,
  window: { start: number; end: number },
) {
  const charsAt = new Map<number, Map<string, number>>()
  for (const read of reads) {
    const from = Math.max(0, window.start - read.start)
    const to = Math.min(read.refChars.length, window.end - read.start)
    for (let i = from; i < to; i++) {
      const char = read.refChars[i]!
      const pos = read.start + i
      if (char !== ABSENT && !skip(pos)) {
        const counts = charsAt.get(pos) ?? new Map<string, number>()
        counts.set(char, (counts.get(char) ?? 0) + 1)
        charsAt.set(pos, counts)
      }
    }
  }
  const sites: Site[] = []
  for (const [pos, counts] of charsAt) {
    const depth = [...counts.values()].reduce((a, b) => a + b, 0)
    const ref = reference
      ? charAt(reference, pos)
      : [...counts].sort((a, b) => b[1] - a[1])[0]![0]
    for (const [alt, count] of counts) {
      if (alt !== ref && isVariant(count, depth)) {
        const states = new Map<string, 0 | 1>()
        for (const read of reads) {
          const char = charAt(read, pos)
          if (char !== ABSENT) {
            states.set(read.name, char === alt ? 1 : 0)
          }
        }
        sites.push({ bp: 1, pos, states })
      }
    }
  }
  return sites
}

/**
 * A site per boundary between two copy counts the sample's reads call as
 * alleles, each read above or below the midpoint between them
 */
function arraySites(reads: ReadLayout[], arrays: ArrayBlock[]) {
  return arrays.flatMap(array => {
    const copies = reads.flatMap(read => {
      const c = array.copiesByName.get(read.name)
      return c === undefined ? [] : [c]
    })
    const modes = alleleModes(copies).map(mode => mode.value)
    return modes.slice(1).map((upper, i): Site => {
      const lower = modes[i]!
      const states = new Map<string, 0 | 1>()
      for (const read of reads) {
        const c = array.copiesByName.get(read.name)
        if (c !== undefined) {
          states.set(read.name, 2 * c > lower + upper ? 1 : 0)
        }
      }
      return { bp: (upper - lower) * array.period, pos: array.start, states }
    })
  })
}

function distance(vector: number[], group: Group, weights: number[]) {
  let overlap = 0
  let mismatch = 0
  for (let i = 0; i < vector.length; i++) {
    const state = vector[i]!
    const [ref, alt] = group.counts[i]!
    if (state !== UNKNOWN && ref + alt > 0) {
      overlap += weights[i]!
      mismatch += (weights[i]! * (state === 1 ? ref : alt)) / (ref + alt)
    }
  }
  return overlap ? mismatch / overlap : Infinity
}

function newGroup(sites: number): Group {
  return {
    counts: Array.from({ length: sites }, (): [number, number] => [0, 0]),
    members: [],
  }
}

function add(group: Group, name: string, vector: number[]) {
  group.members.push(name)
  for (let i = 0; i < vector.length; i++) {
    const counts = group.counts[i]!
    if (vector[i] === 1) {
      counts[1]++
    } else if (vector[i] === 0) {
      counts[0]++
    }
  }
}

function nearest(vector: number[], groups: Group[], weights: number[]) {
  return groups.reduce<{ group?: Group; distance: number }>(
    (best, group) => {
      const d = distance(vector, group, weights)
      return d < best.distance ? { group, distance: d } : best
    },
    { distance: Infinity },
  )
}

/**
 * Compares the alleles two groups carry, heaviest site first and alt before
 * ref, so groups come in the same order in every band: the one with an
 * insertion above the one without.
 */
function compareGroups(a: Group, b: Group) {
  const mode = ([ref, alt]: [number, number]) =>
    ref + alt === 0 ? 2 : alt > ref ? 0 : 1
  const differing = a.counts.findIndex(
    (counts, i) => mode(counts) !== mode(b.counts[i]!),
  )
  return differing === -1
    ? b.members.length - a.members.length
    : mode(a.counts[differing]!) - mode(b.counts[differing]!)
}

function clusterSample(
  reads: ReadLayout[],
  reference: ReadLayout | undefined,
  arrays: ArrayBlock[],
  window: { start: number; end: number },
) {
  const skip = (pos: number) =>
    pos < window.start ||
    pos >= window.end ||
    arrays.some(array => pos >= array.start && pos <= array.end)
  const sites = [
    ...arraySites(reads, arrays),
    ...insertionSites(reads, skip),
    ...baseSites(reads, reference, skip, window),
  ]
    .filter(
      site =>
        site.states.size >= MIN_SITE_DEPTH * reads.length &&
        isInformative(site.states),
    )
    .sort((a, b) => b.bp - a.bp || a.pos - b.pos)
  const weights = sites.map(site => 1 + Math.log2(site.bp))
  const vectors = new Map(
    reads.map(read => [
      read.name,
      sites.map(site => site.states.get(read.name) ?? UNKNOWN),
    ]),
  )
  const known = new Map(
    [...vectors].map(([name, v]) => [
      name,
      v.filter(state => state !== UNKNOWN).length,
    ]),
  )
  const informative = reads
    .map(read => read.name)
    .filter(name => known.get(name)! > 0)
    .sort((a, b) => known.get(b)! - known.get(a)!)

  const seeds: Group[] = []
  for (const name of informative) {
    const vector = vectors.get(name)!
    const { group, distance: d } = nearest(vector, seeds, weights)
    if (group && d <= MAX_DISTANCE) {
      add(group, name, vector)
    } else {
      const created = newGroup(sites.length)
      add(created, name, vector)
      seeds.push(created)
    }
  }
  const minSize = Math.max(
    MIN_SITE_READS,
    MIN_GROUP_FRACTION * informative.length,
  )
  const big = (group: Group) => group.members.length >= minSize
  const regroup = (leaders: Group[]) => {
    const ret = leaders.map(() => newGroup(sites.length))
    for (const name of informative) {
      const vector = vectors.get(name)!
      const { group } = nearest(vector, leaders, weights)
      if (group) {
        add(ret[leaders.indexOf(group)]!, name, vector)
      }
    }
    return ret.filter(group => group.members.length > 0)
  }
  const groups = regroup(regroup(seeds.filter(big)).filter(big))
  return groups.length > 1 ? groups.sort(compareGroups) : []
}

const groupLabel = (index: number) => String.fromCharCode(65 + (index % 26))

/**
 * Each read's group within its sample by row name, `A` the first. A sample
 * whose reads agree has no groups, and a read spanning none of its sample's
 * sites is in none.
 */
export function clusterReads(
  reads: ReadLayout[],
  arrays: ArrayBlock[],
  window: { start: number; end: number },
  referenceName?: string,
) {
  const reference = reads.find(read => read.name === referenceName)
  const bySample = new Map<string | undefined, ReadLayout[]>()
  for (const read of reads) {
    if (read !== reference) {
      const sampleReads = bySample.get(read.sample) ?? []
      sampleReads.push(read)
      bySample.set(read.sample, sampleReads)
    }
  }
  const ret = new Map<string, string>()
  for (const sampleReads of bySample.values()) {
    clusterSample(sampleReads, reference, arrays, window).forEach(
      (group, i) => {
        for (const name of group.members) {
          ret.set(name, groupLabel(i))
        }
      },
    )
  }
  return ret
}
