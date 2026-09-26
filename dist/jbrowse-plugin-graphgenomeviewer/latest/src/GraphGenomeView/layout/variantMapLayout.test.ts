import { describe, expect, it } from 'vitest'

import { variantMapLayout } from './variantMapLayout'

import type { Graph } from '../types'

const graph: Graph = {
  name: 'g',
  nodes: [
    {
      id: 's1+',
      name: 's1',
      length: 100,
      depth: 1,
      stable: { refName: 'chr', start: 1000, rank: 0 },
    },
    {
      id: 's2+',
      name: 's2',
      length: 50,
      depth: 1,
      stable: { refName: 'chr', start: 1100, rank: 0 },
    },
    {
      id: 's3+',
      name: 's3',
      length: 20,
      depth: 1,
      stable: { refName: 'HG1#1#ctg', start: 5, rank: 1 },
    },
  ],
  edges: [
    { from: 's1+', to: 's2+' },
    { from: 's1+', to: 's3+' },
    { from: 's3+', to: 's2+' },
  ],
}

describe('variantMapLayout', () => {
  it('places only the backbone, at its reference bp on one line', () => {
    const result = variantMapLayout(graph)!
    expect(Object.keys(result.nodePositions)).toEqual(['s1+', 's2+'])
    expect(result.nodePositions['s1+']).toEqual([
      { x: 1000, y: 0 },
      { x: 1100, y: 0 },
    ])
    expect(result.referenceAxis).toBe(true)
    expect(result.pixelRows).toBe(true)
  })

  it('declines a graph with no backbone', () => {
    expect(
      variantMapLayout({
        ...graph,
        nodes: graph.nodes.map(n => ({ ...n, stable: undefined })),
      }),
    ).toBeUndefined()
  })
})
