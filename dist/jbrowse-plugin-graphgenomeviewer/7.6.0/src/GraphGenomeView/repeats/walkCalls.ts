import type { RepeatCall } from './repeatFeatures'

// Which genotyped allele belongs to which haplotype walk. A VCF states a
// sample's alleles in genotype order, which is the genotyper's own order and
// carries no correspondence to the assembly's haplotype numbering — TRGTdb's
// ABCA7 record, for one, lists them shortest first. So the walks and the
// alleles are paired by length instead: the pairing whose total difference is
// smallest, which for lengths on a line is the non-crossing one.
//
// A walk that does not reach both flanking reference nodes is measured whole
// rather than across the array, and an allele no read spanned is a copy of the
// one that was called. Neither states a length for this array, so they pair
// last and take no verdict — pairing them first let a walk that stops inside
// the array take the allele that fit one spanning it, and the spanning walk
// then read as a disagreement.

interface WalkCall extends RepeatCall {
  // undefined where the walk and the allele are not both measurements
  agrees?: boolean
}

// Every walk/call pair over the 94 HPRC samples TRGT genotyped at the ABCA7
// VNTR is either within 8% of its allele or more than 14% from it, so any
// threshold across that gap separates them the same way.
export const CALL_TOLERANCE = 0.1

function agrees(walkBp: number, callBp: number) {
  return Math.abs(callBp - walkBp) <= CALL_TOLERANCE * Math.max(walkBp, callBp)
}

// Pair two ascending lists of lengths, leaving out the surplus of whichever is
// longer. `out[i]` is the index in `calls` that `walks[i]` took.
function nearest(walks: number[], calls: number[]) {
  const W = walks.length
  const C = calls.length
  const cost = Array.from({ length: W + 1 }, () => new Array(C + 1).fill(0))
  const paired = Array.from({ length: W + 1 }, () =>
    new Array<boolean>(C + 1).fill(false),
  )
  for (let i = W - 1; i >= 0; i--) {
    for (let j = C - 1; j >= 0; j--) {
      const together = Math.abs(walks[i]! - calls[j]!) + cost[i + 1]![j + 1]!
      const dropWalk = W - i > C - j ? cost[i + 1]![j]! : Infinity
      const dropCall = C - j > W - i ? cost[i]![j + 1]! : Infinity
      cost[i]![j] = Math.min(together, dropWalk, dropCall)
      paired[i]![j] = cost[i]![j] === together
    }
  }
  const out = new Array<number | undefined>(W).fill(undefined)
  for (let i = 0, j = 0; i < W && j < C;) {
    if (paired[i]![j]) {
      out[i++] = j++
    } else if (W - i > C - j) {
      i++
    } else {
      j++
    }
  }
  return out
}

function byLength<T>(items: T[], bp: (item: T) => number) {
  return items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => bp(a.item) - bp(b.item))
}

const backed = (call: RepeatCall) => call.spanningReads !== 0

function scored(row: { bp: number; complete: boolean }, call: RepeatCall) {
  return {
    ...call,
    agrees: row.complete && backed(call) ? agrees(row.bp, call.bp) : undefined,
  }
}

// A phased genotype names its walk's haplotype outright, though a contig
// break can give that haplotype two walks. Within a haplotype, and among the
// unphased alleles, pairing goes by length: the walks that span the array
// against the alleles reads spanned, then everything else against what those
// two left. That decides the ambiguous cases on merit: which walk takes the
// one allele a lone spanning read supports, and which allele a walk that stops
// inside the array is drawn against.
function pairSample<
  R extends { bp: number; complete: boolean; haplotype?: number },
>(rows: R[], calls: RepeatCall[]) {
  const out = new Map<number, WalkCall>()
  const taken = new Set<RepeatCall>()
  const ranked = byLength(rows, r => r.bp)
  const pair = (pool: typeof ranked, group: RepeatCall[]) => {
    const stages = [
      [pool.filter(r => r.item.complete), group.filter(backed)],
      [pool, group],
    ] as const
    for (const [walks, alleles] of stages) {
      const free = walks.filter(r => !out.has(r.i))
      const open = byLength(
        alleles.filter(call => !taken.has(call)),
        call => call.bp,
      )
      nearest(
        free.map(r => r.item.bp),
        open.map(c => c.item.bp),
      ).forEach((pick, k) => {
        if (pick !== undefined) {
          const row = free[k]!
          const call = open[pick]!.item
          taken.add(call)
          out.set(row.i, scored(row.item, call))
        }
      })
    }
  }
  for (const haplotype of new Set(calls.flatMap(c => c.haplotype ?? []))) {
    pair(
      ranked.filter(r => r.item.haplotype === haplotype),
      calls.filter(c => c.haplotype === haplotype),
    )
  }
  pair(
    ranked,
    calls.filter(c => c.haplotype === undefined),
  )
  return out
}

export function withCalls<
  R extends {
    sample: string
    bp: number
    complete: boolean
    haplotype?: number
  },
>(rows: R[], calls: Record<string, RepeatCall[]> | undefined) {
  if (!calls) {
    return rows as (R & { call?: WalkCall })[]
  }
  const paired = new Map<R, WalkCall>()
  const bySample = new Map<string, R[]>()
  for (const row of rows) {
    const group = bySample.get(row.sample)
    if (group) {
      group.push(row)
    } else {
      bySample.set(row.sample, [row])
    }
  }
  for (const [sample, group] of bySample) {
    const called = calls[sample]
    if (called) {
      for (const [i, call] of pairSample(group, called)) {
        paired.set(group[i]!, call)
      }
    }
  }
  return rows.map(row => ({ ...row, call: paired.get(row) }))
}
