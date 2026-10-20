import { types } from '@jbrowse/mobx-state-tree'
import { act, render } from '@testing-library/react'

import { Legends } from './GraphCanvas'

import type { GraphPaneModel } from '../model'

vi.mock('./Legend', () => ({ LegendPanel: () => null }))

const Pane = types
  .model({
    hoveredNode: types.maybeNull(types.string),
    hoveredRowWalks: types.array(types.string),
    legendSize: types.frozen({ width: 0, height: 0 }),
  })
  .views(self => ({
    get legendAtRest() {
      return self.hoveredNode === null && self.hoveredRowWalks.length === 0
    },
    get referenceStripZonePx() {
      return 0
    },
  }))
  .actions(self => ({
    setLegendSize(size: { width: number; height: number }) {
      self.legendSize = size
    },
    setHoveredNode(id: string | null) {
      self.hoveredNode = id
    },
    setHoveredRowWalks(walks: string[]) {
      self.hoveredRowWalks.replace(walks)
    },
  }))

let size = { width: 0, height: 0 }
let resized = () => {}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
    () => size.width,
  )
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
    () => size.height,
  )
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resized = callback
      }
      observe() {}
      disconnect() {
        resized = () => {}
      }
    },
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function shown() {
  size = { width: 120, height: 40 }
  const model = Pane.create({})
  render(<Legends model={model as unknown as GraphPaneModel} />)
  act(() => {
    resized()
  })
  return model
}

function resize(width: number, height: number) {
  size = { width, height }
  act(() => {
    resized()
  })
}

test('a lane-row hover leaves the measured legend as it was', () => {
  const model = shown()
  expect(model.legendSize).toEqual({ width: 120, height: 40 })
  act(() => {
    model.setHoveredRowWalks(['HG00097#1'])
  })
  resize(120, 72)
  expect(model.legendSize).toEqual({ width: 120, height: 40 })
  act(() => {
    model.setHoveredRowWalks([])
  })
  resize(120, 40)
  expect(model.legendSize).toEqual({ width: 120, height: 40 })
})

test('a legend that grows during a node hover is measured when the hover ends', () => {
  const model = shown()
  act(() => {
    model.setHoveredNode('1+')
  })
  resize(120, 90)
  expect(model.legendSize).toEqual({ width: 120, height: 40 })
  act(() => {
    model.setHoveredNode(null)
  })
  expect(model.legendSize).toEqual({ width: 120, height: 90 })
})
