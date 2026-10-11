import { parsePanSN } from '@jbrowse/bandage-core/alleleProjection/projectAlleles'
import { formatBp } from '@jbrowse/bandage-core/graphLabels'
import { pathOrigin } from '@jbrowse/bandage-core/pathAnchoring'
import { drawTubeMapHighlight } from '@jbrowse/bandage-core/tubeMap/draw'
import { groupKeyComparator } from '@jbrowse/core/util/groupKeys'

import type { SampleRow } from './walkRowGroups'
import type { FacetBy } from '@jbrowse/bandage-core/facetGrid'
import type { TubeMapDrawing } from '@jbrowse/bandage-core/layout/tubeMapLayout'
import type { TubeMapPicture } from '@jbrowse/bandage-core/tubeMap/draw'
import type { TubeMapTransform } from '@jbrowse/bandage-core/tubeMap/frame'
import type { Graph, LayoutResult } from '@jbrowse/bandage-core/types'

// A tube map split into small multiples: a panel per sample, or per walk, each
// the reference and that group's walks laid out alone, stacked down the pane.
// On the reference axis every panel's columns sit at their bp, so a box lines
// up across the panels and with the linear view's tracks.

// px above each panel, which its title takes
export const PANEL_GAP = 28
export const PANEL_REFERENCE_TUBE = '#4d4d4d'
export const PANEL_TUBE = '#5b8cc4'
export const PANEL_TUBES = [PANEL_TUBE, '#82abd9']
export const PANEL_TITLE_FONT = '12px sans-serif'

export const TUBE_MAP_PANELS: { field: '' | FacetBy; label: string }[] = [
  { field: '', label: 'None' },
  { field: 'sample', label: 'A panel per sample' },
  { field: 'walk', label: 'A panel per haplotype' },
]

// How the walks split: by sample or walk, the groups the domain names first
// and the rest in the graph's order, or by a sample table column, its values
// in the order a JBrowse Group by sorts them
export type TubeMapPanelSplit =
  | { by: FacetBy; domain?: readonly string[] }
  | { by: 'column'; field: string; table: SampleRow[]; domain?: string[] }

export interface TubeMapPanelGroup {
  key: string
  // the graph's own path names, pieces of one walk included
  paths: string[]
  // a column's value names a group of samples, and says how many
  label?: string
}

export interface TubeMapPanel extends TubeMapPanelGroup {
  result: LayoutResult & { tubeMap: TubeMapDrawing }
  // where the panel's drawing starts down the stack, in tube px
  top: number
  height: number
}

// a pane's layout: a tube map split into panels carries them, and the stack's
// extent and node positions in place of the whole map's
export type PaneLayout = LayoutResult & { tubeMapPanels?: TubeMapPanel[] }

const walkOf = (name: string) => pathOrigin(name).name

// A tube coloured by its role where no key could name a hue per walk: the
// reference charcoal and the haplotypes blue, neighbours alternating two
// shades so each stays countable in a bundle
export function roleTubeColors(
  paths: readonly { name: string }[],
  reference: string | undefined,
) {
  let haplotype = 0
  return paths.map(p =>
    walkOf(p.name) === reference
      ? PANEL_REFERENCE_TUBE
      : PANEL_TUBES[haplotype++ % PANEL_TUBES.length]!,
  )
}

// a categorical palette for a column's values, a hue each in sorted order
const VALUE_TUBES = [
  '#4e79a7',
  '#f28e2b',
  '#59a14f',
  '#e15759',
  '#b07aa1',
  '#76b7b2',
  '#edc948',
  '#9c755f',
  '#ff9da7',
  '#bab0ac',
]
export const NO_VALUE_TUBE = '#c8c8c8'

// Each of a column's values its hue, in the order a JBrowse Group by sorts
// them; a value past the palette, or none, is grey
export function valueTubePalette(values: Iterable<string>) {
  const sorted = [...new Set(values)]
    .filter(v => v !== '')
    .sort(groupKeyComparator())
  return new Map(sorted.map((v, i) => [v, VALUE_TUBES[i] ?? NO_VALUE_TUBE]))
}

