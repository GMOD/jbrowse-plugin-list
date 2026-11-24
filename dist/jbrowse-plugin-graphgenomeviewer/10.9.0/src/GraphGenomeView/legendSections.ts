import { BUBBLE_HALO_COLOR } from '@jbrowse/bandage-core/bubbles/bubbleLabel'
import { sameBubble } from '@jbrowse/bandage-core/bubbles/bubbleLine'
import { unlabelledText, walkKeyEntry } from '@jbrowse/bandage-core/graphKey'
import { formatBp } from '@jbrowse/bandage-core/graphLabels'
import {
  BAR_PX as WALK_ROW_BAR_PX,
  CALL_TICK,
  DISAGREES,
  GENE_INK,
  UNBACKED_TICK,
  walkRowsKey,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import { RAMP_GRADIENT_STOPS } from '@jbrowse/bandage-core/referenceRampCss'
import { arrowheadOutline } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'
import { LIFT_BACKDROP_CSS } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { abgrToCssRgba } from '@jbrowse/bandage-core/renderer/colorBits'
import {
  LANE_HEAD_HALO_PX,
  LANE_HEAD_LENGTH,
  LANE_HEAD_MIN_PX,
  laneHeadInk,
} from '@jbrowse/bandage-core/renderer/laneHeads'
import { THREAD_PX } from '@jbrowse/bandage-core/renderer/walkLanes'
import { deviationInk } from '@jbrowse/bandage-core/tubeMap/deviations'
import {
  FORWARD_READ_COLORS,
  REVERSE_READ_COLORS,
} from '@jbrowse/bandage-core/tubeMap/reads'
import { encodingStops } from '@jbrowse/bandage-core/walkEncoding'

import { CALL_TOLERANCE } from './repeats/walkCalls'
import { PANEL_REFERENCE_TUBE } from './tubeMapPanels'
import { tubeMapNote } from './unloadedWalks'
import { COLORED_BLOCKS, blockFill, blockLetter } from './walkRowBlocks'
import { EXPAND_NAMED_MAX } from '../GetSubgraph'

import type { GraphPaneModel } from './model'
import type {
  GraphKeyEntry,
  GraphKeySectionId,
  GraphKeySwatch,
  KeyStop,
} from '@jbrowse/bandage-core/graphKey'
import type { KeySwatch } from '@jbrowse/bandage-core/layout/walkRowDraw'
import type { LiftedWalk } from '@jbrowse/bandage-core/walkHighlight'

// The legend as data, so the screen's panel and the exported figure's key
// draw the same rows from one place

export const SWATCH_PX = 18
const BAR_PX = 32

const STRIP_SAMPLES = 6
const TUBE_SWATCH_PX = 7
const FOLD_TICK_BACKING = '#b8b8c0'
const WALK_ROW_SWATCH_PX = WALK_ROW_BAR_PX - 4
const LINE_PX = 15
const CHIP_PX = 10
const HEADS_LANE_PX = 8

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
      // a hollow chip's rim, round the fill
      rim?: string
    }
  // the reference strip, a band per lifted walk
  | { kind: 'bands'; bands: Stop[][] }
  // a link's stroke; `short`, a skip's plain stroke too short to dash
  | { kind: 'line'; color: string; dashed?: true; short?: true }
  | { kind: 'halo'; color: string }
  | {
      kind: 'outline'
      color: string
      stroke: number
      radius: number
      height: number
    }
  | { kind: 'overhang' }
  | { kind: 'overrun' }
  | { kind: 'glyph'; char: string }
  | { kind: 'tick'; color: string; height: number; backing?: string }
  | { kind: 'bracket' }
  | { kind: 'blank' }
  // a lane's threads side by side, one per pass through a node
  | { kind: 'threads' }
  // a lane with its heads, about its centre line; a head wider than its
  // lane stands on a white halo
  | {
      kind: 'heads'
      lane: string
      lanePx: number
      heads: string
      fill: string
      haloPx?: number
    }

