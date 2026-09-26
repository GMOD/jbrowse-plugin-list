import { pathOrigin } from './pathAnchoring'

import type { Graph } from './types'

// One walk lifted out of the drawing: the nodes it visits and the links it
// takes, so the geometry can fade everything else, plus what it carries
// through the window against the reference walk.
export interface WalkHighlight {
  name: string
  nodeIds: Set<string>
  edgeIndexes: Set<number>
  steps: number
  bp: number
  referenceBp?: number
}

export function walkHighlight(
  graph: Graph,
  name: string,
): WalkHighlight | undefined {
  const path = graph.paths?.find(p => p.name === name)
  if (!path) {
    return undefined
  }
  const byId = new Map(graph.nodes.map(n => [n.id, n]))
  const edgeAt = new Map<string, number>()
  graph.edges.forEach((e, i) => {
    edgeAt.set(`${e.from}>${e.to}`, i)
  })
  const nodeIds = new Set(path.nodeIds)
  const edgeIndexes = new Set<number>()
  for (let i = 1; i < path.nodeIds.length; i++) {
    const a = path.nodeIds[i - 1]!
    const b = path.nodeIds[i]!
    const index = edgeAt.get(`${a}>${b}`) ?? edgeAt.get(`${b}>${a}`)
    if (index !== undefined) {
      edgeIndexes.add(index)
    }
  }
  const bpOf = (ids: string[]) =>
    ids.reduce((sum, id) => sum + (byId.get(id)?.length ?? 0), 0)
  // `referencePath` is the anchor name, which pathOrigin has stripped of the
  // range suffix odgi leaves on a P record's name
  const reference = graph.referencePath
    ? graph.paths!.find(p => pathOrigin(p.name).name === graph.referencePath)
    : undefined
  return {
    name,
    nodeIds,
    edgeIndexes,
    steps: path.nodeIds.length,
    bp: bpOf(path.nodeIds),
    referenceBp:
      reference && reference !== path ? bpOf(reference.nodeIds) : undefined,
  }
}
