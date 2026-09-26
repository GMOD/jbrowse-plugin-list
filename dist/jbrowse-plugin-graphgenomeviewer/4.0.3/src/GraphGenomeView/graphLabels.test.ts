import { formatBp, graphLabels, rowLabelBox } from './graphLabels'

// isotropic: one scale for both axes, which is every layout but the row ones
const iso = (scale = 1) => ({ scaleX: scale, scaleY: scale })

const NODES = {
  long: [
    { x: 0, y: 0 },
    { x: 200, y: 0 },
  ],
  // 30 units, which at scale 1 is wide enough to hold "12 bp" within the
  // factor-of-two overhang and at scale 0.2 is not
  small: [
    { x: 300, y: 0 },
    { x: 330, y: 0 },
  ],
  // 2 units: a speck, whose label would be twenty times the thing it names
  speck: [
    { x: 400, y: 0 },
    { x: 402, y: 0 },
  ],
}
const LENGTHS = new Map([
  ['long', 39_000],
  ['small', 12],
  ['speck', 7],
])

// The two backbone nodes a deletion edge runs BETWEEN. The arc is drawn from the
// end of one to the start of the other and bowed off that chord, so a fixture
// that states only `bypassed` cannot say where the arc is: the label is placed on
// the curve now rather than at an apex re-derived from the bypassed run, which is
// what stopped the words and the arc landing in different places under a force
// layout. Deliberately absent from LENGTHS, so they carry no labels of their own
// and the assertions below stay about the deletion.
const FLANKS = {
  before: [
    { x: -80, y: 0 },
    { x: 0, y: 0 },
  ],
  after: [
    { x: 200, y: 0 },
    { x: 280, y: 0 },
  ],
}
const FLANKED = { ...NODES, ...FLANKS }
const between = { from: 'before', to: 'after' }

const VIEWPORT = { translateX: 0, translateY: 0, width: 800, height: 400 }

test('labels a node with the sequence it carries', () => {
  const labels = graphLabels({
    nodePositions: NODES,
    nodeLengths: LENGTHS,
    deletions: [],
    axis: iso(),
    ...VIEWPORT,
  })
  expect(labels.map(l => l.text).sort()).toEqual(['12 bp', '39 kb'])
})

// The reason a label is missing has to be in the picture. It is not "the node is
// small" against a flat pixel count, it is "the node is shorter than the words",
// measured against the text that would be drawn.
test('drops a label the node cannot nearly hold', () => {
  const labels = graphLabels({
    nodePositions: NODES,
    nodeLengths: LENGTHS,
    deletions: [],
    axis: iso(),
    ...VIEWPORT,
  })
  expect(labels.map(l => l.text)).not.toContain('7 bp')
})

// Zooming out shrinks every node past its own label, so a wide view sheds labels
// on its own rather than carrying one per speck.
test('sheds labels as the view zooms out', () => {
  const at = (scale: number) =>
    graphLabels({
      nodePositions: NODES,
      nodeLengths: LENGTHS,
      deletions: [],
      axis: iso(scale),
      ...VIEWPORT,
    }).map(l => l.text)
  expect(at(1).sort()).toEqual(['12 bp', '39 kb'])
  expect(at(0.2)).toEqual(['39 kb'])
  expect(at(0.05)).toEqual([])
})

test('drops a label that would land outside the canvas', () => {
  const labels = graphLabels({
    nodePositions: NODES,
    nodeLengths: LENGTHS,
    deletions: [],
    axis: iso(),
    ...VIEWPORT,
    // panned until the long node's midpoint is off the left edge
    translateX: -250,
  })
  expect(labels.map(l => l.text)).toEqual(['12 bp'])
})

