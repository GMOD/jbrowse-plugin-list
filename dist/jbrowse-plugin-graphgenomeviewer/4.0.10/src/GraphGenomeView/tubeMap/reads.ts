import { parseCs } from '../../gaf/parseGaf'

import type { GafRecord } from '../../gaf/parseGaf'
import type { Graph, GraphNode } from '../types'
import type { InputTrack, Mismatch } from '@gmod/tubemap-core'

// GAF reads as tube map reads over a cut. A read keeps the steps whose
// segments the cut holds, and its cs edits land on the node they fall in, at
// a position in the direction the read walks it, as vg's GAM mappings state
// theirs.

export function canonicalStrand(node: GraphNode) {
  return node.id.endsWith('-') ? '-' : '+'
}

// A visit to a node as tubemap-core names it: `-` where the walk runs against
// the strand the node is drawn in
export function stepName(node: GraphNode, strand: '+' | '-') {
  return strand === canonicalStrand(node) ? node.id : `-${node.id}`
}

// Where each step starts on the walk, where that can be known: counted from
// the walk's start up to the first segment outside the cut, and back from its
// end down to the last. A step between two such segments has no start.
function stepStarts(lengths: readonly (number | undefined)[], total: number) {
  const starts: (number | undefined)[] = lengths.map(() => undefined)
  let head = 0
  let i = 0
  for (; i < lengths.length && lengths[i] !== undefined; i++) {
    starts[i] = head
    head += lengths[i]!
  }
  let tail = total
  for (let j = lengths.length - 1; j > i && lengths[j] !== undefined; j--) {
    tail -= lengths[j]!
    starts[j] = tail
  }
  return starts
}

function mismatchesByStep(
  record: GafRecord,
  lengths: readonly (number | undefined)[],
) {
  const byStep: Mismatch[][] = record.path.map(() => [])
  if (record.cs === undefined) {
    return byStep
  }
  const starts = stepStarts(lengths, record.pathLength)
  // the step holding walk position `pos`, or for `atEnd` the one ending there
  const stepAt = (pos: number, atEnd = false) => {
    for (let s = 0; s < starts.length; s++) {
      const start = starts[s]
      const length = lengths[s]
      if (
        start !== undefined &&
        length !== undefined &&
        start <= pos &&
        (pos < start + length || (atEnd && pos === start + length))
      ) {
        return { s, local: pos - start, room: start + length - pos }
      }
    }
    return undefined
  }
  const add = (s: number, mismatch: Mismatch) => {
    const list = byStep[s]!
    const last = list.at(-1)
    if (
      mismatch.type === 'substitution' &&
      last?.type === 'substitution' &&
      last.pos + last.seq!.length === mismatch.pos
    ) {
      last.seq += mismatch.seq!
    } else {
      list.push(mismatch)
    }
  }
  let pos = record.pathStart
  for (const op of parseCs(record.cs)) {
    if (op.op === 'match') {
      pos += op.length
    } else if (op.op === 'substitution') {
      const at = stepAt(pos)
      if (at) {
        add(at.s, { type: 'substitution', pos: at.local, seq: op.seq })
      }
      pos += 1
    } else if (op.op === 'insertion') {
      const at = stepAt(pos, pos === record.pathEnd)
      if (at) {
        add(at.s, { type: 'insertion', pos: at.local, seq: op.seq })
      }
    } else {
      let left = op.length
      while (left > 0) {
        const at = stepAt(pos)
        const take = at ? Math.min(left, at.room) : left
        if (at) {
          add(at.s, { type: 'deletion', pos: at.local, length: take })
        }
        pos += take
        left -= take
      }
    }
  }
  return byStep
}

// `firstId` follows the haplotype tracks' ids, which tubemap-core shares
// between tracks and reads.
export function tubeMapReads(
  graph: Graph,
  records: readonly GafRecord[],
  firstId: number,
): InputTrack[] {
  const nodeByName = new Map(graph.nodes.map(n => [n.name, n]))
  const reads: InputTrack[] = []
  for (const record of records) {
    const nodes = record.path.map(step => nodeByName.get(step.name))
    const kept = nodes.flatMap((node, i) => (node ? [i] : []))
    const first = kept[0]
    const last = kept.at(-1)
    if (first !== undefined && last !== undefined) {
      const mismatches = mismatchesByStep(
        record,
        nodes.map(n => n?.length),
      )
      const names = kept.map(i => stepName(nodes[i]!, record.path[i]!.strand))
      const lastLength = nodes[last]!.length
      reads.push({
        id: firstId + reads.length,
        name: record.name,
        type: 'read',
        sourceTrackID: 1,
        sequence: names,
        sequenceNew: kept.map((i, k) => ({
          nodeName: names[k]!,
          mismatches: mismatches[i]!,
        })),
        firstNodeOffset: first === 0 ? record.pathStart : 0,
        finalNodeCoverLength:
          last === record.path.length - 1
            ? lastLength - (record.pathLength - record.pathEnd)
            : lastLength,
        mapping_quality:
          record.mappingQuality === 255 ? 0 : record.mappingQuality,
        is_secondary: record.secondary,
        is_reverse: record.strand === '-',
      })
    }
  }
  return reads
}

// sequenceTubeMap's read palettes: blues forward, reds reverse, staggered by
// read so neighbours differ
const FORWARD_READ_COLORS = ['#6baed6', '#4292c6', '#2171b5', '#08519c']
const REVERSE_READ_COLORS = ['#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15']

export function readColor(read: { id: number; is_reverse?: boolean }) {
  const colors = read.is_reverse ? REVERSE_READ_COLORS : FORWARD_READ_COLORS
  return colors[read.id % colors.length]!
}
