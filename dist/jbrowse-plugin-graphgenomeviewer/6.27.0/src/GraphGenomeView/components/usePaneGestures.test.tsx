import { act, renderHook } from '@testing-library/react'

import { usePaneGestures } from './usePaneGestures'

import type { GraphPaneModel } from '../model'

function fakeModel(state: Record<string, unknown> = {}) {
  return {
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1,
    layoutResult: undefined,
    nodePositions: undefined,
    referenceStripNodeAt: () => null,
    setSelectedNode: vi.fn(),
    showNodeDetails: vi.fn(),
    closeBubbles: vi.fn(),
    ...state,
  }
}

const at = (x: number, y: number) =>
  ({
    clientX: x,
    clientY: y,
    currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
  }) as unknown as React.PointerEvent

test('a click on empty canvas deselects and leaves open bubbles open', () => {
  const model = fakeModel()
  const { result } = renderHook(() =>
    usePaneGestures(model as unknown as GraphPaneModel),
  )
  result.current.handlers.onClick(at(10, 10))
  expect(model.setSelectedNode).toHaveBeenCalledWith(null)
  expect(model.showNodeDetails).not.toHaveBeenCalled()
  expect(model.closeBubbles).not.toHaveBeenCalled()
})

test('the canvas reads out the gene chip under the pointer, since the chip leaves the pointer to it', () => {
  const frames: FrameRequestCallback[] = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
    frames.push(cb),
  )
  const pin = {
    gene: {
      name: 'LPA',
      refName: 'chr6',
      start: 160_531_482,
      end: 160_664_259,
    },
    covered: 1,
  }
  const model = fakeModel({
    isPanning: false,
    draggingNode: null,
    walkRowBars: undefined,
    overlayLabels: { genes: [{ item: pin, x: 100, y: 30, w: 40 }], routes: [] },
  })
  const { result } = renderHook(() =>
    usePaneGestures(model as unknown as GraphPaneModel),
  )
  const move = (x: number, y: number) => {
    act(() => {
      result.current.handlers.onPointerMove(at(x, y))
      frames.shift()?.(0)
    })
  }
  move(100, 25)
  expect(result.current.hoveredChip).toEqual({
    label: 'LPA',
    readout: 'chr6:160,531,482-160,664,259',
  })
  move(300, 25)
  expect(result.current.hoveredChip).toBeUndefined()
  vi.unstubAllGlobals()
})