// A deletion carries no negative sequence; it removes reference. A signed number
// beside a graph reads as a length that went negative, which is what a review
// took "−84.7 kb" for.
test('a deletion names itself, positively, on its arc', () => {
  const [label] = graphLabels({
    nodePositions: FLANKED,
    nodeLengths: LENGTHS,
    deletions: [
      {
        edgeIndex: 3,
        ...between,
        refName: 'chr1',
        start: 100,
        end: 84_783,
        bp: 84_683,
        bypassed: ['long'],
      },
    ],
    axis: iso(),
    ...VIEWPORT,
  }).filter(l => l.kind === 'deletion')
  expect(label!.text).toBe('84.7 kb del')
  // off the line the bypassed node lies on, which is what puts it on the curve
  expect(Math.abs(label!.y)).toBeGreaterThan(10)
})

// The arc is the only thing on screen representing sequence that is absent, so
// it outranks the node labels competing for the same space.
test('a deletion label wins the space over a node label', () => {
  const labels = graphLabels({
    nodePositions: {
      long: NODES.long,
      ...FLANKS,
      // sits where the arc's own midpoint lands (bulge 0.35*200, and a cubic
      // whose control points both sit that far off the chord reaches 3/4 of it),
      // so the two labels compete for one box
      clash: [
        { x: 60, y: 52 },
        { x: 140, y: 52 },
      ],
    },
    nodeLengths: new Map([
      ['long', 39_000],
      ['clash', 900_000],
    ]),
    deletions: [
      {
        edgeIndex: 0,
        ...between,
        refName: 'chr1',
        start: 100,
        end: 84_783,
        bp: 84_683,
        bypassed: ['long'],
      },
    ],
    axis: iso(),
    ...VIEWPORT,
  })
  expect(labels.map(l => l.text)).toEqual(['84.7 kb del', '39 kb'])
})

// The gate is the arc's drawn extent, not its bulge. Bulge is in layout units,
// which differ per layout: the same deletion cleared a bulge threshold under FMMM
// and failed it in an anchored layout, where the bow is a fraction of the skipped
// span in bp. Here the bypassed node is short (so the bulge is small) while the
// endpoints are far apart (so the arc is wide) -- the anchored case, and the one
// the old rule got wrong.
test('a wide, shallow arc is labelled', () => {
  const labels = graphLabels({
    nodePositions: {
      ...FLANKS,
      shallow: [
        { x: 90, y: 0 },
        { x: 110, y: 0 },
      ],
    },
    nodeLengths: new Map(),
    deletions: [
      {
        edgeIndex: 0,
        ...between,
        refName: 'chr1',
        start: 100,
        end: 9400,
        bp: 9300,
        bypassed: ['shallow'],
      },
    ],
    axis: iso(),
    ...VIEWPORT,
  })
  expect(labels.map(l => l.text)).toEqual(['9.3 kb del'])
})

// Two arcs over the same stretch of backbone put their labels in nearly the same
// place, and the one that survives should be the larger event rather than
// whichever the edge list happened to reach first.
test('the bigger deletion keeps its label', () => {
  const bypassed = ['long']
  const del = (edgeIndex: number, bp: number) => ({
    edgeIndex,
    ...between,
    refName: 'chr1',
    start: 100,
    end: 100 + bp,
    bp,
    bypassed,
  })
  const labels = graphLabels({
    nodePositions: FLANKED,
    nodeLengths: LENGTHS,
    deletions: [del(0, 10_000), del(1, 15_700)],
    axis: iso(),
    ...VIEWPORT,
  }).filter(l => l.kind === 'deletion')
  expect(labels.map(l => l.text)).toEqual(['15.7 kb del'])
})

// An arc wide enough to hold its own name keeps the label centred on
// it: the tether is for the case below, and every figure whose arcs are already
// readable must be untouched by it.
test('an arc that can hold its own name keeps it, untethered', () => {
  const [label] = graphLabels({
    nodePositions: FLANKED,
    nodeLengths: LENGTHS,
    deletions: [
      {
        edgeIndex: 0,
        ...between,
        refName: 'chr1',
        start: 100,
        end: 84_783,
        bp: 84_683,
        bypassed: ['long'],
      },
    ],
    axis: iso(),
    ...VIEWPORT,
  }).filter(l => l.kind === 'deletion')
  expect(label!.leader).toBeUndefined()
})

