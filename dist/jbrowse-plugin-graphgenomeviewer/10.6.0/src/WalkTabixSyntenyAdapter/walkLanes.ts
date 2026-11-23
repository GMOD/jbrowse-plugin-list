import { weightedLcs } from '@gmod/gbz-base/lcs'
import { pairAlignments, pairCigar } from '@gmod/gbz-base/pairAlignment'
import { panSNContig } from '@jbrowse/bandage-core/pansn'

import SyntenyFeature from '../synteny/SyntenyFeature.ts'
import { matchFeature } from '../synteny/matchFeature.ts'

import type { ArrayRecord } from './placementRecords.ts'
import type { PairChain, PairEdit } from '@gmod/gbz-base/pairAlignment'
import type {
  WalkDeparture,
  WalkFragment,
  WalkNode,
} from '@jbrowse/graph-walks'

// The longest bubble with equal bases on both sides that is written as
// mismatches; a longer one stays an insertion and a deletion
const BALANCED_BUBBLE_MAX_BP = 50

/**
 * A chain's edits with each short balanced bubble as `X`. The walks carry no
 * bases, so two walks differ wherever they leave a shared node, and a SNP is
 * one base inserted and one deleted until it is read as the mismatch it is.
 */
export function bubblesAsMismatches(edits: PairEdit[]) {
  const out: PairEdit[] = []
  for (let i = 0; i < edits.length; i++) {
    const [op, len] = edits[i]!
    const [nextOp, nextLen] = edits[i + 1] ?? []
    if (
      len === nextLen &&
      len <= BALANCED_BUBBLE_MAX_BP &&
      ((op === 'I' && nextOp === 'D') || (op === 'D' && nextOp === 'I'))
    ) {
      out.push(['X', len])
      i++
    } else {
      out.push([op, len])
    }
  }
  return out
}

// A walk's steps as the handles gbz-base reads, 2 * id + reversed
function handlesOf({ ids, rev }: WalkFragment) {
  const handles = new Array<number>(ids.length)
  for (let i = 0; i < ids.length; i++) {
    handles[i] = 2 * ids[i]! + rev[i]!
  }
  return handles
}

export function cached<K, V>(compute: (key: K) => V) {
  const held = new Map<K, { value: V }>()
  return (key: K) => {
    let found = held.get(key)
    if (found === undefined) {
      found = { value: compute(key) }
      held.set(key, found)
    }
    return found.value
  }
}

function nodeLength(nodes: Map<number, WalkNode>, id: number) {
  const node = nodes.get(id)
  return node === undefined ? 0 : node.end - node.start
}

/**
 * Aligns one walk fragment to another on the nodes both visit, from node
 * lengths alone: the fragments' steps as the handles gbz-base's chainer reads,
 * and a stand-in sequence of each node's length.
 */
export function walkAligner(nodes: Map<number, WalkNode>) {
  const standIn = new Map<number, string>()
  const sequenceOf = (id: number) => {
    const length = nodeLength(nodes, id)
    let sequence = standIn.get(length)
    if (sequence === undefined) {
      sequence = 'N'.repeat(length)
      standIn.set(length, sequence)
    }
    return sequence
  }
  const cachedHandles = cached(handlesOf)
  return (query: WalkFragment, target: WalkFragment) =>
    pairAlignments({
      query: cachedHandles(query),
      target: cachedHandles(target),
      sequenceOf,
      bases: false,
    })
}

// The fewest bases on shared nodes a record against the reference keeps,
// gbz-base's floor for a pair record
const MIN_MATCH_BP = 100

export function appendEdit(edits: PairEdit[], op: PairEdit[0], len: number) {
  const last = edits.at(-1)
  if (len > 0) {
    if (last?.[0] === op) {
      last[1] += len
    } else {
      edits.push([op, len])
    }
  }
}