// The reference charcoal and each walk, or the bundle it stands for, in its
// value's hue
export function valueTubeColors(
  paths: readonly { name: string; members?: string[] }[],
  reference: string | undefined,
  valueOf: (walk: string) => string,
  palette: ReadonlyMap<string, string>,
) {
  return paths.map(p => {
    const walk = walkOf(p.name)
    return walk === reference
      ? PANEL_REFERENCE_TUBE
      : (palette.get(valueOf(p.members?.[0] ?? walk)) ?? NO_VALUE_TUBE)
  })
}

// A walk's value in a column: its haplotype's row (`HG00097#1`), else its
// sample's, as groupWalkRows reads it
export function columnKeyOf(field: string, table: SampleRow[]) {
  const valueOf = new Map(table.map(row => [row.name, row[field] ?? '']))
  return (walk: string) => {
    const { sample, haplotype } = parsePanSN(walk)
    return valueOf.get(`${sample}#${haplotype}`) || valueOf.get(sample) || ''
  }
}

function plural(n: number, noun: string) {
  return `${n} ${noun}${n === 1 ? '' : 's'}`
}

// Each non-reference walk's group
export function tubeMapPanelGroups(
  graph: Graph,
  split: TubeMapPanelSplit,
): TubeMapPanelGroup[] {
  const keyOf =
    split.by === 'column'
      ? columnKeyOf(split.field, split.table)
      : split.by === 'sample'
        ? (walk: string) => parsePanSN(walk).sample
        : (walk: string) => walk
  const groups = new Map<string, string[]>()
  for (const { name } of graph.paths ?? []) {
    const walk = walkOf(name)
    if (walk !== graph.referencePath) {
      const key = keyOf(walk)
      const list = groups.get(key)
      if (list) {
        list.push(name)
      } else {
        groups.set(key, [name])
      }
    }
  }
  if (split.by === 'column') {
    return [...groups.keys()]
      .sort(groupKeyComparator(split.domain))
      .map(key => {
        const paths = groups.get(key)!
        const samples = new Set(paths.map(p => parsePanSN(walkOf(p)).sample))
        return {
          key,
          paths,
          label: `${key || `${split.field}: none`} · ${plural(samples.size, 'sample')}`,
        }
      })
  }
  const domain = split.domain ?? []
  const rank = new Map(domain.map((key, i) => [key, i]))
  const listed = (key: string) => rank.get(key) ?? domain.length
  return [...groups]
    .map(([key, paths], i) => ({ key, paths, i }))
    .sort((a, b) => listed(a.key) - listed(b.key) || a.i - b.i)
    .map(({ key, paths }) => ({ key, paths }))
}

// The box a panel draws a node of the laid graph in: the node itself, or the
// merged run holding it
export function boxOf(drawing: TubeMapDrawing, node: string) {
  if (drawing.graph.nodes.some(n => n.id === node)) {
    return node
  }
  for (const [box, members] of drawing.members) {
    if (members.includes(node)) {
      return box
    }
  }
  return undefined
}

// The member of a merged run under pane x `sx`, a run drawn from `left` to
// `right` across its members' bp, so a panel's count is of the bp the pointer
// is on, not of the whole run. Undefined when no member has a span.
export function memberAt(
  members: readonly string[],
  spanOf: (id: string) => { start: number; end: number } | undefined,
  left: number,
  right: number,
  sx: number,
) {
  const spans = members.flatMap(id => {
    const span = spanOf(id)
    return span ? [{ id, ...span }] : []
  })
  if (spans.length === 0) {
    return undefined
  }
  const start = Math.min(...spans.map(s => s.start))
  const end = Math.max(...spans.map(s => s.end))
  const share = right > left ? (sx - left) / (right - left) : 0
  const bp = start + Math.min(1, Math.max(0, share)) * (end - start)
  const distance = (s: { start: number; end: number }) =>
    bp < s.start ? s.start - bp : bp >= s.end ? bp - s.end + 1 : 0
  return spans.reduce((a, b) => (distance(b) < distance(a) ? b : a)).id
}

