import { sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import {
  BUBBLE_KIND_COLORS,
  BUBBLE_KIND_NAMES,
} from '@jbrowse/bandage-core/bubbles/classifyBubble'
import { EXON_COLOR } from '@jbrowse/bandage-core/genes/exonOutline'
import { formatBp } from '@jbrowse/bandage-core/graphLabels'
import {
  BAR_PX as WALK_ROW_BAR_PX,
  CALL_TICK,
  DISAGREES,
  GAP_PX,
  GENE_INK,
  UNBACKED_TICK,
  walkRowsKey,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
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
import { walkKey } from '@jbrowse/bandage-core/walkKey'

import { CALL_TOLERANCE } from './repeats/walkCalls'
import { PANEL_REFERENCE_TUBE } from './tubeMapPanels'

import type { GraphPaneModel } from './model'
import type { KeySwatch } from '@jbrowse/bandage-core/layout/walkRowDraw'
import type { LiftedWalk } from '@jbrowse/bandage-core/walkHighlight'

// The legend as data, so the screen's panel and the exported figure's key
// draw the same rows from one place

export const SWATCH_PX = 18
export const BAR_PX = 48

// getNodeColor's grey for a node the ramp cannot place
export const UNPLACED_SWATCH = 'rgb(160, 160, 160)'

const STRIP_SAMPLES = 6
const TUBE_SWATCH_PX = 7
const FOLD_TICK_BACKING = '#b8b8c0'
const WALK_ROW_SWATCH_PX = WALK_ROW_BAR_PX - 4

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
    }
  // the reference strip, a band per lifted walk
  | { kind: 'bands'; bands: Stop[][] }
  | { kind: 'line'; color: string }
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

export interface LegendSection {
  testid: string
  rows: LegendRow[]
}

export function swatchWidth(swatch: LegendSwatch) {
  return swatch.kind === 'fill' ? (swatch.width ?? SWATCH_PX) : SWATCH_PX
}

const flat = (color: string): Stop[] => [{ offset: 0, color }]

function fillRow(
  key: string,
  color: string,
  label: string,
  width = SWATCH_PX,
): LegendRow {
  return { key, label, swatch: { kind: 'fill', stops: flat(color), width } }
}

// hard-edged bands, a read taking one shade of its strand's palette
function bandStops(colors: readonly string[]) {
  return colors.flatMap((color, i) => [
    { offset: i / colors.length, color },
    { offset: (i + 1) / colors.length, color },
  ])
}

// One key entry per halo colour drawn, naming the kinds it stands for
export function haloKeyEntries(model: GraphPaneModel) {
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
      color,
      label:
        names === BUBBLE_KIND_NAMES.superbubble ? names : `${names} bubble`,
    }
  })
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
  const { offReference, unplaced } = model.referenceRampOffKeys
  return [
    {
      key: 'ramp',
      label: `${start.toLocaleString()}-${end.toLocaleString()} (${formatBp(end - start)})`,
      swatch: { kind: 'fill', stops: RAMP_GRADIENT_STOPS, width: BAR_PX },
    },
    ...(offReference
      ? [fillRow('off', REFERENCE_RAMP_ALT_CSS, 'off the reference', BAR_PX)]
      : []),
    ...(unplaced
      ? [fillRow('unplaced', UNPLACED_SWATCH, 'no reference position', BAR_PX)]
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
      label: `top strip: reference${rowPerWalk ? ', a row per walk' : ''}`,
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

function haloRows(model: GraphPaneModel): LegendRow[] {
  return haloKeyEntries(model).map(({ color, label }) => ({
    key: `halo-${color}`,
    label,
    swatch: { kind: 'halo', color },
  }))
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

function tubeRow(key: string, color: string, label: string): LegendRow {
  return {
    key,
    label,
    swatch: {
      kind: 'fill',
      stops: flat(color),
      height: TUBE_SWATCH_PX,
      square: true,
    },
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
      tubeRow('value-reference', PANEL_REFERENCE_TUBE, 'reference'),
      ...values.map(({ value, color }) =>
        tubeRow(`value-${value}`, color, value),
      ),
    )
  }
  if (roles) {
    rows.push(
      tubeRow('ref', PANEL_REFERENCE_TUBE, 'reference'),
      tubeRow(
        'hap',
        haplotypeTube,
        bundled ? 'shared route, ×n haplotypes' : 'haplotype',
      ),
    )
  }
  const readRow = (key: string, colors: readonly string[], label: string) => ({
    key,
    label,
    swatch: {
      kind: 'fill',
      stops: bandStops(colors),
      height: TUBE_SWATCH_PX,
      square: true,
    } as const,
  })
  if (forwardReads) {
    rows.push(readRow('fwd', FORWARD_READ_COLORS, 'read on the forward strand'))
  }
  if (reverseReads) {
    rows.push(readRow('rev', REVERSE_READ_COLORS, 'read on the reverse strand'))
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
    rows.push(tubeRow('del', 'grey', 'read deletion'))
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
        height: swatch.kind === 'gap' ? GAP_PX : WALK_ROW_SWATCH_PX,
      }
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
    }).map(entry => ({
      key: `rows-${entry.label}`,
      label: entry.label,
      swatch: entry.note ? undefined : walkRowSwatch(entry.swatch),
    })),
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
    label: key.delta + key.outside + key.reversed,
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

// Each lifted walk's key, then what the faded rest is; the colours under a
// shaded walk's bar are bars of its width
function walkReadoutRows(model: GraphPaneModel): LegendRow[] {
  const lift = model.walkLift
  if (!lift || model.facetPanels) {
    return []
  }
  const rows = lift.walks.map(w => walkKeyRow(model, w))
  const width = rows.some(r => swatchWidth(r.swatch!) === BAR_PX)
    ? BAR_PX
    : SWATCH_PX
  return [
    ...rows,
    // the ramp's own key, which names this, is off while walks are lifted
    ...(model.liftPaintsOffReference
      ? [
          fillRow(
            'lift-off',
            REFERENCE_RAMP_ALT_CSS,
            'off the reference',
            width,
          ),
        ]
      : []),
    fillRow(
      'faded',
      LIFT_BACKDROP_CSS,
      `not on ${model.liftedWalksLabel}`,
      width,
    ),
  ]
}

// The keys in the order the panel stacks them, top first
export function legendSections(model: GraphPaneModel): LegendSection[] {
  return [
    { testid: 'graph-open-bubble-legend', rows: openBubbleRows(model) },
    { testid: 'graph-ramp-legend', rows: rampRows(model) },
    { testid: 'graph-reference-strip-legend', rows: stripRows(model) },
    { testid: 'graph-halo-legend', rows: haloRows(model) },
    { testid: 'graph-gene-legend', rows: geneRows(model) },
    { testid: 'graph-fold-legend', rows: foldRows(model) },
    { testid: 'graph-path-legend', rows: pathRows(model) },
    { testid: 'graph-tube-map-legend', rows: tubeMapRows(model) },
    { testid: 'graph-walk-rows-legend', rows: walkRowsRows(model) },
    { testid: 'graph-walk-readout', rows: walkReadoutRows(model) },
  ].filter(section => section.rows.length > 0)
}