/**
 * Aligns a haplotype's walk fragment to the reference's as gbz-base aligns a
 * walk to its reference path: the heaviest common subsequence of their steps,
 * each node weighing its length, read in whichever direction shares more. A
 * pair chain leaves out every node either walk passes twice, which is the
 * whole of a collapsed copy-number array (amylase, KIV-2); the subsequence
 * matches one pass over it, and the other copies are insertions.
 */
export function referenceAligner(nodes: Map<number, WalkNode>) {
  const align = referenceAlignment(nodes)
  return (query: WalkFragment, target: WalkFragment) =>
    align(query, target).records
}

// `turnedBases` is the most the walk read the other way could share with the
// reference: every step on a node the reference passes in the other direction
function referenceAlignment(nodes: Map<number, WalkNode>) {
  const lengthOf = (handle: number) => nodeLength(nodes, handle >> 1)
  const offsets = (handles: number[]) => {
    const out = new Float64Array(handles.length + 1)
    for (let i = 0; i < handles.length; i++) {
      out[i + 1] = out[i]! + lengthOf(handles[i]!)
    }
    return out
  }
  const referenceOf = cached((target: WalkFragment) => {
    const handles = handlesOf(target)
    return { handles, at: offsets(handles), passed: new Set(handles) }
  })
  const basesTurned = (hap: number[], passed: Set<number>) => {
    let bases = 0
    for (const handle of hap) {
      if (passed.has(handle ^ 1)) {
        bases += lengthOf(handle)
      }
    }
    return bases
  }

  return (
    query: WalkFragment,
    target: WalkFragment,
  ): { records: PairChain[]; turnedBases: number } => {
    const { handles: ref, at: refAt, passed } = referenceOf(target)
    const hap = handlesOf(query)
    const turnedBases = basesTurned(hap, passed)
    const [same, sameWeight] = weightedLcs(hap, ref, lengthOf)
    const [turned, turnedWeight] =
      turnedBases > sameWeight
        ? weightedLcs(hap.map(handle => handle ^ 1).reverse(), ref, lengthOf)
        : [[], 0]
    const reverse = turnedWeight > sameWeight
    const pairs = reverse ? turned : same
    const sharedBases = Math.max(sameWeight, turnedWeight)
    if (sharedBases < MIN_MATCH_BP) {
      return { records: [], turnedBases }
    }
    const hapAt = offsets(hap)
    // a pair's haplotype step, counted along the haplotype
    const stepOf = (k: number) =>
      reverse ? hap.length - 1 - pairs[k]![0] : pairs[k]![0]
    const edits: PairEdit[] = []
    for (let k = 0; k < pairs.length; k++) {
      const r = pairs[k]![1]
      if (k > 0) {
        const from = stepOf(k - 1)
        const to = stepOf(k)
        appendEdit(
          edits,
          'I',
          hapAt[Math.max(from, to)]! - hapAt[Math.min(from, to) + 1]!,
        )
        appendEdit(edits, 'D', refAt[r]! - refAt[pairs[k - 1]![1] + 1]!)
      }
      appendEdit(edits, '=', lengthOf(ref[r]!))
    }
    const first = stepOf(0)
    const last = stepOf(pairs.length - 1)
    return {
      turnedBases,
      records: [
        {
          queryStart: hapAt[Math.min(first, last)]!,
          queryEnd: hapAt[Math.max(first, last) + 1]!,
          targetStart: refAt[pairs[0]![1]]!,
          targetEnd: refAt[pairs.at(-1)![1] + 1]!,
          strand: reverse ? '-' : '+',
          edits,
          sharedBases,
        },
      ],
    }
  }
}

// Each node a walk visits once, with the direction it passes it
function singleVisits(fragment: WalkFragment) {
  const rev = new Map<number, number>()
  const twice = new Set<number>()
  fragment.ids.forEach((id, i) => {
    if (rev.has(id)) {
      twice.add(id)
    } else {
      rev.set(id, fragment.rev[i]!)
    }
  })
  for (const id of twice) {
    rev.delete(id)
  }
  return rev
}