// How many of a panel's walks pass through `box`, of how many it holds, a
// bundle counting each walk it stands for
export function walksThrough(graph: Graph, box: string) {
  const all = new Set<string>()
  const here = new Set<string>()
  for (const p of graph.paths ?? []) {
    const walk = walkOf(p.name)
    if (walk !== graph.referencePath) {
      for (const member of p.members ?? [walk]) {
        all.add(member)
        if (p.nodeIds.includes(box)) {
          here.add(member)
        }
      }
    }
  }
  return { here: here.size, of: all.size }
}

const COUNT_FONT = 'bold 11px sans-serif'
const MIN_COUNT_RUN_PX = 80
const MIN_COUNT_TUBE_PX = 9

// Each bundle's count on its tube, along every straight run wide and tall
// enough to hold it, so the count stands where its route parts from others
export function drawBundleCounts(
  ctx: CanvasRenderingContext2D,
  picture: TubeMapPicture,
  graph: Graph,
  { x, y, width }: TubeMapTransform & { width: number },
) {
  const paths = graph.paths ?? []
  if (!paths.some(p => p.members)) {
    return
  }
  const counts = new Map<number, number>()
  paths.forEach((p, i) => {
    if (walkOf(p.name) !== graph.referencePath) {
      counts.set(i, p.members?.length ?? 1)
    }
  })
  ctx.font = COUNT_FONT
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#0b1f3a'
  for (const r of picture.layers[0]?.rects ?? []) {
    const n = counts.get(r.id)
    const left = Math.max(0, x(r.x0))
    const right = Math.min(width, x(r.x1))
    const top = y(r.y0)
    const bottom = y(r.y1)
    if (
      n !== undefined &&
      right - left >= MIN_COUNT_RUN_PX &&
      bottom - top >= MIN_COUNT_TUBE_PX
    ) {
      ctx.fillText(`×${n}`, left + 4, (top + bottom) / 2)
    }
  }
}

const LENGTH_FONT = '10px sans-serif'
const MIN_LENGTH_LABEL_BP = 1000

// Each box of a reference-axis map whose sequence the axis squeezes narrower
// than its length's label, labelled beside it: off the reference a 33 kb
// module draws a few px wide, as a SNP's box does. Boxes of one length
// stacked in a column share a label, "each", at the lowest, where the stack
// has room; a label that would overlap one already drawn is left out.
export function drawSqueezedLengths(
  ctx: CanvasRenderingContext2D,
  drawing: TubeMapDrawing,
  { x, y, width }: TubeMapTransform & { width: number },
) {
  if (!drawing.columns) {
    return
  }
  const lengthOf = new Map(drawing.graph.nodes.map(n => [n.id, n.length]))
  ctx.font = LENGTH_FONT
  const stacks = new Map<
    string,
    { text: string; right: number; mid: number; count: number }
  >()
  // sparse, so forEach, which skips its holes
  drawing.layout.nodes.forEach(node => {
    const bp = lengthOf.get(node.name) ?? 0
    const left = x(node.x)
    const right = x(node.x + node.pixelWidth)
    const text = formatBp(bp)
    if (
      node.order >= 0 &&
      bp >= MIN_LENGTH_LABEL_BP &&
      right - left < ctx.measureText(text).width
    ) {
      const mid = (y(node.y) + y(node.y + node.contentHeight)) / 2
      const key = `${Math.round(right)}:${text}`
      const stack = stacks.get(key)
      if (stack) {
        stack.count++
        stack.mid = Math.max(stack.mid, mid)
      } else {
        stacks.set(key, { text, right, mid, count: 1 })
      }
    }
  })
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.fillStyle = 'rgba(0,0,0,0.75)'
  const drawn: { x0: number; x1: number; y0: number; y1: number }[] = []
  for (const { text, right, mid, count } of stacks.values()) {
    const label = count > 1 ? `${text} each` : text
    const box = {
      x0: right + 3,
      x1: right + 3 + ctx.measureText(label).width,
      y0: mid - 6,
      y1: mid + 6,
    }
    if (
      box.x1 <= width &&
      !drawn.some(
        d => d.x0 < box.x1 && box.x0 < d.x1 && d.y0 < box.y1 && box.y0 < d.y1,
      )
    ) {
      drawn.push(box)
      ctx.strokeText(label, box.x0, mid)
      ctx.fillText(label, box.x0, mid)
    }
  }
}

