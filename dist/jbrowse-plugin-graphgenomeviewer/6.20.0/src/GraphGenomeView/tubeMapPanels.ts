import { parsePanSN } from '@jbrowse/bandage-core/alleleProjection/projectAlleles'
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

// Tube px between panels, which a panel's title takes
export const PANEL_GAP = 28
export const PANEL_REFERENCE_TUBE = '#4d4d4d'
export const PANEL_TUBE = '#5b8cc4'
export const PANEL_TUBES = [PANEL_TUBE, '#82abd9']
export const PANEL_TITLE_FONT = '12px sans-serif'
// a stack squeezed into a short track keeps its rules, not its titles
export const MIN_TITLE_GAP_PX = 16

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

// A walk's value in a column: its haplotype's row (`HG00097#1`), else its
// sample's, as groupWalkRows reads it
function columnKeyOf(field: string, table: SampleRow[]) {
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

// How many of a panel's walks pass through `box`, of how many it holds
export function walksThrough(graph: Graph, box: string) {
  const all = new Set<string>()
  const here = new Set<string>()
  for (const p of graph.paths ?? []) {
    const walk = walkOf(p.name)
    if (walk !== graph.referencePath) {
      all.add(walk)
      if (p.nodeIds.includes(box)) {
        here.add(walk)
      }
    }
  }
  return { here: here.size, of: all.size }
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
    if (p.top - p.titleTop >= MIN_TITLE_GAP_PX) {
      ctx.font = PANEL_TITLE_FONT
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#c00000'
      ctx.fillText(
        ` · ${hit.here} of ${plural(hit.of, 'haplotype')} here`,
        6 + ctx.measureText(p.label).width,
        p.titleTop + 4,
      )
    }
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
  const pathVisits = graph.pathVisits
    ? new Map(
        [...graph.pathVisits].flatMap(([segment, visits]) =>
          names.has(segment)
            ? [[segment, visits.filter(v => walks.has(v.path))] as const]
            : [],
        ),
      )
    : undefined
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
