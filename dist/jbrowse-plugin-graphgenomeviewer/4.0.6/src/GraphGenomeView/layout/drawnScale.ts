import type { Graph, GraphNode } from '../types'

export interface BandageScaleOpts {
  nodeLengthPerMegabase: number
  minimumNodeLength: number
  nodeSegmentLength: number
  edgeLength: number
}

// Node drawn length, in FMMM units, as a function of bp. Used both by the layouts
// that run here and by the options handed to the WASM engine, so a graph is drawn
// at the same scale whichever one draws it. Bandage's own auto rule
// (`AssemblyGraph::determineGraphInfo`):
// pick units-per-megabase so the *mean* drawn node length lands on 40, with a
// floor on total drawn length so a small graph doesn't collapse to a speck.
//
// This has to be derived per graph, not fixed. The scale that suits a bacterial
// assembly's 10-100 kb contigs is wrong by orders of magnitude for a minigraph
// pangenome window, whose nodes run 300 bp to a few kb: a fixed 1000 units/Mbp
// makes every node shorter than the edges between them and the graph reads as
// beads on a string, while 1 unit/bp makes each node a long sweeping curve and
// the graph sprawls. For the 53-node E. coli window this lands near 35,000.
//
// It matters most at the small end. The WASM wrapper's own default of 1000
// units/Mbp puts *every* node in a 400 bp pggb window below minimumNodeLength,
// so all 31 clamp to the floor and a 1 bp SNP allele draws the same size as the
// 164 bp backbone segment beside it — which is what made that figure read as a
// chain of same-sized two-node bubbles. Bandage draws the same file with a 75:1
// length ratio, the SNP alleles as specks.
//
// The remaining three are upstream Bandage's shipped defaults
// (`program/settings.cpp`), which the WASM wrapper's own header does not match —
// it defaults all of them to 1.0, so they have to be passed explicitly.
const MEAN_NODE_LENGTH = 40
const MIN_TOTAL_GRAPH_LENGTH = 500

// Bandage's own floor on a node's drawn length. Right for an assembly graph,
// whose nodes are kb to Mb, and the reason a variation graph draws as a rope:
// see BUBBLE_SPREADS, which is how a view asks for more.
const BANDAGE_MINIMUM_NODE_LENGTH = 5

// The engine's own rule (`settings.h`, `getDrawnNodeLength`), so a seed computed
// here spans exactly the chain the engine builds from the same numbers.
export function drawnNodeLength(opts: BandageScaleOpts, length: number) {
  return Math.max(
    (opts.nodeLengthPerMegabase * length) / 1_000_000,
    opts.minimumNodeLength,
  )
}

export function bandageAutoScale(
  graph: Graph,
  // Floor on a node's drawn length, in the same FMMM units as the scale below.
  // Anything at or under Bandage's own floor leaves the drawing exactly as it
  // was, which is what keeps `'auto'` byte-identical to the shipped behaviour.
  minNodeLength = BANDAGE_MINIMUM_NODE_LENGTH,
): BandageScaleOpts {
  const totalLength = graph.nodes.reduce((sum, n) => sum + n.length, 0)
  const megabases = totalLength / 1_000_000
  const target = Math.max(
    graph.nodes.length * MEAN_NODE_LENGTH,
    MIN_TOTAL_GRAPH_LENGTH,
  )
  return {
    nodeLengthPerMegabase: megabases > 0 ? target / megabases : 10_000,
    minimumNodeLength: Math.max(BANDAGE_MINIMUM_NODE_LENGTH, minNodeLength),
    edgeLength: 5,
    nodeSegmentLength: 20,
  }
}

// How a node's bp becomes its drawn length, as a power law against the graph's
// own mean. The idiom is Bandage's, moved onto the axis a pangenome needs it on:
// upstream derives a node's *width* from its depth exactly this way
// (`graph/graphicsitemnode.cpp`, `getNodeWidth`), at a `depthPower` of 0.5 and a
// `depthEffectOnWidth` of 0.5, because depth in an assembly graph spans orders
// of magnitude and drawing it linearly is unreadable.
//
//   drawn = meanDrawn * (((bp / meanBp) ^ power - 1) * effect + 1)
//
// Length in a *variation* graph spans those same orders of magnitude — a 1 bp
// allele beside a 16 kb backbone segment — and upstream still maps it linearly,
// because its own nodes are assembled contigs where that range does not arise.
// That linear map is what draws a pggb window as one rope: past the small end
// every allele falls under `minimumNodeLength` and clamps, so both arms of a
// bubble land inside one node thickness of each other.
//
// power 1 with effect 1 is exactly proportional, so Bandage's shipped behaviour
// is a point in this family rather than a mechanism sitting beside it. See
// BUBBLE_SPREADS for the points a view can ask for.
export interface DrawnLengthLaw {
  // exponent applied to a node's length relative to the graph's mean
  power: number
  // how much of that relative length survives. 0 draws every node at the mean,
  // 1 applies the power law undamped.
  effect: number
}

