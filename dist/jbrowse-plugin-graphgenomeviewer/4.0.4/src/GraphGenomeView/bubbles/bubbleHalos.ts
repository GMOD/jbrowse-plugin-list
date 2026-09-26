import { bubbleSegmentIds, classifyBubble, formatBp } from './classifyBubble'
import { isBackbone } from '../anchoredNodes'
import { svgPath } from '../util/geometry'

import type { BubbleKind } from './classifyBubble'
import type {
  BubbleRoute,
  MinigraphBubble,
} from '../../MinigraphBubbleAdapter/bubbleLine'
import type { Graph, NodeSegment } from '../types'

// A bubble drawn over the graph itself: a wide translucent stroke along the
// nodes inside it, in layout coordinates, so the same halo follows the nodes
// through the force layout's loops as through the ordered layout's lenses. The
// two backbone nodes a bubble hangs between are not inside it, and are left
// out so neighbouring halos do not touch.
export interface BubbleHalo {
  bubble: MinigraphBubble
  kind: BubbleKind
  label: string
  // an SVG path in layout units; a drawing transform puts it on screen
  path: string
  // where the label goes: the highest point of the halo, in layout units
  top: NodeSegment
  members: number
  // the ids of those nodes, so a lifted walk can say which bubbles it enters
  nodeIds: string[]
  // the bubble is the whole drawing, as a popped bubble's own row is: its
  // label still names it, but a halo around everything marks nothing
  whole: boolean
  // each route the walks take through the bubble, the reference's own
  // included, named for the haplotypes that take it; a route with no steps, a
  // deletion, has nowhere to carry a chip
  routes: RouteLabel[]
}

export interface RouteLabel {
  route: BubbleRoute
  at: NodeSegment
  text: string
}

const WHOLE_FRACTION = 0.9
const NAMED_WALKS = 2
// a SNP's routes are a dot each; chips are for loops a reader can see
const MIN_CHIPPED_BP = 1000

export function bubbleHalos(
  graph: Graph,
  bubbles: MinigraphBubble[],
  positions: Record<string, NodeSegment[]>,
  walkLabel: (name: string) => string = name => name,
): BubbleHalo[] {
  const byName = new Map(graph.nodes.map(n => [n.name, n]))
  const halos: BubbleHalo[] = []
  for (const bubble of bubbles) {
    const parts: string[] = []
    let top: NodeSegment | undefined
    const nodeIds: string[] = []
    const ends: NodeSegment[] = []
    for (const name of bubbleSegmentIds(bubble)) {
      const node = byName.get(name)
      const line = node && positions[node.id]
      if (!node || !line?.length) {
        continue
      }
      if (
        isBackbone(node) &&
        (node.stable.start < bubble.start || node.stable.start >= bubble.end)
      ) {
        ends.push(line[Math.floor(line.length / 2)]!)
        continue
      }
      nodeIds.push(node.id)
      // a one-point line still needs a segment to stroke as a dot
      parts.push(svgPath(line.length === 1 ? [line[0]!, line[0]!] : line))
      for (const p of line) {
        if (!top || p.y < top.y) {
          top = p
        }
      }
    }
    if (!top) {
      continue
    }
    const anchor = ends.length
      ? {
          x: ends.reduce((s, p) => s + p.x, 0) / ends.length,
          y: ends.reduce((s, p) => s + p.y, 0) / ends.length,
        }
      : top
    // A chip goes on the stretch that is the route's own: among the nodes the
    // fewest other routes share, the point farthest from the bubble's ends.
    // Routes through a repeat array share most of their copies, and the far
    // point of a shared copy would put every chip on one loop.
    const sharing = new Map<string, number>()
    for (const route of bubble.routes ?? []) {
      for (const id of new Set(route.steps)) {
        sharing.set(id, (sharing.get(id) ?? 0) + 1)
      }
    }
    const routes: RouteLabel[] = []
    for (const route of bubble.routes ?? []) {
      if (bubble.longestAlleleLength < MIN_CHIPPED_BP) {
        break
      }
      if (route.steps.length === 0) {
        continue
      }
      const rarest = Math.min(...route.steps.map(id => sharing.get(id)!))
      let at: NodeSegment | undefined
      let far = -1
      for (const id of route.steps) {
        if (sharing.get(id) !== rarest) {
          continue
        }
        for (const p of positions[id] ?? []) {
          const d = Math.hypot(p.x - anchor.x, p.y - anchor.y)
          if (d > far) {
            far = d
            at = p
          }
        }
      }
      if (at) {
        routes.push({ route, at, text: routeText(route, walkLabel) })
      }
    }
    halos.push({
      bubble,
      ...classifyBubble(bubble),
      path: parts.join(''),
      top,
      members: nodeIds.length,
      nodeIds,
      whole: nodeIds.length >= WHOLE_FRACTION * graph.nodes.length,
      routes,
    })
  }
  return halos
}

function routeText(route: BubbleRoute, walkLabel: (name: string) => string) {
  const names = [...new Set(route.walks.map(walkLabel))].sort()
  const shown = names.slice(0, NAMED_WALKS).join(', ')
  const more =
    names.length > NAMED_WALKS ? ` +${names.length - NAMED_WALKS}` : ''
  return `${shown}${more} · ${formatBp(route.bp)}`
}
