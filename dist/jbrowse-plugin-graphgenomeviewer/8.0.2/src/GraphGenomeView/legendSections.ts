import { sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import {
  BUBBLE_KIND_COLORS,
  BUBBLE_KIND_NAMES,
} from '@jbrowse/bandage-core/bubbles/classifyBubble'
import { deletionKey } from '@jbrowse/bandage-core/deletionEdges'
import { edgeWidthFactor } from '@jbrowse/bandage-core/edgeWidths'
import { EXON_COLOR } from '@jbrowse/bandage-core/genes/exonOutline'
import { formatBp } from '@jbrowse/bandage-core/graphLabels'
import {
  BAR_PX as WALK_ROW_BAR_PX,
  CALL_TICK,
  DISAGREES,
  GENE_INK,
  UNBACKED_TICK,
  walkRowsKey,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import { frequencyKey, nodeWidthPx } from '@jbrowse/bandage-core/nodeWidths'
import { referenceLabel } from '@jbrowse/bandage-core/reference'
import { RAMP_GRADIENT_STOPS } from '@jbrowse/bandage-core/referenceRampCss'
import {
  LIFT_BACKDROP_CSS,
  REFERENCE_RAMP_ALT_CSS,
} from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { deviationInk } from '@jbrowse/bandage-core/tubeMap/deviations'
import {
  FORWARD_READ_COLORS,
  REVERSE_READ_COLORS,
} from '@jbrowse/bandage-core/tubeMap/reads'
import { encodingStops } from '@jbrowse/bandage-core/walkEncoding'
import { fadedKey } from '@jbrowse/bandage-core/walkHighlight'
import { walkKey } from '@jbrowse/bandage-core/walkKey'

import { CALL_TOLERANCE } from './repeats/walkCalls'
import { PANEL_REFERENCE_TUBE } from './tubeMapPanels'
import { COLORED_BLOCKS, blockFill, blockLetter } from './walkRowBlocks'

import type { GraphPaneModel } from './model'
import type { KeySwatch } from '@jbrowse/bandage-core/layout/walkRowDraw'
import type { GraphNode } from '@jbrowse/bandage-core/types'
import type { LiftedWalk } from '@jbrowse/bandage-core/walkHighlight'

// The legend as data, so the screen's panel and the exported figure's key
// draw the same rows from one place

export const SWATCH_PX = 18
const BAR_PX = 32

// LIFT_BACKDROP_CSS reads paler alone than faded strokes do where they
// overlap, so the key samples it darker
const FADED_SWATCH = 'rgba(160, 160, 160, 0.45)'
const DELETION_INK = '#18181c'

const STRIP_SAMPLES = 6
const TUBE_SWATCH_PX = 7
const FOLD_TICK_BACKING = '#b8b8c0'
const WALK_ROW_SWATCH_PX = WALK_ROW_BAR_PX - 4
const LINK_INK = 'rgba(119, 119, 119, 0.85)'
const LINE_PX = 15
const CHIP_PX = 10

export interface Stop {
  offset: number
  color: string
}

export type LegendSwatch =
  | {
      kind: 'fill'
      stops: Stop[]
      width?: number
      height?: number
      square?: boolean
      // a hairline edge, so a pale colour still shows on the white key
      edged?: true
    }
  // the reference strip, a band per lifted walk
  | { kind: 'bands'; bands: Stop[][] }
  | { kind: 'line'; color: string; dashed?: true }
  | { kind: 'halo'; color: string }
  | {
      kind: 'outline'
      color: string
      stroke: number
      radius: number
      height: number
    }
  | { kind: 'overhang' }
  | { kind: 'glyph'; char: string }
  | { kind: 'tick'; color: string; height: number; backing?: string }
  | { kind: 'bracket' }
  | { kind: 'blank' }

// A row with no swatch is a note on the drawing
export interface LegendRow {
  key: string
  label: string
  swatch?: LegendSwatch
  strong?: string
  under?: string
  title?: string
  walk?: LiftedWalk
  closesBubble?: true
}

interface LegendSection {
  testid: string
  rows: LegendRow[]
  group?: string
  // the group's name, over the first of its sections
  heading?: string
  // set apart from the group above by a heading's gap, though it has none
  spaced?: true
}

export function swatchWidth(swatch: LegendSwatch) {
  return swatch.kind === 'fill' ? (swatch.width ?? SWATCH_PX) : SWATCH_PX
}

export const bandPx = (bands: readonly unknown[]) => (bands.length > 1 ? 3 : 4)

export function swatchHeight(swatch: LegendSwatch) {
  switch (swatch.kind) {
    case 'fill':
      return swatch.height ?? 8
    case 'bands':
      return bandPx(swatch.bands) * swatch.bands.length
    case 'line':
      return 3
    case 'halo':
    case 'overhang':
      return 10
    case 'outline':
    case 'tick':
      return swatch.height
    case 'glyph':
      return 15
    case 'bracket':
      return 7
    case 'blank':
      return 0
  }
}

// One column every swatch of a key sits in, so the words after them line up
export function swatchColumn(rows: readonly LegendRow[]) {
  return rows.reduce(
    (px, row) => (row.swatch ? Math.max(px, swatchWidth(row.swatch)) : px),
    0,
  )
}

// One pitch for every line of a key, roomy enough for its tallest swatch, so
// rows sit evenly however their swatches differ
export function rowPitch(rows: readonly LegendRow[]) {
  return rows.reduce(
    (px, row) =>
      row.swatch ? Math.max(px, Math.ceil(swatchHeight(row.swatch)) + 3) : px,
    LINE_PX,
  )
}

const flat = (color: string): Stop[] => [{ offset: 0, color }]

// A colour's key is a square chip, so it never reads as a thickness bar
function fillRow(key: string, color: string, label: string): LegendRow {
  return {
    key,
    label,
    swatch: {
      kind: 'fill',
      stops: flat(color),
      width: CHIP_PX,
      height: CHIP_PX,
      edged: true,
    },
  }
}

// hard-edged bands, a read taking one shade of its strand's palette
function bandStops(colors: readonly string[]) {
  return colors.flatMap((color, i) => [
    { offset: i / colors.length, color },
    { offset: (i + 1) / colors.length, color },
  ])
}

function openBubbleRows(model: GraphPaneModel): LegendRow[] {
  const open = model.openBubble
  if (!open) {
    return []
  }
  const halo = model.bubbleHalos.find(h => sameBubble(h.bubble, open))
  return [
    {
      key: 'open',
      label: `open: ${halo?.label ?? 'bubble'}`,
      swatch: halo
        ? { kind: 'halo', color: BUBBLE_KIND_COLORS[halo.kind] }
        : { kind: 'blank' },
      closesBubble: true,
    },
  ]
}

// Under lifted walks each lane states its own scale, and the rest is grey
function rampRows(model: GraphPaneModel): LegendRow[] {
  const domain = model.walkLift ? undefined : model.referenceRampDomain
  if (!domain) {
    return []
  }
  // a measured domain runs between node midpoints, which can fall on a half bp
  const start = Math.round(domain.start)
  const end = Math.round(domain.end)
  const reference = model.graph ? referenceLabel(model.graph) : 'reference'
  return [
    {
      key: 'ramp',
      label: `position on ${reference}`,
      swatch: { kind: 'fill', stops: RAMP_GRADIENT_STOPS, width: BAR_PX },
      under: `${start.toLocaleString('en-US')}-${end.toLocaleString('en-US')} (${formatBp(end - start)})`,
    },
    ...(model.referenceRampDrawsOffReference
      ? [fillRow('off', REFERENCE_RAMP_ALT_CSS, 'off the reference')]
      : []),
  ]
}

// The strip's own colours: a band per lifted walk in its lane's, else the
// node scheme's, a few of its blocks in bp order rather than a rainbow it
// does not draw
function stripBands(model: GraphPaneModel): Stop[][] {
  const lift = model.walkLift
  if (lift) {
    return lift.walks.map(w => encodingStops(w.encoding))
  }
  if (model.effectiveColorScheme === 'reference-position') {
    return [RAMP_GRADIENT_STOPS]
  }
  const colors = model.referenceStripBlocks
    .map(b => b.colors[0]!)
    .filter((c, i, all) => c !== all[i - 1])
  const n = Math.min(STRIP_SAMPLES, colors.length)
  return [
    n === 0
      ? flat(LIFT_BACKDROP_CSS)
      : Array.from({ length: n }, (_, i) => ({
          offset: n > 1 ? i / (n - 1) : 0,
          color:
            colors[
              n > 1 ? Math.round((i * (colors.length - 1)) / (n - 1)) : 0
            ]!,
        })),
  ]
}

function stripRows(model: GraphPaneModel): LegendRow[] {
  if (!model.referenceStripShown) {
    return []
  }
  const rowPerWalk = (model.walkLift?.walks.length ?? 0) > 1
  return [
    {
      key: 'strip',
      label: `reference${rowPerWalk ? ', a row per walk' : ''}`,
      swatch: { kind: 'bands', bands: stripBands(model) },
    },
    ...(model.referenceStripFaded
      ? [
          fillRow(
            'strip-faded',
            LIFT_BACKDROP_CSS,
            model.walkLift
              ? `reference not on ${rowPerWalk ? "that row's walk" : model.liftedWalksLabel}`
              : 'reference outside the open bubble',
          ),
        ]
      : []),
    ...(model.referenceStripOverhangs
      ? [
          {
            key: 'overhang',
            label: 'graph runs past this edge',
            swatch: { kind: 'overhang' } as const,
          },
        ]
      : []),
  ]
}

// One row per halo colour drawn, naming the kinds it stands for
function haloRows(model: GraphPaneModel): LegendRow[] {
  const kindsByColor = new Map<string, Set<string>>()
  for (const h of model.bubbleHalos) {
    if (!h.whole) {
      const color = BUBBLE_KIND_COLORS[h.kind]
      const kinds = kindsByColor.get(color) ?? new Set<string>()
      kinds.add(BUBBLE_KIND_NAMES[h.kind])
      kindsByColor.set(color, kinds)
    }
  }
  return [...kindsByColor].map(([color, kinds]) => {
    const names = [...kinds].join(' or ')
    return {
      key: `halo-${color}`,
      label:
        names === BUBBLE_KIND_NAMES.superbubble ? names : `${names} bubble`,
      swatch: { kind: 'halo', color },
    }
  })
}

function deletionRows(model: GraphPaneModel): LegendRow[] {
  const { graph } = model
  return graph && model.deletions.length > 0
    ? [
        {
          key: 'deletion',
          label: deletionKey(referenceLabel(graph)),
          swatch: {
            kind: 'line',
            color: model.walkLift ? FADED_SWATCH : DELETION_INK,
            dashed: true,
          },
        },
      ]
    : []
}

function thicknessRow(
  key: string,
  label: string,
  px: number,
  color: string,
): LegendRow {
  return {
    key,
    label,
    swatch: { kind: 'fill', stops: flat(color), width: BAR_PX, height: px },
  }
}

const roundDepth = (depth: number) =>
  depth >= 10 ? Math.round(depth) : Math.round(depth * 10) / 10

// What a node's thickness counts, with bars as thick as the drawing makes
// the thinnest, the mean and the thickest node
function nodeWidthRows(model: GraphPaneModel): LegendRow[] {
  const { graph, contigThickness: px, depthRange: range } = model
  if (!graph || !model.drawsNodes || model.walkRowBars) {
    return []
  }
  if (model.nodeWidth === 'frequency') {
    const tagged = graph.nodes.some(n => n.frequency !== undefined)
    return frequencyKey(px).map(({ label, widthPx }) =>
      thicknessRow(
        `width-${label}`,
        tagged ? `AF ${label}` : `${label} of haplotypes`,
        widthPx,
        REFERENCE_RAMP_ALT_CSS,
      ),
    )
  }
  if (model.nodeWidth !== 'depth' || !range || range.min === range.max) {
    return []
  }
  const walkCount = graph.paths?.length ?? 0
  const walks = walkCount > 0
  const depths = [
    ...new Set(
      [range.max, range.mean, range.min].map(walks ? Math.round : roundDepth),
    ),
  ]
  // a walk looping through a repeat passes its nodes more than once, and
  // each pass counts
  const passes = depths[0]! > walkCount
  const counted = (n: number) =>
    passes
      ? `${n.toLocaleString('en-US')} walk pass${n === 1 ? '' : 'es'}`
      : `${n.toLocaleString('en-US')} walk${n === 1 ? '' : 's'}`
  return depths.map(depth =>
    thicknessRow(
      `width-${depth}`,
      walks ? counted(depth) : `depth ${depth.toLocaleString('en-US')}`,
      nodeWidthPx({ depth } as GraphNode, px, 'depth', range.mean),
      REFERENCE_RAMP_ALT_CSS,
    ),
  )
}

function linkWidthRows(model: GraphPaneModel): LegendRow[] {
  const busiest = model.busiestLink
  if (
    !model.drawsNodes ||
    model.walkRowBars ||
    model.linkWidth !== 'walks' ||
    busiest === 0
  ) {
    return []
  }
  const counts = busiest > 1 ? [busiest, 1] : [1]
  return counts.map(n =>
    thicknessRow(
      `link-width-${n}`,
      `${n.toLocaleString('en-US')} walk${n === 1 ? '' : 's'}`,
      model.connectorThickness * edgeWidthFactor(n, busiest, 'walks'),
      LINK_INK,
    ),
  )
}

function geneRows(model: GraphPaneModel): LegendRow[] {
  return model.genePins.some(pin => pin.exonsByNode.length > 0)
    ? [
        {
          key: 'exon',
          label: 'exon',
          swatch: {
            kind: 'outline',
            color: EXON_COLOR,
            stroke: 2,
            radius: 5,
            height: 8,
          },
        },
      ]
    : []
}

function foldRows(model: GraphPaneModel): LegendRow[] {
  const note = model.foldNote
  return note ? [{ key: 'fold', label: note }] : []
}

function pathRows(model: GraphPaneModel): LegendRow[] {
  return model.pathLegend.map(({ name, label, color }) => ({
    key: `path-${name}`,
    label,
    swatch: { kind: 'line', color },
  }))
}

function tubeRow(key: string, stops: Stop[], label: string): LegendRow {
  return {
    key,
    label,
    swatch: { kind: 'fill', stops, height: TUBE_SWATCH_PX, square: true },
  }
}

// What a tube map draws that nothing else on screen explains, each listed
// only while it applies
export function tubeMapRows(model: GraphPaneModel): LegendRow[] {
  const {
    roles,
    haplotypeTube,
    bundled,
    values,
    logWidths,
    foldBp,
    forwardReads,
    reverseReads,
    substitution,
    insertion,
    deletion,
  } = model.tubeMapKeys
  const reads = model.readsShown
  const rows: LegendRow[] = []
  if (values) {
    rows.push(
      tubeRow('value-reference', flat(PANEL_REFERENCE_TUBE), 'reference'),
    )
    for (const { value, color } of values) {
      rows.push(tubeRow(`value-${value}`, flat(color), value))
    }
  }
  if (roles) {
    rows.push(
      tubeRow('ref', flat(PANEL_REFERENCE_TUBE), 'reference'),
      tubeRow(
        'hap',
        flat(haplotypeTube),
        bundled ? 'shared route, ×n haplotypes' : 'haplotype',
      ),
    )
  }
  if (forwardReads) {
    rows.push(
      tubeRow(
        'fwd',
        bandStops(FORWARD_READ_COLORS),
        'read on the forward strand',
      ),
    )
  }
  if (reverseReads) {
    rows.push(
      tubeRow(
        'rev',
        bandStops(REVERSE_READ_COLORS),
        'read on the reverse strand',
      ),
    )
  }
  if (reads && reads.shown < reads.total) {
    rows.push({
      key: 'sampled',
      label: `${reads.shown.toLocaleString('en-US')} of ${reads.total.toLocaleString('en-US')} reads shown`,
      swatch: { kind: 'blank' },
    })
  }
  if (substitution) {
    rows.push({
      key: 'sub',
      label: 'read mismatch',
      swatch: { kind: 'glyph', char: 'A' },
    })
  }
  if (insertion) {
    rows.push({
      key: 'ins',
      label: 'read insertion',
      swatch: { kind: 'glyph', char: '*' },
    })
  }
  if (deletion) {
    rows.push(tubeRow('del', flat('grey'), 'read deletion'))
  }
  if (foldBp !== undefined) {
    rows.push({
      key: 'tube-fold',
      label: `haplotype variant < ${formatBp(foldBp)}`,
      swatch: {
        kind: 'tick',
        color: deviationInk(),
        height: TUBE_SWATCH_PX,
        backing: FOLD_TICK_BACKING,
      },
    })
  }
  if (logWidths) {
    rows.push({
      key: 'log',
      label: 'width grows with log of length',
      swatch: { kind: 'bracket' },
    })
  }
  return rows
}

export function walkRowSwatch(swatch: KeySwatch): LegendSwatch {
  return swatch.kind === 'gene'
    ? {
        kind: 'outline',
        color: GENE_INK,
        stroke: 1.5,
        radius: 0,
        height: WALK_ROW_SWATCH_PX,
      }
    : {
        kind: 'fill',
        stops:
          swatch.kind === 'bar' && swatch.ramp
            ? RAMP_GRADIENT_STOPS
            : flat(swatch.fill),
        height: swatch.kind === 'gap' ? swatch.px : WALK_ROW_SWATCH_PX,
      }
}

// The shared blocks the rows draw: each coloured one by its letter, then one
// row for the grey rest
function blockRows(model: GraphPaneModel): LegendRow[] {
  const present = new Set(model.sharedBlocks?.map(b => b.block))
  const swatch = (block: number) => ({
    kind: 'fill' as const,
    stops: flat(blockFill(block)),
    height: WALK_ROW_SWATCH_PX,
  })
  return [
    ...[...present]
      .filter(block => block < COLORED_BLOCKS)
      .sort((a, b) => a - b)
      .map(block => ({
        key: `block-${block}`,
        label: `${blockLetter(block)}: off the reference, walked by several rows`,
        swatch: swatch(block),
      })),
    ...([...present].some(block => block >= COLORED_BLOCKS)
      ? [
          {
            key: 'block-more',
            label: 'more shared blocks',
            swatch: swatch(COLORED_BLOCKS),
          },
        ]
      : []),
  ]
}

// The walk rows' bar colours, genes and ticks; each tick row appears once
// the rows hold one, so a catalogue with no genotypes keeps the plain key
function walkRowsRows(model: GraphPaneModel): LegendRow[] {
  const bars = model.walkRowBars
  if (!bars) {
    return []
  }
  const calls = [bars.reference, ...bars.rows].flatMap(row => row.call ?? [])
  const tick = (key: string, color: string, label: string): LegendRow => ({
    key,
    label,
    swatch: { kind: 'tick', color, height: WALK_ROW_SWATCH_PX },
  })
  return [
    ...walkRowsKey(bars, {
      ramp: model.referenceRampDomain,
      genes: model.walkRowGeneKey,
      annotation: model.walkRowAnnotation,
    }).map(entry => ({
      key: `rows-${entry.label}`,
      label: entry.label,
      swatch: entry.note ? undefined : walkRowSwatch(entry.swatch),
    })),
    ...blockRows(model),
    ...(calls.some(call => call.spanningReads !== 0)
      ? [tick('call', CALL_TICK, 'allele length called for this walk')]
      : []),
    ...(calls.some(call => call.spanningReads === 0)
      ? [tick('unbacked', UNBACKED_TICK, 'called with no read spanning it')]
      : []),
    ...(calls.some(call => call.agrees === false)
      ? [
          tick(
            'disagrees',
            DISAGREES,
            `walk and call over ${Math.round(CALL_TOLERANCE * 100)}% apart`,
          ),
        ]
      : []),
  ]
}

// One lifted walk's key: a swatch, or a short bar of the scale its lane
// shades by, then its name, with the scale's stretch under it
export function walkKeyRow(model: GraphPaneModel, walk: LiftedWalk): LegendRow {
  const key = walkKey(walk, model.walkReference)
  return {
    key: `walk-${walk.name}`,
    strong: model.walkLabel(walk.name),
    label: key.delta + key.gaps + key.reversed,
    swatch: {
      kind: 'fill',
      stops: encodingStops(walk.encoding),
      width: key.shades ? BAR_PX : SWATCH_PX,
    },
    under: key.scale,
    title: key.hover,
    walk,
  }
}

// The off-reference colour, where the lift paints it, and the faded rest.
// rampRows draws no key while walks are lifted, so these rows name both.
function fadedRows(model: GraphPaneModel, faded: string): LegendRow[] {
  return [
    ...(model.liftPaintsOffReference
      ? [fillRow('lift-off', REFERENCE_RAMP_ALT_CSS, 'off the reference')]
      : []),
    fillRow('faded', FADED_SWATCH, faded),
  ]
}

// Each lifted walk's key, then what the faded rest is
function walkReadoutRows(model: GraphPaneModel): LegendRow[] {
  const lift = model.walkLift
  if (!lift || model.facetPanels) {
    return []
  }
  const rows = lift.walks.map(w => walkKeyRow(model, w))
  const faded = model.graph
    ? fadedKey(model.graph, lift, model.liftedWalksLabel)
    : `not on ${model.liftedWalksLabel}`
  return [...rows, ...fadedRows(model, faded)]
}

// The faceted pane's one key line under its panels: each panel's title keys
// its walk, so this keys only what every panel greys
export function facetKeyRows(model: GraphPaneModel): LegendRow[] {
  const { graph, facetPanels } = model
  if (!graph || !facetPanels) {
    return []
  }
  const keys = new Set(
    facetPanels.map(panel => fadedKey(graph, panel, "the panel's walk")),
  )
  return [
    ...fadedRows(
      model,
      keys.size === 1 ? [...keys][0]! : "not on the panel's walk",
    ),
    ...deletionRows(model),
  ]
}

// The keys in the order the panel stacks them, top first, each under its
// group's heading once the key holds more than one group
export function legendSections(model: GraphPaneModel): LegendSection[] {
  const sections: LegendSection[] = [
    { testid: 'graph-open-bubble-legend', rows: openBubbleRows(model) },
    { testid: 'graph-ramp-legend', rows: rampRows(model), group: 'Color' },
    {
      testid: 'graph-walk-readout',
      rows: walkReadoutRows(model),
      group: 'Walks',
    },
    {
      testid: 'graph-width-legend',
      rows: nodeWidthRows(model),
      group: 'Node thickness',
    },
    {
      testid: 'graph-link-width-legend',
      rows: linkWidthRows(model),
      group: 'Link thickness',
    },
    { testid: 'graph-halo-legend', rows: haloRows(model), group: 'Marks' },
    {
      testid: 'graph-deletion-legend',
      rows: deletionRows(model),
      group: 'Marks',
    },
    { testid: 'graph-gene-legend', rows: geneRows(model), group: 'Marks' },
    { testid: 'graph-path-legend', rows: pathRows(model), group: 'Paths' },
    {
      testid: 'graph-tube-map-legend',
      rows: tubeMapRows(model),
      group: 'Tube map',
    },
    {
      testid: 'graph-walk-rows-legend',
      rows: walkRowsRows(model),
      group: 'Walk rows',
    },
    {
      testid: 'graph-reference-strip-legend',
      rows: stripRows(model),
      group: 'Top strip',
    },
    { testid: 'graph-fold-legend', rows: foldRows(model) },
  ].filter(section => section.rows.length > 0)
  const groups = new Set(sections.flatMap(section => section.group ?? []))
  if (groups.size < 2) {
    return sections
  }
  const headed = new Set<string>()
  return sections.map((section, i) => {
    const { group } = section
    if (!group) {
      return i === 0 ? section : { ...section, spaced: true as const }
    }
    if (headed.has(group)) {
      return section
    }
    headed.add(group)
    return { ...section, heading: group }
  })
}
