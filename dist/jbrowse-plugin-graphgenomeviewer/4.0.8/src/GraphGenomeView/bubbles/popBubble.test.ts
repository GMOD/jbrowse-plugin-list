import { describe, expect, it } from 'vitest'

import { bubbleSubgraph } from './popBubble'

import type { Graph } from '../types'

const graph: Graph = {
  name: 'g',
  nodes: ['s1', 's2', 's3', 's4'].map((name, i) => ({
    id: `${name}+`,
    name,
    length: 10,
    depth: 1,
    stable: { refName: 'chr', start: i * 10, rank: i === 2 ? 1 : 0 },
  })),
  edges: [
    { from: 's1+', to: 's2+' },
    { from: 's2+', to: 's3+' },
    { from: 's3+', to: 's4+' },
    { from: 's2+', to: 's4+' },
  ],
  anchoredBy: 'tags',
}

describe('bubbleSubgraph', () => {
  it('keeps the named segments and the links among them', () => {
    const sub = bubbleSubgraph(graph, ['s2', 's3', 's4'])
    expect(sub.nodes.map(n => n.name)).toEqual(['s2', 's3', 's4'])
    expect(sub.edges).toEqual([
      { from: 's2+', to: 's3+' },
      { from: 's3+', to: 's4+' },
      { from: 's2+', to: 's4+' },
    ])
    expect(sub.anchoredBy).toBe('tags')
    expect(sub.paths).toBeUndefined()
  })

  it('keeps each walk to the steps it takes inside the bubble', () => {
    const sub = bubbleSubgraph(
      {
        ...graph,
        paths: [
          { name: 'ref', nodeIds: ['s1+', 's2+', 's3+', 's4+'] },
          { name: 'alt', nodeIds: ['s1+', 's2+', 's4+'] },
          { name: 'elsewhere', nodeIds: ['s1+'] },
        ],
      },
      ['s2', 's3', 's4'],
    )
    expect(sub.paths).toEqual([
      { name: 'ref', nodeIds: ['s2+', 's3+', 's4+'] },
      { name: 'alt', nodeIds: ['s2+', 's4+'] },
    ])
  })

  it('keeps the path origins and visits the walk rows measure from', () => {
    const anchorPaths = [
      { name: 'ref', sample: 'ref', start: 1000, length: 40 },
    ]
    const pathVisits = new Map([
      [
        's1',
        [{ path: 'ref', sample: 'ref', start: 1000, strand: '+' as const }],
      ],
    ])
    const sub = bubbleSubgraph({ ...graph, anchorPaths, pathVisits }, [
      's2',
      's3',
    ])
    expect(sub.anchorPaths).toBe(anchorPaths)
    expect(sub.pathVisits).toBe(pathVisits)
  })
})
