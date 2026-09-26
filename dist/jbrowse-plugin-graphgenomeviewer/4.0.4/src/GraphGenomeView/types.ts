import type { StableCoordinate } from '../gfa-core/index'

export interface GraphNode {
  id: string
  name: string
  length: number
  depth: number
  // where this segment sits on a stable sequence: stated per-segment by rGFA's
  // SN/SO/SR, derived from the P/W lines otherwise (pathAnchoring.ts)
  stable?: StableCoordinate
  // every assembly whose P/W record visits this segment, sorted. This is
  // carriage, and only a path GFA can state it: rGFA's SR is build order, so
  // there the most a segment says is which assembly first contributed it.
  samples?: string[]
}

export interface GraphEdge {
  from: string
  to: string
  // How the link reads each segment, as the file states it: it leaves the END
  // of `from` read this way and arrives at the START of `to`. `from` and `to`
  // alone cannot say which side of a node a link is on, and that is the whole
  // difference between a deletion, a duplication and an inversion. Absent on a
  // graph built without them.
  fromStrand?: '+' | '-'
  toStrand?: '+' | '-'
  pathIds?: string[]
}

export interface GraphPath {
  name: string
  nodeIds: string[]
  // set for W records, which state the assembly they walk; P records do not
  sample?: string
  haplotype?: number
  contig?: string
}

// One P or W record, named the way a coordinate is named: the range suffix
// `odgi extract` appends (`K12#1#chr:1004500-1004961`) split off into `start`,
// so `name` is a stable sequence and `start` is where this path begins on it.
export interface PathOrigin {
  name: string
  sample: string
  start: number
  // bp the path covers, summed over its steps
  length: number
}

// One visit a path makes to one segment. A path may visit the same segment more
// than once (a collapsed repeat), so this is a list per segment, not a value.
export interface PathVisit {
  path: string
  sample: string
  // offset on `path`'s own sequence, from walking the path's steps
  start: number
  // how this path reads the segment, which is not how another path may read it
  strand: '+' | '-'
}

export interface Graph {
  name: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  paths?: GraphPath[]
  // The paths that could put this graph on a reference axis, in file order, and
  // every segment visit they make. Absent for a GFA with no P/W records — an
  // rGFA, where the segments carry their own coordinates instead.
  anchorPaths?: PathOrigin[]
  pathVisits?: Map<string, PathVisit[]>
  // Where the nodes' `stable` came from. 'tags' is rGFA's SN/SO/SR; 'paths' is
  // derived, and the only one that can be re-derived against a different
  // reference path. Absent when nothing anchors the graph at all.
  anchoredBy?: 'tags' | 'paths'
  // the path `anchoredBy: 'paths'` put on x
  referencePath?: string
}

export interface NodeSegment {
  x: number
  y: number
}

// A row a layout drew, named, in the same graph y coordinates as
// `nodePositions`. Emitted by the layout that positioned the rows rather than
// recomputed by the renderer, so a label cannot end up naming a row the layout
// put somewhere else. Absent for layouts with no row structure (FMMM).
export interface RowLabel {
  label: string
  y: number
}

// An allele that stands in for MORE reference than it carries sequence, as the
// row-structured layouts drew it. Those layouts give an off-reference node the
// slice of reference its allele replaces rather than its own length
// (placeOffReference), so on this axis a 93 bp segment bridging two backbone
// anchors 7.1 kb apart is drawn 7.1 kb wide — and labelling it `93 bp`, which is
// what a node label says everywhere else, describes the sequence while the
// reader is looking at the reference. It is a deletion, and the drawing already
// names deletions when they are bare edges; this is the same event with a
// segment in the middle of it, which `deletionEdges` cannot see.
//
// Emitted by the layout, because only the layout knows whether x is reference bp
// — under FMMM a node IS drawn at its own scale and `93 bp` is the true label.
export interface AlleleDeletion {
  // the run's nodes, so a label can be placed over the extent they were drawn at
  nodeIds: string[]
  // reference bp the allele does not carry: the span between its anchors less
  // the longest path through the run. Not `-delta`, which sums a bubble's
  // parallel branches and so understates what any one haplotype skips.
  bp: number
}

export interface LayoutResult {
  nodePositions: Record<string, NodeSegment[]>
  rowLabels?: RowLabel[]
  // The sample on each row under the backbone, top to bottom, from the layout
  // that rows by sample. The model passes it to a follow's next layout, so the
  // rows stay put.
  sampleRows?: string[]
  // Deletions carried by a SEGMENT rather than by a bare edge, which only a
  // reference-bp layout can state — see AlleleDeletion.
  alleleDeletions?: AlleleDeletion[]
  // Set by the layouts whose x is reference bp, so the fit can be taken from
  // the region the cut was made for rather than from how far the drawing
  // happens to reach. An allele anchored far outside the window is a fact
  // about the graph, not a reason to redraw the window at 6% of the frame —
  // see layoutBounds.
  referenceAxis?: boolean
  // Set by the layouts that state y in SCREEN PIXELS rather than in the same
  // units as x. A row layout's y is a row pitch, which is a property of what a
  // row has to hold (a tube, a label) and not of the window's span, so the two
  // axes are no longer one number — see rowSpacing.ts and the model's
  // scaleX/scaleY. A layout that leaves this unset (FMMM) is isotropic, and
  // every unit of it is drawn at one scale, exactly as before.
  //
  // Separate from `referenceAxis` on purpose: that one says what x MEANS, this
  // one says what y is MEASURED IN, and a future layout could set either
  // without the other.
  pixelRows?: boolean
  // How far a drawing reaches past its nodes, when an overlay draws rows the
  // renderer has no node for (walk rows). The fit and the pane height take the
  // wider of this and the nodes.
  extent?: { maxX: number; maxY: number }
}
