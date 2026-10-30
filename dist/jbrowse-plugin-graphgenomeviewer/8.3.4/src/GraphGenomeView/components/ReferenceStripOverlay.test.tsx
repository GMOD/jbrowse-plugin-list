import { render, screen } from '@testing-library/react'
import { observable, runInAction } from 'mobx'

import ReferenceStripOverlay from './ReferenceStripOverlay'

import type { GraphPaneModel } from '../model'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function mount(state: { paneWidth: number; canvasHeight: number }) {
  vi.stubGlobal('devicePixelRatio', 2)
  const ctx = { setTransform: vi.fn(), clearRect: vi.fn() }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  )
  const model = observable<Record<string, unknown>>({
    referenceStripShown: true,
    referenceStripLit: undefined,
    hostBpFrame: undefined,
    ...state,
  })
  render(<ReferenceStripOverlay model={model as unknown as GraphPaneModel} />)
  const canvas = screen.getByTestId<HTMLCanvasElement>('graph-reference-strip')
  return { model, canvas }
}

test('an overlay canvas keeps under the 8192 px cap the drawing respects', () => {
  const { canvas } = mount({ paneWidth: 800, canvasHeight: 6000 })
  expect(canvas.height).toBe(8192)
  expect(canvas.style.height).toBe('6000px')
})

test('a repaint at the same size keeps the canvas buffer', () => {
  const { model, canvas } = mount({ paneWidth: 800, canvasHeight: 300 })
  expect(canvas.width).toBe(1600)
  const resized = vi.spyOn(canvas, 'width', 'set')
  runInAction(() => {
    model.referenceStripLit = { nodeId: 'n1' }
  })
  expect(resized).not.toHaveBeenCalled()
  runInAction(() => {
    model.paneWidth = 900
  })
  expect(canvas.width).toBe(1800)
})
