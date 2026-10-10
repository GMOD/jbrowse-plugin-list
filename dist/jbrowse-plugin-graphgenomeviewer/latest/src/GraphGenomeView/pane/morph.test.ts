import { expect, test } from 'vitest'

import { blendInto, morphStarts, routeStarts } from './morph'

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

test('a node new to the drawing grows out of the neighbour point nearest it', () => {
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

test('the last frame writes the end positions exactly', () => {
  const into = { a: [{ x: 0, y: 0 }] }
  const ends = { a: [{ x: 0.1 + 0.2, y: 1 / 3 }] }
  blendInto(into, { a: [{ x: 7, y: -2 }] }, ends, 1)
  expect(into.a).toEqual(ends.a)
})

test('a deletion route moves with the nodes its ends attach to', () => {
  const starts = routeStarts(
    {
      'a>b': [
        { x: 0, y: 0 },
        { x: 5, y: -5 },
        { x: 10, y: 0 },
      ],
    },
    { a: [{ x: -10, y: 0 }], b: [{ x: 30, y: 0 }] },
    { a: [{ x: 0, y: 0 }], b: [{ x: 10, y: 0 }] },
  )
  expect(starts['a>b']).toEqual([
    { x: -10, y: 0 },
    { x: 10, y: -5 },
    { x: 30, y: 0 },
  ])
})
