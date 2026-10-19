import { weightedLcs } from '@gmod/gbz-base/lcs'
import { pairAlignments, pairCigar } from '@gmod/gbz-base/pairAlignment'
import { panSNContig } from '@jbrowse/bandage-core/pansn'

import { matchFeature } from '../synteny/matchFeature.ts'

import type { PairChain, PairEdit } from '@gmod/gbz-base/pairAlignment'
import type { WalkFragment, WalkNode } from '@jbrowse/graph-walks'

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
function handlesOf(fragment: WalkFragment) {
  return Array.from(fragment.ids, (id, i) => 2 * id + fragment.rev[i]!)
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
  const handles = new Map<WalkFragment, number[]>()
  const cachedHandles = (fragment: WalkFragment) => {
    let steps = handles.get(fragment)
    if (steps === undefined) {
      steps = handlesOf(fragment)
      handles.set(fragment, steps)
    }
    return steps
  }
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

function appendEdit(edits: PairEdit[], op: PairEdit[0], len: number) {
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
  const lengthOf = (handle: number) => nodeLength(nodes, handle >> 1)
  const offsets = (handles: number[]) => {
    const out = new Float64Array(handles.length + 1)
    handles.forEach((handle, i) => {
      out[i + 1] = out[i]! + lengthOf(handle)
    })
    return out
  }

  return (query: WalkFragment, target: WalkFragment): PairChain[] => {
    const ref = handlesOf(target)
    const hap = handlesOf(query)
    const [same, sameWeight] = weightedLcs(hap, ref, lengthOf)
    const [turned, turnedWeight] = weightedLcs(
      hap.map(handle => handle ^ 1).reverse(),
      ref,
      lengthOf,
    )
    const reverse = turnedWeight > sameWeight
    const pairs = reverse ? turned : same
    const sharedBases = Math.max(sameWeight, turnedWeight)
    if (sharedBases < MIN_MATCH_BP) {
      return []
    }
    const refAt = offsets(ref)
    const hapAt = offsets(hap)
    // a pair's haplotype step, counted along the haplotype
    const stepOf = (k: number) =>
      reverse ? hap.length - 1 - pairs[k]![0] : pairs[k]![0]
    const edits: PairEdit[] = []
    pairs.forEach(([, r], k) => {
      if (k > 0) {
        const [lo, hi] = [stepOf(k - 1), stepOf(k)].sort((x, y) => x - y)
        appendEdit(edits, 'I', hapAt[hi!]! - hapAt[lo! + 1]!)
        appendEdit(edits, 'D', refAt[r]! - refAt[pairs[k - 1]![1] + 1]!)
      }
      appendEdit(edits, '=', lengthOf(ref[r]!))
    })
    const [lo, hi] = [stepOf(0), stepOf(pairs.length - 1)].sort((x, y) => x - y)
    return [
      {
        queryStart: hapAt[lo!]!,
        queryEnd: hapAt[hi! + 1]!,
        targetStart: refAt[pairs[0]![1]]!,
        targetEnd: refAt[pairs.at(-1)![1] + 1]!,
        strand: reverse ? '-' : '+',
        edits,
        sharedBases,
      },
    ]
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
  const visits = new Map<WalkFragment, Map<number, number>>()
  const visitsOf = (fragment: WalkFragment) => {
    let found = visits.get(fragment)
    if (found === undefined) {
      found = singleVisits(fragment)
      visits.set(fragment, found)
    }
    return found
  }
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
  const subsequence = referenceAligner(nodes)
  const chained = walkAligner(nodes)
  const shares = directionShares(nodes)
  return (query: WalkFragment, target: WalkFragment) => {
    const records = subsequence(query, target)
    const taken = records[0]?.strand
    const { same, opposite } = shares(query, target)
    return taken === undefined || Math.min(same, opposite) < TURNED_MIN_BP
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
  target: WalkFragment
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
