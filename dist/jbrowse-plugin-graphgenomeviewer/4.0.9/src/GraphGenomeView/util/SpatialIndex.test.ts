import { SpatialIndex } from './SpatialIndex'

const positions = {
  'A+': [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
  'B+': [
    { x: 200, y: 200 },
    { x: 300, y: 200 },
  ],
  'C+': [
    { x: 0, y: 0 },
    { x: 0, y: 100 },
  ],
}

test('finds nearby segments', () => {
  const index = new SpatialIndex(positions, 50)
  const results = index.query(50, 0, 10)
  const nodeIds = results.map(r => r.nodeId)
  expect(nodeIds).toContain('A+')
  expect(nodeIds).not.toContain('B+')
})

test('finds nothing when far from all segments', () => {
  const index = new SpatialIndex(positions, 50)
  const results = index.query(500, 500, 10)
  expect(results).toHaveLength(0)
})

test('finds segments near intersection', () => {
  const index = new SpatialIndex(positions, 50)
  const results = index.query(0, 0, 10)
  const nodeIds = new Set(results.map(r => r.nodeId))
  expect(nodeIds.has('A+')).toBe(true)
  expect(nodeIds.has('C+')).toBe(true)
})

test('larger radius finds more candidates', () => {
  const index = new SpatialIndex(positions, 50)
  const small = index.query(150, 100, 10)
  const large = index.query(150, 100, 200)
  expect(large.length).toBeGreaterThanOrEqual(small.length)
})

test('deduplicates entries across cells', () => {
  const index = new SpatialIndex(positions, 10)
  const results = index.query(50, 0, 20)
  const keys = results.map(r => `${r.nodeId}:${r.segmentIdx}`)
  const unique = new Set(keys)
  expect(keys.length).toBe(unique.size)
})

// A row layout puts bp on x and a 20 px row pitch on y, so one cell size taken
// from the two summed is the x size, and applied to y it swallows every row into
// one cell: the grid stops discriminating on y and each query hands the distance
// loop every row in the band. HPRC's rGFA is exactly this shape, at ~7 kb a
// segment.
test('a row layout is bucketed on both axes, not just on x', () => {
  const rows: Record<string, { x: number; y: number }[]> = {}
  for (let row = 0; row < 20; row++) {
    rows[`r${row}`] = [
      { x: 0, y: row * 20 },
      { x: 7000, y: row * 20 },
    ]
  }
  const index = new SpatialIndex(rows)

  // 5 screen px of slack on y, which is a quarter of a row
  const hits = index.query(3500, 0, 7000 * 0.001, 5)
  expect(hits.map(h => h.nodeId)).toEqual(['r0'])
})
