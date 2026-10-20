import { expect, test } from 'vitest'

import { nearestInFront, placeLabels } from './labelLayout'

const bounds = { width: 800, height: 600 }
const box = { width: 40, height: 20 }

function overlap(
  a: { boxX: number; boxY: number },
  b: { boxX: number; boxY: number },
) {
  return (
    a.boxX < b.boxX + box.width &&
    b.boxX < a.boxX + box.width &&
    a.boxY < b.boxY + box.height &&
    b.boxY < a.boxY + box.height
  )
}

test('a lone label leans up and right on the shortest leader', () => {
  const [placed] = placeLabels([{ x: 400, y: 300, ...box }], bounds)
  expect(placed).toEqual({ leaderX: 428, leaderY: 272, boxX: 428, boxY: 252 })
})

// KRAS G12 and G13 project a few pixels apart
test('labels of neighbouring residues take boxes that do not overlap', () => {
  const placed = placeLabels(
    [
      { x: 400, y: 300, ...box },
      { x: 406, y: 296, ...box },
      { x: 398, y: 306, ...box },
    ],
    bounds,
  )
  expect(overlap(placed[0]!, placed[1]!)).toBe(false)
  expect(overlap(placed[0]!, placed[2]!)).toBe(false)
  expect(overlap(placed[1]!, placed[2]!)).toBe(false)
})

test('a residue at the top-right corner puts its label inside the view', () => {
  const [placed] = placeLabels([{ x: 790, y: 10, ...box }], bounds)
  expect(placed!.boxX + box.width).toBeLessThanOrEqual(bounds.width)
  expect(placed!.boxY).toBeGreaterThanOrEqual(0)
})

test("no label box covers another residue's dot", () => {
  const placed = placeLabels(
    [
      { x: 400, y: 300, ...box },
      { x: 440, y: 270, ...box },
    ],
    bounds,
  )
  const { boxX, boxY } = placed[0]!
  const coversSecondDot =
    boxX < 445 &&
    boxX + box.width > 435 &&
    boxY < 275 &&
    boxY + box.height > 265
  expect(coversSecondDot).toBe(false)
})

// haemoglobin's four β chains each carry Val6; the label goes on the one in
// front
test('the nearest copy in front of the camera takes the label', () => {
  const copies = [
    { chain: 'B', depth: 0.6 },
    { chain: 'D', depth: 0.4 },
    { chain: 'F', depth: -0.2 },
    { chain: 'H', depth: 1.3 },
  ]
  expect(nearestInFront(copies)?.chain).toBe('D')
  expect(nearestInFront([{ chain: 'F', depth: -0.2 }])).toBeUndefined()
})
