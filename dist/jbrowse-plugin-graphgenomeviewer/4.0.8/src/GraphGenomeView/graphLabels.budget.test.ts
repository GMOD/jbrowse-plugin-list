import { graphLabels } from './graphLabels'

// Forty long nodes on a small pane, none overlapping: every one fits a label,
// and the pane's area rations how many are written.
const nodePositions: Record<string, { x: number; y: number }[]> = {}
const nodeLengths = new Map<string, number>()
for (let i = 0; i < 40; i++) {
  const y = 10 + (i % 10) * 28
  const x = 10 + Math.floor(i / 10) * 120
  nodePositions[`n${i}`] = [
    { x, y },
    { x: x + 100, y },
  ]
  nodeLengths.set(`n${i}`, 1000 + i)
}

function labelsOn(width: number, height: number) {
  return graphLabels({
    nodePositions,
    nodeLengths,
    deletions: [],
    axis: { scaleX: 1, scaleY: 1 },
    translateX: 0,
    translateY: 0,
    width,
    height,
  }).filter(l => l.kind === 'node')
}

test('node labels are rationed to the pane, biggest sequence first', () => {
  const small = labelsOn(500, 300)
  expect(small).toHaveLength(8)
  expect(small.map(l => l.key)).toContain('node:n39')
  expect(small.map(l => l.key)).not.toContain('node:n0')
  expect(labelsOn(2000, 1600).length).toBeGreaterThan(small.length)
})
