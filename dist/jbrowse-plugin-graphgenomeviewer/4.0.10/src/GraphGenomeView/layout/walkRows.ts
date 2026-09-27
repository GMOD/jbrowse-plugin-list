import { panSNSample } from '../../pansn'
import { pathOrigin } from '../pathAnchoring'

import type { Graph, GraphPath } from '../types'

// Each haplotype walk on its own bp axis, so what a walk carries through the
// window is its bar length. Reference-anchored rows cannot state that: a
// haplotype's private copies of a repeat consume no reference and collapse to
// a mark, which is why the KIV-2 array reads as a knot in every node layout
// and as a ladder here.
//
// A base-level graph does not revisit reference nodes through a repeat array,
// so a copy count is not a visit count; it is the sequence a walk spends
// between the reference nodes flanking the window, divided by the unit. Runs
// distinguish sequence the reference walk also carries from sequence it does
// not, so an expansion is the purple stretch of a row.

export interface WalkRun {
  // bp offset from the start of this walk's slice
  start: number
  bp: number
  onReference: boolean
}

export interface WalkRow {
  name: string
  label: string
  sample: string
  bp: number
  offReferenceBp: number
  // false when the walk does not reach both flanking reference nodes, in which
  // case the whole walk is measured and the bar says so
  complete: boolean
  runs: WalkRun[]
}

export interface WalkRows {
  // reference bp the rows' bars start at, so a row's x is origin + run.start
  origin: number
  // repeat unit in bp when a repeat annotation supplied one; the bars tile by it
  unit?: number
  reference: WalkRow
  // every other walk, longest first
  rows: WalkRow[]
}

function sampleOf(path: GraphPath) {
  return path.sample ?? panSNSample(path.name)
}

function labelOf(path: GraphPath) {
  return path.haplotype !== undefined && path.sample !== undefined
    ? `${path.sample}#${path.haplotype}`
    : sampleOf(path)
}

// Each walk is cut at the nearest reference nodes IT visits on either side of
// the region, so a walk that skips one flanking node at a SNP is still measured
// between flanks rather than whole.
function sliceBetween(
  nodeIds: string[],
  span: Map<string, { start: number; end: number }>,
  region: { start: number; end: number } | undefined,
  flanked = true,
) {
  // A cut that stops at the window carries no flanking reference for anyone,
  // so every walk is whole and the slice is the walk.
  if (!region || !flanked) {
    return { ids: nodeIds, complete: true }
  }
  let i0 = -1
  let i1 = -1
  let bestEnd = -Infinity
  let bestStart = Infinity
  nodeIds.forEach((id, i) => {
    const s = span.get(id)
    if (s) {
      if (s.end <= region.start && s.end > bestEnd) {
        bestEnd = s.end
        i0 = i
      }
      if (s.start >= region.end && s.start < bestStart) {
        bestStart = s.start
        i1 = i
      }
    }
  })
  if (i0 < 0 || i1 < 0) {
    return { ids: nodeIds, complete: false }
  }
  const ids = nodeIds.slice(Math.min(i0, i1) + 1, Math.max(i0, i1))
  return { ids: i0 < i1 ? ids : ids.reverse(), complete: true }
}

export function walkRows(
  graph: Graph,
  region?: { start: number; end: number },
  unit?: number,
): WalkRows | undefined {
  const paths = graph.paths ?? []
  // `referencePath` is the anchor name, which pathOrigin has already stripped
  // of the range suffix odgi leaves on a P record's name
  const reference =
    paths.find(p => pathOrigin(p.name).name === graph.referencePath) ?? paths[0]
  if (!reference || paths.length < 2) {
    return undefined
  }
  const lengthOf = new Map(graph.nodes.map(n => [n.id, n.length]))
  const onReference = new Set(reference.nodeIds)
  const referenceStart =
    graph.anchorPaths?.find(p => p.name === pathOrigin(reference.name).name)
      ?.start ?? 0

  const cut = region && region.end > region.start ? region : undefined
  const span = new Map<string, { start: number; end: number }>()
  let pos = referenceStart
  for (const id of reference.nodeIds) {
    const len = lengthOf.get(id) ?? 0
    if (!span.has(id)) {
      span.set(id, { start: pos, end: pos + len })
    }
    pos += len
  }

  // Whether the reference reaches past the region on both sides, i.e. whether
  // a flanking node exists for any walk to be cut at.
  const flanked =
    cut === undefined ||
    ([...span.values()].some(s => s.end <= cut.start) &&
      [...span.values()].some(s => s.start >= cut.end))

  const rowOf = (path: GraphPath): WalkRow => {
    const { ids, complete } = sliceBetween(path.nodeIds, span, cut, flanked)
    const runs: WalkRun[] = []
    let bp = 0
    let offReferenceBp = 0
    for (const id of ids) {
      const len = lengthOf.get(id) ?? 0
      const shared = onReference.has(id)
      const last = runs.at(-1)
      if (last?.onReference === shared) {
        last.bp += len
      } else {
        runs.push({ start: bp, bp: len, onReference: shared })
      }
      bp += len
      if (!shared) {
        offReferenceBp += len
      }
    }
    return {
      name: path.name,
      label: labelOf(path),
      sample: sampleOf(path),
      bp,
      offReferenceBp,
      complete,
      runs,
    }
  }

  const origin = cut ? cut.start : referenceStart
  return {
    origin,
    unit,
    reference: rowOf(reference),
    rows: paths
      .filter(p => p !== reference)
      .map(rowOf)
      .sort(
        (a, b) =>
          Number(b.complete) - Number(a.complete) ||
          b.bp - a.bp ||
          a.label.localeCompare(b.label),
      ),
  }
}
