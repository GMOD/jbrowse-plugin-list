import fs from 'fs'
import path from 'path'

import { tubeMapFrame, tubeMapNodeAt } from './frame'
import { parseGFA } from '../../gfa-core/index'
import { convertGFAToGraph } from '../gfa/gfaConverter'
import { tubeMapLayout, tubeMapReferenceLayout } from '../layout/tubeMapLayout'
import { anchorGraph } from '../pathAnchoring'

const PGGB = fs.readFileSync(
  path.join(__dirname, '../../../test_data/ecoli_pggb_subgraph.gfa'),
  'utf8',
)

function pggb() {
  return anchorGraph(convertGFAToGraph(parseGFA(PGGB)), 'NCTC86#1#chr')
}

const view = {
  scaleX: 2,
  translateX: 10,
  scaleY: 1,
  translateY: 5,
  usableHeight: 10_000,
}

test('own axis: an affine map with the stack starting at translateY', () => {
  const drawing = tubeMapLayout(pggb())!.tubeMap!
  const frame = tubeMapFrame(drawing, view)
  expect(frame.x(100)).toBe(210)
  expect(frame.y(drawing.yOffset)).toBe(5)
  expect(frame.yScale).toBe(1)
})

test('own axis never squeezes, since the view pans in y', () => {
  const drawing = tubeMapLayout(pggb())!.tubeMap!
  expect(tubeMapFrame(drawing, { ...view, usableHeight: 1 }).yScale).toBe(1)
})

test('reference axis squeezes a stack taller than the track', () => {
  const drawing = tubeMapReferenceLayout(pggb())!.tubeMap!
  const { minY, maxY } = drawing.layout.bounds
  const frame = tubeMapFrame(drawing, {
    ...view,
    usableHeight: (maxY - minY) / 4,
  })
  expect(frame.yScale).toBeCloseTo(0.25)
  expect(frame.y(maxY) - frame.y(minY)).toBeCloseTo((maxY - minY) / 4)
})

test('a point inside a box hits its node, and empty space none', () => {
  const drawing = tubeMapLayout(pggb())!.tubeMap!
  const frame = tubeMapFrame(drawing, view)
  const node = Object.values(drawing.layout.nodes).find(n => n.order >= 0)!
  const sx = frame.x(node.x + node.pixelWidth / 2)
  const sy = frame.y(node.y + node.contentHeight / 2)
  expect(tubeMapNodeAt(drawing, frame, sx, sy)).toBe(node.name)
  expect(tubeMapNodeAt(drawing, frame, -1e6, -1e6)).toBeNull()
})