// The bases on singly visited nodes two walks pass the same way and the
// opposite way
function directionShares(nodes: Map<number, WalkNode>) {
  const visitsOf = cached(singleVisits)
  return (query: WalkFragment, target: WalkFragment) => {
    const theirs = visitsOf(target)
    let same = 0
    let opposite = 0
    for (const [id, rev] of visitsOf(query)) {
      const other = theirs.get(id)
      if (other === rev) {
        same += nodeLength(nodes, id)
      } else if (other !== undefined) {
        opposite += nodeLength(nodes, id)
      }
    }
    return { same, opposite }
  }
}

/**
 * Aligns one lane's walk fragment to another's. The weighted subsequence
 * (`referenceAligner`) is the fast route and matches through copy-number
 * arrays, but it reads one direction per pair, so an inversion between the
 * lanes comes out as an insertion beside a deletion. A pair sharing 100 bp
 * (MIN_MATCH_BP) or more of singly visited nodes in each direction goes to
 * pair chaining (`walkAligner`) instead, which answers the inverted stretch as
 * a reverse-strand record of its own. Chaining leaves out every node a walk
 * passes twice, so counting singly visited nodes misses no inversion it could
 * draw.
 */
export function lanePairAligner(nodes: Map<number, WalkNode>) {
  const subsequence = referenceAligner(nodes)
  const chained = walkAligner(nodes)
  const shares = directionShares(nodes)
  return (query: WalkFragment, target: WalkFragment) => {
    const { same, opposite } = shares(query, target)
    return same >= MIN_MATCH_BP && opposite >= MIN_MATCH_BP
      ? chained(query, target)
      : subsequence(query, target)
  }
}

// The multi-way display's SPLIT_AT_GAP_BP, under which a turned stretch names
// no inversion there
const TURNED_MIN_BP = 10_000

/**
 * Aligns a haplotype's walk fragment to the reference's as `referenceAligner`
 * does, then adds the stretches it reads the other way. A walk sharing
 * TURNED_MIN_BP or more of singly visited nodes in each direction is chained
 * too, and the chained records on the strand the subsequence did not take are
 * its turned stretches. The subsequence record stays, so a copy-number array,
 * which chaining leaves out, still matches one pass alike in every lane.
 */
export function anchorAligner(nodes: Map<number, WalkNode>) {
  const subsequence = referenceAlignment(nodes)
  const chained = walkAligner(nodes)
  const shares = directionShares(nodes)
  const turnsEnough = (query: WalkFragment, target: WalkFragment) => {
    const { same, opposite } = shares(query, target)
    return Math.min(same, opposite) >= TURNED_MIN_BP
  }
  return (query: WalkFragment, target: WalkFragment) => {
    const { records, turnedBases } = subsequence(query, target)
    const taken = records[0]?.strand
    return taken === undefined ||
      turnedBases < TURNED_MIN_BP ||
      !turnsEnough(query, target)
      ? records
      : [
          ...records,
          ...chained(query, target).filter(chain => chain.strand !== taken),
        ]
  }
}

/**
 * One record of a walk aligned to another, with its short balanced bubbles as
 * mismatches
 */
export function chainFeature({
  chain,
  target,
  query,
  assemblyName,
  refName,
  mateAssemblyName,
}: {
  chain: PairChain
  target: Pick<WalkFragment, 'name' | 'hapStart'>
  query: WalkFragment
  assemblyName: string
  refName: string
  mateAssemblyName: string
}) {
  const edits = bubblesAsMismatches(chain.edits)
  return matchFeature({
    target: {
      name: target.name,
      assemblyName,
      refName,
      start: target.hapStart + chain.targetStart,
      end: target.hapStart + chain.targetEnd,
    },
    query: {
      name: query.name,
      assemblyName: mateAssemblyName,
      refName: panSNContig(query.name),
      start: query.hapStart + chain.queryStart,
      end: query.hapStart + chain.queryEnd,
    },
    strand: chain.strand,
    cigar: pairCigar(edits),
    matches: edits.reduce((sum, [op, n]) => sum + (op === '=' ? n : 0), 0),
    columns: edits.reduce((sum, [, n]) => sum + n, 0),
  })
}