// The LPA KIV-2 case: a 32-unit arc over a short bypassed run, which clears the
// "not a dot" floor while still being narrower than the words naming it.
// Centred there the text reads as a caption dropped on whatever is beside the
// arc, so it moves off and states the link instead.
const CRAMPED = {
  nodePositions: {
    before: [
      { x: -80, y: 0 },
      { x: 0, y: 0 },
    ],
    after: [
      { x: 32, y: 0 },
      { x: 112, y: 0 },
    ],
    short: [
      { x: 0, y: 0 },
      { x: 32, y: 0 },
    ],
  },
  nodeLengths: new Map<string, number>(),
  deletions: [
    {
      edgeIndex: 0,
      ...between,
      refName: 'chr1',
      start: 100,
      end: 27_800,
      bp: 27_700,
      bypassed: ['short'],
    },
  ],
  axis: iso(),
  ...VIEWPORT,
}

test('an arc too small for its name keeps it on a leader', () => {
  const [label] = graphLabels(CRAMPED).filter(l => l.kind === 'deletion')
  expect(label!.text).toBe('27.7 kb del')
  const { leader } = label!
  expect(leader).toBeDefined()
  // the tether starts on the arc and ends short of the label's centre, so the
  // line stops at the box rather than running under the text
  const toLabel = Math.hypot(label!.x - leader!.arcX, label!.y - leader!.arcY)
  const drawn = Math.hypot(
    leader!.labelX - leader!.arcX,
    leader!.labelY - leader!.arcY,
  )
  expect(drawn).toBeLessThan(toLabel)
})

// The same arc turned 45 degrees, which is where "the box's edge" and "the plane
// the box touches at a corner" come apart: the label is several times wider than
// it is tall, so a diagonal leader stopped at the support distance ends a stub's
// length from the arc with most of the gap left white. It has to run to the box.
test('a diagonal leader reaches the label it tethers', () => {
  const turn = (segments: { x: number; y: number }[]) =>
    segments.map(({ x, y }) => ({
      x: (x - y) / Math.SQRT2,
      y: (x + y) / Math.SQRT2,
    }))
  const [label] = graphLabels({
    ...CRAMPED,
    nodePositions: Object.fromEntries(
      Object.entries(CRAMPED.nodePositions).map(([id, s]) => [id, turn(s)]),
    ),
  }).filter(l => l.kind === 'deletion')
  const { leader } = label!
  const drawn = Math.hypot(
    leader!.labelX - leader!.arcX,
    leader!.labelY - leader!.arcY,
  )
  const remaining = Math.hypot(
    label!.x - leader!.labelX,
    label!.y - leader!.labelY,
  )
  // it stops within the label's own half-height of the text rather than at the
  // far corner of its bounding box, and so covers most of the displacement
  expect(remaining).toBeLessThan(15)
  expect(drawn).toBeGreaterThan(remaining * 2)
})

// A tethered label picks its own position, so it must pick one on the canvas.
// CRAMPED's arc sits 16px from the left edge and the words are 72 wide, so
// displacing blind hangs them off the frame — the general cull keeps any box
// that merely overlaps it, which is how the MHC force layout shipped a clipped
// `…ips 1.5 kb of reference` against its left edge. It slides in instead, and
// the leader is redrawn to wherever it ended up.
test('a tethered label slides into the frame, leader following', () => {
  const [label] = graphLabels(CRAMPED).filter(l => l.kind === 'deletion')
  const { leader } = label!
  expect(leader).toBeDefined()
  const halfW = '27.7 kb del'.length * 5.7 + 9
  expect(label!.x - halfW / 2).toBeGreaterThanOrEqual(0)
  // still anchored on the arc, and still pointing from it at the words
  expect(leader!.arcX).toBeLessThan(label!.x)
  expect(leader!.labelX).toBeGreaterThan(leader!.arcX)
})

