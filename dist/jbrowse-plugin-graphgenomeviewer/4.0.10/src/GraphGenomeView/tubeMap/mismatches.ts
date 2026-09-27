import { forward, getXCoordinateOfBaseWithinNode } from '@gmod/tubemap-core'

import type { Track, TubeMapLayout } from '@gmod/tubemap-core'

// Where a read differs from the nodes it runs through, in tube coordinates:
// the marks sequenceTubeMap's drawMismatches puts on a read's tube. Each mark
// spans the bases it covers and sits on the tube of the read that carries it
// (`y` is the tube's top, `height` its width), so a painter only maps them
// through the frame. `nodeY` is the top of the node, which a hover draws a
// leader up to.
interface MarkBase {
  readId: number
  y: number
  height: number
  nodeY: number
}

export type TubeMapMismatch =
  | (MarkBase & {
      kind: 'insertion'
      x: number
      seq?: string
      // at the read's first or last base, where an aligner clips rather than
      // inserts; sequenceTubeMap hides these unless soft clips are shown
      softClip: boolean
    })
  | (MarkBase & { kind: 'deletion'; x0: number; x1: number })
  | (MarkBase & { kind: 'substitution'; x0: number; x1: number; seq: string })

function readMismatches(read: Track, layout: TubeMapLayout) {
  const marks: TubeMapMismatch[] = []
  const entries = read.sequenceNew ?? []
  entries.forEach((entry, i) => {
    const nodeIndex = layout.nodeMap.get(forward(entry.nodeName))
    const node = nodeIndex === undefined ? undefined : layout.nodes[nodeIndex]
    // Node merging can drop a visit, so the segment for entry i is at or after
    // path[i], and the walk stops at the path's end.
    let pathIndex = i
    while (
      pathIndex < read.path.length &&
      read.path[pathIndex]!.node !== nodeIndex
    ) {
      pathIndex += 1
    }
    const y = read.path[pathIndex]?.y
    if (node && y !== undefined) {
      const base = { readId: read.id, y, height: read.width, nodeY: node.y }
      // A base past a merged node's end has no x.
      const at = (pos: number) => getXCoordinateOfBaseWithinNode(node, pos)
      for (const mm of entry.mismatches) {
        const x0 = at(mm.pos)
        if (x0 !== null) {
          if (mm.type === 'insertion') {
            const softClip =
              (i === 0 && mm.pos === read.firstNodeOffset) ||
              (i === entries.length - 1 && mm.pos === read.finalNodeCoverLength)
            marks.push({
              ...base,
              kind: 'insertion',
              x: x0,
              seq: mm.seq,
              softClip,
            })
          } else if (mm.type === 'deletion' && mm.length !== undefined) {
            const x1 = at(mm.pos + mm.length)
            if (x1 !== null) {
              marks.push({ ...base, kind: 'deletion', x0, x1 })
            }
          } else if (mm.type === 'substitution' && mm.seq !== undefined) {
            const x1 = at(mm.pos + mm.seq.length)
            if (x1 !== null) {
              marks.push({ ...base, kind: 'substitution', x0, x1, seq: mm.seq })
            }
          }
        }
      }
    }
  })
  return marks
}

export function tubeMapMismatches(layout: TubeMapLayout) {
  return layout.reads.flatMap(read => readMismatches(read, layout))
}
