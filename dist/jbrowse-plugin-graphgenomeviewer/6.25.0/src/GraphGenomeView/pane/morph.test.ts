import { abgrAlpha, packAbgr } from '@jbrowse/bandage-core/renderer/colorBits'
import { expect, test } from 'vitest'

import { blendInto, fadeEntering, morphStarts, routeStarts } from './morph'

import type { RenderBatch } from '@jbrowse/bandage-core/renderer/types'

const identity = { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 }

test('a shared node starts where the old transform drew it, in the new frame', () => {
  const before = { scaleX: 2, scaleY: 2, translateX: 10, translateY: 0 }
  const after = { scaleX: 4, scaleY: 4, translateX: 0, translateY: 0 }
  const starts = morphStarts(
    {
      a: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
    },
    before,
    {
      a: [
        { x: 50, y: 50 },
        { x: 60, y: 50 },
      ],
    },
    after,
    [],
  )
  // screen x 10 and 30 under the old transform, so 2.5 and 7.5 under the new
  expect(starts.a).toEqual([
    { x: 2.5, y: 0 },
    { x: 7.5, y: 0 },
  ])
})

test('a start has its end point count, spaced along the old polyline', () => {
  const starts = morphStarts(
    {
      a: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
    },
    identity,
    {
      a: [
        { x: 0, y: 5 },
        { x: 1, y: 5 },
        { x: 2, y: 5 },
      ],
    },
    identity,
    [],
  )
  expect(starts.a).toEqual([
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 10, y: 0 },
  ])
})

test('a node new to the drawing grows out of the end of the node it hangs from', () => {
  const starts = morphStarts(
    {
      a: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
    },
    identity,
    {
      a: [
        { x: 100, y: 0 },
        { x: 110, y: 0 },
      ],
      b: [
        { x: 111, y: 5 },
        { x: 115, y: 9 },
      ],
      c: [{ x: 300, y: 300 }],
    },
    identity,
    [{ from: 'a', to: 'b' }],
  )
  expect(starts.b).toEqual([
    { x: 10, y: 0 },
    { x: 10, y: 0 },
  ])
  // nothing reaches c from a shared node, so it starts where it ends
  expect(starts.c).toEqual([{ x: 300, y: 300 }])
})

test('a new node bridging two shared ones starts between where its links attach', () => {
  const starts = morphStarts(
    {
      a: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      d: [
        { x: 100, y: 0 },
        { x: 90, y: 0 },
      ],
    },
    identity,
    {
      a: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      b: [
        { x: 11, y: 0 },
        { x: 12, y: 0 },
      ],
      c: [{ x: 13, y: 0 }],
      d: [
        { x: 15, y: 0 },
        { x: 14, y: 0 },
      ],
    },
    identity,
    [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      // c reaches d's start as d reads reversed, the point drawn at x 90
      { from: 'c', to: 'd', fromStrand: '+', toStrand: '-' },
    ],
  )
  // the chain spreads evenly along a's end at 10 to d's at 90
  expect(starts.b![0]!.x).toBeCloseTo(110 / 3, 0)
  expect(starts.c![0]!.x).toBeCloseTo(190 / 3, 0)
  expect(starts.b![1]).toEqual(starts.b![0])
})

test('a link attaches to the end of a node as the node id reads it', () => {
  const starts = morphStarts(
    {
      '5-': [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    },
    identity,
    {
      '5-': [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      '6+': [{ x: 120, y: 0 }],
    },
    identity,
    // leaves 5- read on its own strand, so from the end drawn at x 100
    [{ from: '5-', to: '6+', fromStrand: '-', toStrand: '+' }],
  )
  expect(starts['6+']).toEqual([{ x: 100, y: 0 }])
})

test('the last frame writes the end positions exactly', () => {
  const into = { a: [{ x: 0, y: 0 }] }
  const ends = { a: [{ x: 0.1 + 0.2, y: 1 / 3 }] }
  blendInto(into, { a: [{ x: 7, y: -2 }] }, ends, 1)
  expect(into.a).toEqual(ends.a)
})

test('a deletion route moves with the nodes its ends attach to', () => {
  const starts = routeStarts(
    {
      0: [
        { x: 0, y: 0 },
        { x: 5, y: -5 },
        { x: 10, y: 0 },
      ],
    },
    [{ from: 'a', to: 'b' }],
    { a: [{ x: -10, y: 0 }], b: [{ x: 30, y: 0 }] },
    { a: [{ x: 0, y: 0 }], b: [{ x: 10, y: 0 }] },
  )
  expect(starts[0]).toEqual([
    { x: -10, y: 0 },
    { x: 10, y: -5 },
    { x: 30, y: 0 },
  ])
})

test('a node a morph brings in fades with every link touching it', () => {
  const ink = packAbgr(10, 20, 30, 255)
  const stroke = () => ({ points: [], thickness: 1, color: ink })
  const curve = () => ({ curves: [], thickness: 1, color: ink })
  const batch: RenderBatch = {
    nodeStrokes: [stroke(), stroke(), stroke()],
    nodeStrokeRuns: new Map([
      ['a', { start: 0, count: 1 }],
      ['b', { start: 1, count: 2 }],
    ]),
    edgeCurves: [curve(), curve()],
    edgeCurveRuns: new Map([
      [0, { start: 0, count: 1 }],
      [1, { start: 1, count: 1 }],
    ]),
    arrows: [{ x: 0, y: 0, angle: 0, length: 1, halfWidth: 1, color: ink }],
    arrowRuns: new Map([[0, { start: 0, count: 1 }]]),
  }
  fadeEntering(
    batch,
    [
      { from: 'a', to: 'b' },
      { from: 'a', to: 'c' },
    ],
    { layout: {}, ids: new Set(['b']), alpha: 0.5 },
  )
  const alphas = (items: { color: number }[]) =>
    items.map(i => abgrAlpha(i.color))
  expect(alphas(batch.nodeStrokes)).toEqual([255, 128, 128])
  expect(alphas(batch.edgeCurves)).toEqual([128, 255])
  expect(alphas(batch.arrows)).toEqual([128])
})