// Displaced along the bow, so the label lands on the open side the arc was drawn
// into rather than back across the backbone it leaves.
test('a tethered label moves the way its arc bows', () => {
  const [label] = graphLabels(CRAMPED).filter(l => l.kind === 'deletion')
  // the chord lies on y = 0, so the apex and the label are both on the side the
  // arc bows to, and the label is the further out
  expect(Math.sign(label!.y)).toBe(Math.sign(label!.leader!.arcY))
  expect(Math.abs(label!.y)).toBeGreaterThan(Math.abs(label!.leader!.arcY))
})

test('formats bp at the scale a pangenome allele lives at', () => {
  expect([formatBp(12), formatBp(1200), formatBp(2_500_000)]).toEqual([
    '12 bp',
    '1.2 kb',
    '2.5 Mb',
  ])
})

// The row labels of a row-structured layout paint over the same overlay and are
// opaque, so a node label under one is gone rather than behind it: a "17 bp"
// against the left edge of an anchored layout came out as a stray "bp" beside
// `Reference (rank 0)`.
test('a row label holds its space against a node label', () => {
  const at = (reserved?: ReturnType<typeof rowLabelBox>[]) =>
    graphLabels({
      nodePositions: {
        atEdge: [
          { x: 10, y: 40 },
          { x: 90, y: 40 },
        ],
      },
      nodeLengths: new Map([['atEdge', 17]]),
      deletions: [],
      axis: iso(),
      ...VIEWPORT,
      reserved,
    }).map(l => l.text)
  expect(at()).toEqual(['17 bp'])
  expect(at([rowLabelBox('Reference (rank 0)', 40)])).toEqual([])
})

// A segment standing in for more reference than it carries is a deletion, and
// on a reference-bp axis the drawing has already committed to that reading: the
// bar's width is the reference it replaces. Labelling it with the node's own
// length describes the sequence while the reader is looking at the reference —
// this is the E. coli pggb case, 93 bp of CFT073 drawn across the 7.1 kb of K12
// it stands in for (review: "unclear why the '93bp' is just a weird little
// line. should it be a 'loop'?").
test('an allele that replaces more reference than it carries is a deletion', () => {
  const labels = graphLabels({
    nodePositions: NODES,
    nodeLengths: LENGTHS,
    deletions: [],
    alleleDeletions: [{ nodeIds: ['long'], bp: 7019 }],
    axis: iso(),
    ...VIEWPORT,
  })
  expect(labels.map(l => l.text).sort()).toEqual(['12 bp', '7 kb del'])
  expect(labels.find(l => l.text === '7 kb del')?.kind).toBe('deletion')
})

// ...and the node it covers does not also print its length there. Both are true;
// only one of them is about the extent being drawn, and "39 kb" written across a
// bar whose width means something else is the misreading the label exists to fix.
test('a node inside a labelled allele deletion keeps its length off the drawing', () => {
  const labels = graphLabels({
    nodePositions: NODES,
    nodeLengths: LENGTHS,
    deletions: [],
    alleleDeletions: [{ nodeIds: ['long'], bp: 7019 }],
    axis: iso(),
    ...VIEWPORT,
  })
  expect(labels.map(l => l.text)).not.toContain('39 kb')
})

// The fit rule is the same one node labels obey, so a base-level graph whose
// alleles occupy a visibility-floor sliver stays unlabelled rather than carrying
// a caption per SNP: at 2 units of extent the words are twenty times the run.
test('an allele deletion too small to carry its label is dropped, not shrunk', () => {
  const labels = graphLabels({
    nodePositions: NODES,
    nodeLengths: LENGTHS,
    deletions: [],
    alleleDeletions: [{ nodeIds: ['speck'], bp: 3 }],
    axis: iso(),
    ...VIEWPORT,
  })
  expect(labels.map(l => l.text).sort()).toEqual(['12 bp', '39 kb'])
})

