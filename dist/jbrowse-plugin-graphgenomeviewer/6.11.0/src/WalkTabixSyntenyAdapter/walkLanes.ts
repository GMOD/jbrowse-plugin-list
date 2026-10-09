import { pairAlignments } from '@gmod/gbz-base'
import { panSNContig } from '@jbrowse/bandage-core/pansn'

import SyntenyFeature from '../synteny/SyntenyFeature.ts'

import type { WalkFragment, WalkNode } from '../RgfaTabixAdapter/walkRows.ts'
import type { PairChain, PairEdit } from '@gmod/gbz-base'

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

function cigarOf(edits: PairEdit[]) {
  return edits.map(([op, len]) => `${len}${op}`).join('')
}

/**
 * Aligns one walk fragment to another on the nodes both visit, from node
 * lengths alone: the fragments' steps as the handles gbz-base's chainer reads,
 * and a stand-in sequence of each node's length.
 */
export function walkAligner(nodes: Map<number, WalkNode>) {
  const standIn = new Map<number, string>()
  const sequenceOf = (id: number) => {
    const node = nodes.get(id)
    const length = node === undefined ? 0 : node.end - node.start
    let sequence = standIn.get(length)
    if (sequence === undefined) {
      sequence = 'N'.repeat(length)
      standIn.set(length, sequence)
    }
    return sequence
  }
  const handles = new Map<WalkFragment, number[]>()
  const handlesOf = (fragment: WalkFragment) => {
    let steps = handles.get(fragment)
    if (steps === undefined) {
      steps = Array.from(fragment.ids, (id, i) => 2 * id + fragment.rev[i]!)
      handles.set(fragment, steps)
    }
    return steps
  }
  return (query: WalkFragment, target: WalkFragment) =>
    pairAlignments({
      query: handlesOf(query),
      target: handlesOf(target),
      sequenceOf,
      bases: false,
    })
}

/**
 * One record of a walk aligned to another: on the target walk's contig, with
 * the query walk as its mate and the CIGAR read along the target, a `D` being
 * target bases the query lacks.
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
  const start = target.hapStart + chain.targetStart
  const end = target.hapStart + chain.targetEnd
  const mateStart = query.hapStart + chain.queryStart
  const mateEnd = query.hapStart + chain.queryEnd
  const edits = bubblesAsMismatches(chain.edits)
  const matches = edits.reduce((sum, [op, n]) => sum + (op === '=' ? n : 0), 0)
  const columns = edits.reduce((sum, [, n]) => sum + n, 0)
  const id = `${target.name}:${start}-${end}|${query.name}:${mateStart}-${mateEnd}`
  return new SyntenyFeature({
    uniqueId: id,
    assemblyName,
    refName,
    start,
    end,
    type: 'match',
    strand: chain.strand === '-' ? -1 : 1,
    CIGAR: cigarOf(edits),
    syntenyId: id,
    identity: matches / Math.max(columns, 1),
    numMatches: matches,
    blockLen: columns,
    mate: {
      refName: panSNContig(query.name),
      start: mateStart,
      end: mateEnd,
      assemblyName: mateAssemblyName,
    },
  })
}