export const PROPORTIONAL_LENGTH: DrawnLengthLaw = { power: 1, effect: 1 }

export function isProportional(law: DrawnLengthLaw) {
  return law.power === 1 && law.effect === 1
}

// Drawn length in FMMM units for one node of `graph`, under `law`.
export function drawnLengthFor(graph: Graph, law: DrawnLengthLaw) {
  const count = graph.nodes.length
  const totalLength = graph.nodes.reduce((sum, n) => sum + n.length, 0)
  const meanBp = count > 0 ? totalLength / count : 0
  // The mean drawn length `bandageAutoScale` already targets, small-graph floor
  // included, so a compressed drawing comes out the same overall size as the
  // proportional one it replaces. That is the property a per-node floor does
  // not have, and the reason raising one is unusable at scale: it lifts the
  // hundreds of non-branching chain nodes along with the alleles, which on a
  // 521-node cut inflates the drawing past what zoom-to-fit can frame.
  const meanDrawn =
    count > 0
      ? Math.max(count * MEAN_NODE_LENGTH, MIN_TOTAL_GRAPH_LENGTH) / count
      : MEAN_NODE_LENGTH
  return (bp: number) => {
    if (meanBp <= 0) {
      return meanDrawn
    }
    const relative = (bp / meanBp) ** law.power
    return Math.max(
      meanDrawn * ((relative - 1) * law.effect + 1),
      BANDAGE_MINIMUM_NODE_LENGTH,
    )
  }
}

// The engine's own length rule is linear with a floor and takes two numbers
// (`settings.h`, `getDrawnNodeLength`), so a non-linear law cannot be expressed
// through them. It can be expressed in the lengths themselves: node length
// crosses the RPC boundary only to become a drawn length — `getLength()` has
// exactly two call sites upstream, both inside that rule — so handing the engine
// pre-transformed lengths and a 1:1 scale draws the law without touching the
// WASM build. Scaled by this factor first because the binding reads a node's
// length as an `unsigned`, and rounding drawn units straight to integers would
// quantise the small end where the whole point is legibility.
const LAYOUT_LENGTH_PRECISION = 1000

// How a view asks for its node lengths: a law, plus Bandage's own per-node
// floor. Orthogonal on purpose — see BUBBLE_SPREADS for which does what.
export interface NodeLengthSpread {
  law: DrawnLengthLaw
  // in the same FMMM units as the drawn lengths. At or under Bandage's own
  // floor this leaves the drawing exactly as it was.
  minNodeLength: number
}

export const PROPORTIONAL_SPREAD: NodeLengthSpread = {
  law: PROPORTIONAL_LENGTH,
  minNodeLength: 0,
}

export interface LayoutScaling {
  // the nodes to hand the engine. Under any law but the proportional one their
  // `length` is a scaled drawn length rather than a bp count, which is why this
  // is a separate array and never the graph's own nodes.
  nodes: GraphNode[]
  opts: BandageScaleOpts
}

export function layoutScaling(
  graph: Graph,
  spread: NodeLengthSpread = PROPORTIONAL_SPREAD,
): LayoutScaling {
  const { law, minNodeLength } = spread
  const opts = bandageAutoScale(graph, minNodeLength)
  // The proportional law is what every committed force figure was drawn
  // against, and it is already exactly what `bandageAutoScale` expresses, so it
  // keeps the untransformed path rather than round-tripping through a rounding
  // step FMMM would be free to amplify. Every floor-based spread comes through
  // here too, unchanged.
  if (isProportional(law)) {
    return { nodes: graph.nodes, opts }
  }
  const drawn = drawnLengthFor(graph, law)
  return {
    nodes: graph.nodes.map(node => ({
      ...node,
      length: Math.round(drawn(node.length) * LAYOUT_LENGTH_PRECISION),
    })),
    opts: {
      ...opts,
      nodeLengthPerMegabase: 1_000_000 / LAYOUT_LENGTH_PRECISION,
      // Bandage's own floor only. A law and a raised floor are alternatives
      // rather than a stack: the law has already lifted the small end, and a
      // floor on top of it would flatten exactly what it just spread.
      minimumNodeLength: BANDAGE_MINIMUM_NODE_LENGTH,
    },
  }
}

// The mean drawn node length `bandageAutoScale` targets, exported so
// BUBBLE_SPREADS can state its laws against it rather than against unanchored
// constants.
export { MEAN_NODE_LENGTH }