// A run wider than the window has no on-screen midpoint, and placing the label
// at its true one puts it off the canvas, where the cull below drops it and the
// bar goes unnamed. That is the real E. coli case: 7.1 kb of reference drawn
// across a 460 bp window, entering from the left edge.
test('a run reaching off-frame is labelled on the part that is shown', () => {
  const labels = graphLabels({
    nodePositions: {
      offframe: [
        { x: -9000, y: 20 },
        { x: 200, y: 20 },
      ],
    },
    nodeLengths: new Map([['offframe', 93]]),
    deletions: [],
    alleleDeletions: [{ nodeIds: ['offframe'], bp: 7019 }],
    axis: iso(),
    ...VIEWPORT,
  })
  expect(labels.map(l => l.text)).toEqual(['7 kb del'])
  expect(labels[0]!.x).toBeGreaterThan(0)
  expect(labels[0]!.x).toBeLessThan(VIEWPORT.width)
})

// A run's on-screen extent used to be taken with `Math.min(...points.map(...))`,
// four spreads over the same array. Past ~128k arguments V8 throws RangeError
// out of the spread rather than returning a number, so a long enough run took
// the whole label overlay down — and the overlay is what the labels of every
// OTHER thing in the drawing come from, so one oversized allele erased all of
// them. `maxGraphNodes` is a view prop a session can raise, which is what makes
// the size reachable; `backboneSpan` is a fold for the same reason.
test('a run too long to spread into an argument list is still measured', () => {
  const nodeIds = Array.from({ length: 70_000 }, (_, i) => `n${i}`)
  const nodePositions = Object.fromEntries(
    nodeIds.map((id, i) => [
      id,
      [
        { x: i, y: 0 },
        { x: i + 1, y: 0 },
      ],
    ]),
  )
  const labels = graphLabels({
    nodePositions,
    nodeLengths: new Map(nodeIds.map(id => [id, 1])),
    deletions: [],
    alleleDeletions: [{ nodeIds, bp: 70_000 }],
    axis: iso(),
    ...VIEWPORT,
  })
  expect(labels.map(l => l.text)).toContain('70 kb del')
})

// A node drag moves the position objects without replacing them, so nothing
// about `nodePositions` reports that the drawing changed — which is why the
// caches keyed on it take a version, and why the overlay reads one. Without it
// a dragged node's size label sits at the position the node used to have.
test('a version bump republishes labels for positions mutated in place', () => {
  const nodePositions = {
    long: [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
    ],
  }
  const at = (version: number) =>
    graphLabels({
      nodePositions,
      nodeLengths: new Map([['long', 39_000]]),
      deletions: [],
      axis: iso(),
      ...VIEWPORT,
      version,
    })[0]!
  const before = at(1)
  for (const seg of nodePositions.long) {
    seg.x += 120
  }
  expect(at(2).x).toBeCloseTo(before.x + 120, 5)
})

// The other half of that contract: a pan changes where labels go and nothing
// else, so the per-layout caches have to survive it rather than be keyed by it.
test('a pan moves every label by the pan and drops none', () => {
  const args = {
    nodePositions: NODES,
    nodeLengths: LENGTHS,
    deletions: [],
    axis: iso(),
    ...VIEWPORT,
  }
  const before = graphLabels(args)
  const after = graphLabels({ ...args, translateX: args.translateX + 25 })
  expect(after.map(l => l.key)).toEqual(before.map(l => l.key))
  expect(after.map(l => l.x)).toEqual(before.map(l => l.x + 25))
})

test("a node's label sits halfway along its polyline", () => {
  const labels = graphLabels({
    nodePositions: {
      mid: [
        { x: 0, y: 20 },
        { x: 200, y: 20 },
      ],
    },
    nodeLengths: new Map([['mid', 5000]]),
    deletions: [],
    axis: iso(),
    ...VIEWPORT,
  })
  expect(labels).toHaveLength(1)
  expect(labels[0]!.x).toBe(100)
  expect(labels[0]!.y).toBe(20)
})