interface PanelOnScreen {
  picture: TubeMapPicture
  frame: TubeMapTransform
  label: string
  titleTop: number
  top: number
}

// The hovered box in each panel that draws it, and beside each title how many
// of that panel's haplotypes pass through it. On the hover layer, so a hover
// repaints no tube.
export function paintPanelHover(
  ctx: CanvasRenderingContext2D,
  panels: PanelOnScreen[],
  hover: ({ box: string; here: number; of: number } | undefined)[] | undefined,
  { width, lit }: { width: number; lit: boolean },
) {
  panels.forEach((p, i) => {
    const hit = hover?.[i]
    if (!hit) {
      return
    }
    if (lit) {
      drawTubeMapHighlight(ctx, p.picture, {
        ...p.frame,
        width,
        highlightNode: hit.box,
      })
    }
    ctx.font = PANEL_TITLE_FONT
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#c00000'
    ctx.fillText(
      ` · ${hit.here} of ${plural(hit.of, 'haplotype')} here`,
      6 + ctx.measureText(p.label).width,
      p.titleTop + 4,
    )
  })
}

// The reference and `paths` alone: the nodes they visit and the links between
// them, without reads, which name no sample
export function graphOfPaths(graph: Graph, paths: readonly string[]): Graph {
  const kept = new Set(paths)
  const keptPaths = (graph.paths ?? []).filter(
    p => kept.has(p.name) || walkOf(p.name) === graph.referencePath,
  )
  const walks = new Set(keptPaths.map(p => walkOf(p.name)))
  const nodeIds = new Set(keptPaths.flatMap(p => p.nodeIds))
  const nodes = graph.nodes.filter(n => nodeIds.has(n.id))
  const names = new Set(nodes.map(n => n.name))
  const pathVisits = graph.pathVisits?.filter(
    path => walks.has(path),
    segment => names.has(segment),
  )
  return {
    ...graph,
    nodes,
    edges: graph.edges.filter(e => nodeIds.has(e.from) && nodeIds.has(e.to)),
    paths: keptPaths,
    anchorPaths: graph.anchorPaths?.filter(p => walks.has(p.name)),
    pathVisits,
    reads: undefined,
  }
}

// `whole` with each group's own tube map stacked in its place, a title's gap
// above each, or `whole` alone when fewer than two groups draw
export function withTubeMapPanels(
  whole: LayoutResult,
  laidOut: (TubeMapPanelGroup & { result: LayoutResult | undefined })[],
): PaneLayout {
  const panels: TubeMapPanel[] = []
  const nodePositions: LayoutResult['nodePositions'] = {}
  let y = 0
  let minX = Infinity
  let maxX = -Infinity
  for (const { key, paths, label, result } of laidOut) {
    const tubeMap = result?.tubeMap
    const extent = result?.extent
    if (tubeMap && extent) {
      const top = y + PANEL_GAP
      const height = (extent.maxY ?? 0) - (extent.minY ?? 0)
      panels.push({
        key,
        paths,
        label,
        result: { ...result, tubeMap },
        top,
        height,
      })
      const dy = top - (extent.minY ?? 0)
      for (const [id, segments] of Object.entries(result.nodePositions)) {
        nodePositions[id] = segments.map(s => ({ x: s.x, y: s.y + dy }))
      }
      y = top + height
      minX = Math.min(minX, extent.minX ?? minX)
      maxX = Math.max(maxX, extent.maxX ?? maxX)
    }
  }
  return panels.length > 1
    ? {
        ...whole,
        nodePositions,
        extent: {
          ...(minX <= maxX ? { minX, maxX } : {}),
          minY: 0,
          maxY: y,
        },
        tubeMapPanels: panels,
      }
    : whole
}