/**
 * One array record of a walk against the reference, on the reference with the
 * haplotype as its mate. It carries no CIGAR and no identity, so the display
 * draws it as a plain band and no ramp or identity filter reads it as an
 * alignment.
 */
export function arrayFeature({
  record,
  query,
  assemblyName,
  refName,
  targetName,
  mateAssemblyName,
}: {
  record: ArrayRecord
  query: WalkFragment
  assemblyName: string
  refName: string
  targetName: string
  mateAssemblyName: string
}) {
  const { queryStart, queryEnd, targetStart, targetEnd, strand } = record
  const mateStart = query.hapStart + queryStart
  const mateEnd = query.hapStart + queryEnd
  const id = `${targetName}:${targetStart}-${targetEnd}|${query.name}:${mateStart}-${mateEnd}:array`
  return new SyntenyFeature({
    uniqueId: id,
    assemblyName,
    refName,
    start: targetStart,
    end: targetEnd,
    type: 'array',
    strand: strand === '-' ? -1 : 1,
    syntenyId: id,
    placedBp: record.placedBp,
    againstBp: record.againstBp,
    hapWalks: record.hapWalks,
    refWalks: record.refWalks,
    mate: {
      refName: panSNContig(query.name),
      start: mateStart,
      end: mateEnd,
      assemblyName: mateAssemblyName,
    },
  })
}

/**
 * Whether a walk's fragment steps on the reference inside the window: on a
 * node of `refName` overlapping it
 */
export function stepsInWindow(
  fragment: WalkFragment,
  nodes: Map<number, WalkNode>,
  refName: string,
  window: { start: number; end: number },
) {
  return fragment.ids.some(id => {
    const node = nodes.get(id)
    return (
      node?.rank === 0 &&
      node.refName === refName &&
      node.start < window.end &&
      node.end > window.start
    )
  })
}

/** Whether the reference between a departure's ends covers the whole window */
export function departureSpans(
  { leavePos, rejoinPos }: WalkDeparture,
  window: { start: number; end: number },
) {
  return (
    Math.min(leavePos, rejoinPos) <= window.start &&
    Math.max(leavePos, rejoinPos) >= window.end
  )
}

/**
 * A haplotype whose departure from the reference spans the whole window, as
 * the record a multi-way display lifts out as a deletion: `spansWindow`, the
 * reference between the departure's ends whole so its length heads the lane,
 * and the haplotype's own sequence between them as its mate, a point where
 * it has none. The record runs the way the walk rejoins the reference, and
 * carries no CIGAR and no identity, so no ramp or identity filter reads it
 * as an alignment.
 */
export function departureFeature({
  departure,
  refName,
  assemblyName,
  mateAssemblyName,
}: {
  departure: WalkDeparture
  refName: string
  assemblyName: string
  mateAssemblyName: string
}) {
  const { name, hapStart, ownBp, leavePos, rejoinPos, rejoinReversed } =
    departure
  const id = `${name}:${hapStart}:${leavePos}:departure`
  return new SyntenyFeature({
    uniqueId: id,
    assemblyName,
    refName,
    start: Math.min(leavePos, rejoinPos),
    end: Math.max(leavePos, rejoinPos),
    type: 'departure',
    strand: rejoinReversed ? -1 : 1,
    syntenyId: id,
    spansWindow: true,
    mate: {
      refName: panSNContig(name),
      start: hapStart,
      end: hapStart + ownBp,
      assemblyName: mateAssemblyName,
    },
  })
}