// A row with no swatch is a note on the drawing
export interface LegendRow {
  key: string
  label: string
  swatch?: LegendSwatch
  strong?: string
  under?: string
  // after the words, how many placeholders the labels left unlabelled, ''
  // until they are placed or where none is, their lengths in the row's
  // title; `sizer`, the widest it can come to, reserves its room unseen, so
  // the key's size waits on no label
  count?: string
  sizer?: string
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
    case 'overrun':
      return 10
    case 'outline':
    case 'tick':
      return swatch.height
    case 'glyph':
      return 15
    case 'bracket':
      return 7
    case 'threads':
      return 8
    case 'heads':
      return swatch.haloPx === undefined
        ? swatch.lanePx
        : LANE_HEAD_MIN_PX + swatch.haloPx
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

const css = abgrToCssRgba

const cssStops = (stops: readonly KeyStop[]) =>
  stops.map(({ offset, ink }) => ({ offset, color: css(ink) }))

// as bandage-core's figure keys them: one head inside a lane, or two on a
// thread, each wider than the thread and haloed
function headsSwatch(ink: number, haloed: boolean): LegendSwatch {
  const width = haloed ? LANE_HEAD_MIN_PX : HEADS_LANE_PX
  const length = width * LANE_HEAD_LENGTH
  const heads = (haloed ? [length, SWATCH_PX] : [SWATCH_PX - 1])
    .map(x => {
      const outline = arrowheadOutline(
        { x, y: 0, angle: 0, length, halfWidth: width / 2, color: ink },
        { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0, dpr: 1 },
      )
      return `M${outline.map(p => `${+p.x.toFixed(1)},${+p.y.toFixed(1)}`).join('L')}Z`
    })
    .join('')
  return {
    kind: 'heads',
    lane: css(ink),
    lanePx: haloed ? THREAD_PX : HEADS_LANE_PX,
    heads,
    fill: css(laneHeadInk(ink, !haloed)),
    ...(haloed ? { haloPx: 2 * LANE_HEAD_HALO_PX } : {}),
  }
}

// bandage-core's swatch, drawn by LegendSwatch
function legendSwatch(swatch: GraphKeySwatch): LegendSwatch {
  switch (swatch.kind) {
    case 'scale':
      return { kind: 'fill', stops: cssStops(swatch.stops), width: BAR_PX }
    case 'swatch':
      return { kind: 'fill', stops: flat(css(swatch.ink)), width: SWATCH_PX }
    case 'chip':
      return {
        kind: 'fill',
        stops: flat(css(swatch.ink)),
        width: CHIP_PX,
        height: CHIP_PX,
        edged: true,
      }
    case 'width':
      return {
        kind: 'fill',
        stops: flat(css(swatch.ink)),
        width: BAR_PX,
        height: swatch.px,
      }
    case 'hollow':
      return {
        kind: 'fill',
        stops: flat(css(swatch.ink)),
        rim: css(swatch.rim),
      }
    case 'line':
      return swatch.dashed
        ? { kind: 'line', color: css(swatch.ink), dashed: true }
        : { kind: 'line', color: css(swatch.ink), short: true }
    case 'outline':
      return {
        kind: 'outline',
        color: css(swatch.ink),
        stroke: 2,
        radius: 5,
        height: 8,
      }
    case 'halo':
      return { kind: 'halo', color: css(swatch.ink) }
    case 'threads':
      return { kind: 'threads' }
    case 'overhang':
      return { kind: 'overhang' }
    case 'overrun':
      return { kind: 'overrun' }
    case 'heads':
      return headsSwatch(swatch.ink, swatch.haloed)
  }
}

export function keyRow(entry: GraphKeyEntry): LegendRow {
  return {
    key: entry.key,
    label: entry.text,
    ...(entry.swatch ? { swatch: legendSwatch(entry.swatch) } : {}),
    ...(entry.strong === undefined ? {} : { strong: entry.strong }),
    ...(entry.under === undefined ? {} : { under: entry.under }),
    ...(entry.hover === undefined ? {} : { title: entry.hover }),
    ...(entry.walk ? { walk: entry.walk } : {}),
  }
}

// A row's count after its words, set off by a dot
export const countWords = (count: string | undefined) =>
  count ? `· ${count}` : ''

const unlabelledCount = (count: number) =>
  count > 0 ? `${count.toLocaleString('en-US')} unlabelled` : ''

// The count with every placeholder the drawing holds unlabelled
export function widestUnlabelledCount(model: GraphPaneModel) {
  return unlabelledCount(
    (model.drawnGraph?.nodes ?? []).filter(node => node.placeholder).length,
  )
}

// The rows of one section of bandage-core's key. The line core keeps under
// "nodes not shown" for the unlabelled count rides that row instead, blank
// and sized by the widest it can come to
function keyRowsOf(model: GraphPaneModel, id: GraphKeySectionId) {
  return (
    model.graphKey
      .find(section => section.id === id)
      ?.entries.map(({ under, ...entry }) =>
        under === ''
          ? { ...keyRow(entry), count: '', sizer: widestUnlabelledCount(model) }
          : keyRow(under === undefined ? entry : { ...entry, under }),
      ) ?? []
  )
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
        ? { kind: 'halo', color: BUBBLE_HALO_COLOR }
        : { kind: 'blank' },
      closesBubble: true,
    },
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

// A row's own colour either side of grey, off the first row that breaks
function brokenRowBand(blocks: GraphPaneModel['referenceStripBlocks']) {
  const row = blocks
    .find(b => b.colors.includes(LIFT_BACKDROP_CSS))
    ?.colors.indexOf(LIFT_BACKDROP_CSS)
  const color =
    row === undefined
      ? undefined
      : blocks.map(b => b.colors[row]).find(c => c && c !== LIFT_BACKDROP_CSS)
  return color ? bandStops([color, LIFT_BACKDROP_CSS, color]) : undefined
}

function stripRows(model: GraphPaneModel): LegendRow[] {
  if (!model.referenceStripShown) {
    return []
  }
  const walks = model.walkLift?.walks ?? []
  const rowPerWalk = walks.length > 1
  const broken = walks.length > 0 && brokenRowBand(model.referenceStripBlocks)
  return [
    {
      key: 'strip',
      label: rowPerWalk
        ? 'reference each walk passes through'
        : walks[0] && !walks[0].reference
          ? `reference ${model.liftedWalksLabel} passes through`
          : 'reference',
      swatch: { kind: 'bands', bands: stripBands(model) },
    },
    ...(model.referenceStripFaded
      ? [
          walks.length > 0
            ? {
                key: 'strip-faded',
                label: `grey where ${rowPerWalk ? 'a walk' : model.liftedWalksLabel} does not pass through`,
                swatch: {
                  kind: 'bands' as const,
                  bands: [broken || flat(LIFT_BACKDROP_CSS)],
                },
              }
            : fillRow(
                'strip-faded',
                LIFT_BACKDROP_CSS,
                'reference outside the open bubble',
              ),
        ]
      : []),
    ...keyRowsOf(model, 'overhang'),
  ]
}

function tubeMapNoteRows(model: GraphPaneModel): LegendRow[] {
  const note = model.layoutResult?.tubeMap
    ? tubeMapNote(model.graph, model.abridged)
    : undefined
  return note ? [{ key: 'tube-not-shown', label: note }] : []
}

function foldRows(model: GraphPaneModel): LegendRow[] {
  const note = model.foldNote
  const refusal = model.foldRefusalNote
  return [
    ...(note ? [{ key: 'fold', label: note }] : []),
    ...(refusal ? [{ key: 'fold-refused', label: refusal }] : []),
  ]
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
        ...(swatch.kind === 'bar' && swatch.rim ? { rim: swatch.rim } : {}),
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
      ...(model.rowVisitsNeeded
        ? { comparing: { fetchLimit: EXPAND_NAMED_MAX } }
        : {}),
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
export function walkKeyRow(model: GraphPaneModel, walk: LiftedWalk) {
  return keyRow(
    walkKeyEntry(walk, model.walkLabel(walk.name), model.walkReference, name =>
      model.walkLabel(name),
    ),
  )
}

// The faceted pane's one key line under its panels: each panel's title keys
// its walk, so this keys only what every panel greys, the skips and what the
// panels leave undrawn
export function facetKeyRows(model: GraphPaneModel) {
  return model.facetPanels
    ? [
        ...keyRowsOf(model, 'walks'),
        ...keyRowsOf(model, 'skips'),
        ...keyRowsOf(model, 'too-small'),
      ]
    : []
}

// The keys in the order the panel stacks them, top first, each under its
// group's heading once the key holds more than one group
export function legendSections(model: GraphPaneModel): LegendSection[] {
  const core = (testid: string, id: GraphKeySectionId, group?: string) => ({
    testid,
    rows: model.facetPanels && id === 'walks' ? [] : keyRowsOf(model, id),
    group,
  })
  const sections: LegendSection[] = [
    { testid: 'graph-open-bubble-legend', rows: openBubbleRows(model) },
    core('graph-ramp-legend', 'ramp', 'Color'),
    core('graph-walk-readout', 'walks', 'Walks'),
    core('graph-width-legend', 'node-width', 'Node thickness'),
    core('graph-link-width-legend', 'link-width', 'Link thickness'),
    core('graph-halo-legend', 'halo', 'Marks'),
    core('graph-deletion-legend', 'skips', 'Marks'),
    core('graph-not-shown-legend', 'not-shown', 'Marks'),
    core('graph-gene-legend', 'exon', 'Marks'),
    { testid: 'graph-path-legend', rows: pathRows(model), group: 'Paths' },
    {
      testid: 'graph-tube-map-legend',
      rows: [...tubeMapRows(model), ...tubeMapNoteRows(model)],
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
      group: 'Reference strip',
    },
    core('graph-compressed-legend', 'compressed'),
    { testid: 'graph-fold-legend', rows: foldRows(model) },
    core('graph-too-small-legend', 'too-small'),
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

// The key as drawn: the unlabelled count filled in once the labels are
// placed, and bandage-core's words for them, with their lengths, as its title
export function drawnLegendSections(model: GraphPaneModel) {
  const { unlabelled } = model.overlayLabels
  const count = unlabelledCount(unlabelled?.count ?? 0)
  const words = unlabelledText(unlabelled)
  return legendSections(model).map(section => ({
    ...section,
    rows: section.rows.map(row =>
      row.count === undefined
        ? row
        : {
            ...row,
            count,
            ...(words
              ? { title: row.title ? `${row.title}\n${words}` : words }
              : {}),
          },
    ),
  }))
}
