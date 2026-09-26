import { isBackbone, isOffReference } from './anchoredNodes'
import { anchoredLayout } from './layout/anchoredLayout'
import { orderedLayout } from './layout/orderedLayout'
import { sampleRowLayout } from './layout/sampleRowLayout'
import { variantMapLayout } from './layout/variantMapLayout'
import { walkRowLayout } from './layout/walkRowLayout'

import type { Graph, LayoutResult } from './types'

// The force layout's menu label. jbrowse-components' check-menu-labels scans
// this src/ for string literals, so a documented **Layout → …** path is held
// to what the dropdown renders.
export const FORCE_LAYOUT_LABEL = 'Force-directed layout'

// One table drives the persisted enum, the toolbar dropdown, and the dispatch in
// the model, so adding a layout is one entry rather than several edits that can
// disagree.
//
// `run` returning undefined means "this mode can't draw this graph" and hands
// off to the remote Bandage FMMM engine. 'auto' uses it when a GFA has no
// rank-0 backbone — neither declared in rGFA tags nor derivable from P/W lines
// (pathAnchoring.ts) — and 'force' is simply the mode that always takes it.
export interface LayoutMode {
  value: string
  label: string
  description: string
  // `region` is the interval the cut was made for, absent for a whole-file
  // import. The reference-anchored modes scale their rows and their allele
  // floor against it rather than against the backbone they were handed, which
  // a long-range allele's far anchor stretches well past the window
  // (referenceSpan).
  run: (
    graph: Graph,
    region?: { start: number; end: number },
  ) => LayoutResult | undefined
  // whether this mode can draw this graph at all; the dropdown greys out the
  // rest rather than hiding them, so the reason a mode is unavailable stays
  // visible instead of the menu silently changing shape between graphs
  available: (graph: Graph) => boolean
  // whether `run` draws this graph itself, as opposed to handing off to the
  // engine. Not the same question as `available` and not derivable from it:
  // 'force' is available for every graph and draws none of them itself. The two
  // coincide for the anchored modes, which is stated by sharing the predicate
  // rather than by restating it.
  drawsLocally: (graph: Graph) => boolean
}

const hasBackbone = (graph: Graph) => graph.nodes.some(isBackbone)
const hasWalks = (graph: Graph) =>
  hasBackbone(graph) && (graph.paths?.length ?? 0) > 1
const hasAlleles = (graph: Graph) =>
  hasBackbone(graph) && graph.nodes.some(isOffReference)

// `satisfies` rather than a `: LayoutMode[]` annotation: the annotation widened
// every `value` to string, which collapsed LayoutModeValue to string and left the
// persisted enum unable to state which values it accepts.
export const LAYOUT_MODES = [
  {
    value: 'auto',
    label: 'Anchored',
    description:
      'x is reference bp, one row per stable rank. Needs rGFA tags or a reference path.',
    run: anchoredLayout,
    available: hasBackbone,
    drawsLocally: hasBackbone,
  },
  {
    value: 'samplerows',
    label: 'Sample rows',
    description:
      'x is reference bp, one row per contributing assembly. Needs rGFA tags or a reference path.',
    run: sampleRowLayout,
    available: hasAlleles,
    drawsLocally: hasAlleles,
  },
  {
    value: 'walkrows',
    label: 'Walk rows',
    description:
      "x is each walk's own bp: one bar per haplotype, sequence the reference also carries in blue and sequence it does not in purple, so a repeat expansion reads as bar length. Needs W or P lines.",
    run: walkRowLayout,
    available: hasWalks,
    drawsLocally: hasWalks,
  },
  {
    value: 'ordered',
    label: 'Ordered',
    description:
      'x is reference order, not bp: every node gets room, bubbles read as lenses. Needs rGFA tags or a reference path.',
    run: orderedLayout,
    available: hasBackbone,
    drawsLocally: hasBackbone,
  },
  {
    value: 'variants',
    label: 'Variant map',
    description:
      'The reference as a line with one typed glyph per bubble, from the bubble index or from the graph itself: SNP, indel, deletion, inversion, repeat array. Click a glyph to open the graph inside it.',
    run: variantMapLayout,
    available: hasBackbone,
    drawsLocally: hasBackbone,
  },
  {
    value: 'force',
    label: FORCE_LAYOUT_LABEL,
    description: 'OGDF FMMM, via the external Bandage engine.',
    run: () => undefined,
    available: () => true,
    drawsLocally: () => false,
  },
] as const satisfies readonly LayoutMode[]

export type LayoutModeValue = (typeof LAYOUT_MODES)[number]['value']

export const LAYOUT_MODE_VALUES = LAYOUT_MODES.map(m => m.value)

// Whether the drawing a mode produces for a graph comes from the FMMM engine.
// The settings that only the engine reads — layout quality, bubble spread —
// are shown against this, so a control that cannot do anything to the drawing
// on screen says so instead of appearing to work.
export function modeUsesLayoutEngine(value: string, graph: Graph) {
  return !layoutModeByValue(value).drawsLocally(graph)
}

export function layoutModeByValue(value: string) {
  // An unknown value can only come from a snapshot written by a build that had
  // a mode this one doesn't. It falls back to 'auto' rather than to the model's
  // own default of 'force', because 'auto' declines any graph it cannot draw and
  // hands off to force anyway, so this is the fallback that covers both.
  return LAYOUT_MODES.find(m => m.value === value) ?? LAYOUT_MODES[0]
}
