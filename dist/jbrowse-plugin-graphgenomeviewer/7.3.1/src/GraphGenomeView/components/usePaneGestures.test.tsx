import { act, renderHook } from '@testing-library/react'

import { PANS_WITH_DRAWING } from './PaneLayer'
import { easeZoom, usePaneGestures, wheelAction } from './usePaneGestures'

import type { GraphPaneModel } from '../model'

vi.mock('@jbrowse/mobx-state-tree', async importOriginal => ({
  ...(await importOriginal<object>()),
  isAlive: () => true,
}))

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
    overlayLabels: { genes: [{ item: pin, x: 100, y: 30, w: 40 }] },
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

test('a pan frame before any layout does not replay the last hover', () => {
  const frames: FrameRequestCallback[] = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
    frames.push(cb),
  )
  const walkRowAt = vi.fn(() => undefined)
  const setTransform = vi.fn()
  const model = fakeModel({
    isPanning: false,
    draggingNode: null,
    overlayLabels: { genes: [] },
    walkRowBars: { reference: { name: 'ref' }, rows: [] },
    walkRowAt,
    setHoveredWalkRow: vi.fn(),
    scale: 1,
    setTransform,
  })
  const { result } = renderHook(() =>
    usePaneGestures(model as unknown as GraphPaneModel),
  )
  const move = (x: number) => {
    act(() => {
      result.current.handlers.onPointerMove(at(x, 20))
      frames.shift()?.(0)
    })
  }
  move(40)
  expect(walkRowAt).toHaveBeenCalledTimes(1)
  Object.assign(model, { isPanning: true })
  move(60)
  expect(setTransform).toHaveBeenCalledWith(1, 20, 0)
  expect(walkRowAt).toHaveBeenCalledTimes(1)
  vi.unstubAllGlobals()
})

test('a hosted pane that pans itself claims presses from the linear view; one the view places does not', () => {
  const model = fakeModel({ host: {}, hostPlacesX: false })
  const { result, rerender } = renderHook(() =>
    usePaneGestures(model as unknown as GraphPaneModel),
  )
  expect(result.current.surfaceProps).toHaveProperty('data-gesture-owner', '')
  const stopPropagation = vi.fn()
  ;(
    result.current.surfaceProps as { onMouseDown: (e: unknown) => void }
  ).onMouseDown({ stopPropagation })
  expect(stopPropagation).toHaveBeenCalled()

  Object.assign(model, { hostPlacesX: true })
  rerender()
  expect(result.current.surfaceProps).toEqual({})
})

// A pane mid-drag, whose transform moves as the model's would
function panModel() {
  const model: Record<string, unknown> = fakeModel({
    isPanning: false,
    draggingNode: null,
    hostPlacesX: false,
    referenceStripZonePx: 0,
    scale: 1,
    setTransform: vi.fn((scale: number, tx: number, ty: number) => {
      Object.assign(model, { scale, translateX: tx, translateY: ty })
    }),
    zoom: vi.fn(),
    setDraggingNode: vi.fn(),
    setPanning: (on: boolean) => {
      model.isPanning = on
    },
    stopDragging: () => {
      model.isPanning = false
    },
    clearHover: vi.fn(),
  })
  return model
}

function finger(
  pointerId: number,
  x: number,
  pointerType = 'touch',
): React.PointerEvent {
  return {
    clientX: x,
    clientY: 20,
    button: 0,
    pointerId,
    pointerType,
    nativeEvent: { offsetY: 20 },
    currentTarget: canvas,
  } as unknown as React.PointerEvent
}

const canvas = Object.assign(document.createElement('canvas'), {
  setPointerCapture: vi.fn(),
})

function renderGestures(model: Record<string, unknown>) {
  const frames: FrameRequestCallback[] = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
    frames.push(cb),
  )
  const { result } = renderHook(() =>
    usePaneGestures(model as unknown as GraphPaneModel),
  )
  return {
    handlers: result.current.handlers,
    flush: () => {
      frames.shift()?.(0)
    },
  }
}

describe('a drawing the linear view drives', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function drivenModel(node: string | null) {
    const model = panModel()
    Object.assign(model, {
      host: {},
      followsHostView: true,
      translateX: 7,
      referenceStripNodeAt: () => node,
    })
    return model
  }

  test('leaves a press to the view, and pans only the vertical', () => {
    const model = drivenModel(null)
    const { handlers, flush } = renderGestures(model)
    act(() => {
      handlers.onPointerDown(finger(1, 100))
      handlers.onPointerMove({
        ...finger(1, 140),
        clientY: 50,
      })
      flush()
    })
    expect(canvas.hasAttribute('data-gesture-owner')).toBe(false)
    expect(model.setTransform).toHaveBeenCalledWith(1, 7, 30)
  })

  test('keeps a press on a node from the view', () => {
    const model = drivenModel('s1')
    model.setDraggingNode = vi.fn()
    const { handlers } = renderGestures(model)
    act(() => {
      handlers.onPointerDown(finger(1, 100))
    })
    expect(canvas.hasAttribute('data-gesture-owner')).toBe(true)
    expect(model.setDraggingNode).toHaveBeenCalledWith('s1')
  })

  test('claims nothing for the surface, so shift-drag range-selects', () => {
    const { result } = renderHook(() =>
      usePaneGestures(drivenModel(null) as unknown as GraphPaneModel),
    )
    expect(result.current.surfaceProps).toEqual({})
  })
})

describe('more than one pointer', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('a second mouse or pen pointer neither restarts nor ends the pan', () => {
    const model = panModel()
    const { handlers, flush } = renderGestures(model)
    const { onPointerDown, onPointerMove, onPointerUp } = handlers
    act(() => {
      onPointerDown(finger(1, 10, 'mouse'))
      onPointerDown(finger(2, 200, 'pen'))
      onPointerMove(finger(2, 260, 'pen'))
      onPointerUp(finger(2, 260, 'pen'))
      onPointerMove(finger(1, 30, 'mouse'))
      flush()
    })
    expect(model.isPanning).toBe(true)
    expect(model.setTransform).toHaveBeenCalledWith(1, 20, 0)
  })

  test('two fingers pinch about their midpoint, and lifting one pans with the other', () => {
    const model = panModel()
    const { handlers, flush } = renderGestures(model)
    const { onPointerDown, onPointerMove, onPointerUp, onPointerLeave } =
      handlers
    act(() => {
      onPointerDown(finger(1, 100))
      onPointerDown(finger(2, 200))
      onPointerMove(finger(2, 300))
      flush()
    })
    expect(model.zoom).toHaveBeenCalledWith(2, 150, 20)
    expect(model.translateX).toBe(50)

    // a lifted finger leaves the canvas too
    act(() => {
      onPointerUp(finger(2, 300))
      onPointerLeave(finger(2, 300))
      onPointerMove(finger(1, 130))
      flush()
    })
    expect(model.isPanning).toBe(true)
    expect(model.translateX).toBe(80)
  })

  test('a second finger on a node drag does not pinch', () => {
    const model = panModel()
    model.setPanning = vi.fn()
    model.draggingNode = 's1'
    const { handlers } = renderGestures(model)
    act(() => {
      handlers.onPointerDown(finger(1, 100))
      handlers.onPointerDown(finger(2, 200))
    })
    expect(model.zoom).not.toHaveBeenCalled()
  })
})

describe('wheelAction', () => {
  const wheel = (deltaX: number, deltaY: number, mods = {}) => ({
    deltaX,
    deltaY,
    ctrlKey: false,
    metaKey: false,
    ...mods,
  })

  test('a graph view of its own zooms on a plain wheel and pans on a swipe', () => {
    expect(wheelAction(wheel(0, 100), undefined)).toBe('zoom')
    expect(wheelAction(wheel(40, 5), undefined)).toBe('pan')
  })

  test('a track leaves a plain wheel to the page unless scroll-to-zoom is on', () => {
    expect(wheelAction(wheel(0, 100), { scrollZoom: false })).toBe('page')
    expect(wheelAction(wheel(0, 100), {})).toBe('page')
    expect(wheelAction(wheel(0, 100), { scrollZoom: true })).toBe('zoom')
  })

  test('ctrl or ⌘, which is how a trackpad reports a pinch, always zooms', () => {
    expect(wheelAction(wheel(0, 3, { ctrlKey: true }), {})).toBe('zoom')
    expect(wheelAction(wheel(0, 3, { metaKey: true }), {})).toBe('zoom')
  })

  test('a sideways swipe pans a track', () => {
    expect(wheelAction(wheel(40, 5), { scrollZoom: false })).toBe('pan')
    expect(wheelAction(wheel(40, 5), { scrollZoom: true })).toBe('pan')
  })
})

test('the cursor offers a move over a node a press would drag, and not over the strip', () => {
  const frames: FrameRequestCallback[] = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
    frames.push(cb),
  )
  const model = fakeModel({
    isPanning: false,
    draggingNode: null,
    hostPlacesX: false,
    referenceStripZonePx: 30,
    referenceStripNodeAt: () => 's1',
    nodePositions: {},
    graph: {},
    overlayLabels: { genes: [] },
    walkRowBars: undefined,
    setHoveredPanel: vi.fn(),
    setHoveredNode: vi.fn(),
    setHoveredTube: vi.fn(),
    setHoveredEdge: vi.fn(),
    tubeMapPanelAt: () => null,
  })
  const { result } = renderHook(() =>
    usePaneGestures(model as unknown as GraphPaneModel),
  )
  const hoverAt = (y: number) => {
    act(() => {
      result.current.handlers.onPointerMove(at(50, y))
      frames.shift()?.(0)
    })
    return result.current.canvasStyle.cursor
  }
  expect(hoverAt(60)).toBe('move')
  expect(hoverAt(10)).toBe('grab')
  vi.unstubAllGlobals()
})

describe('a press on a bubble label', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function pointer(type: string, x: number) {
    const e = new MouseEvent(type, { clientX: x, clientY: 20 })
    Object.defineProperty(e, 'pointerId', { value: 1 })
    window.dispatchEvent(e)
  }

  function pressLabel() {
    const model = panModel()
    const { result } = renderHook(() =>
      usePaneGestures(model as unknown as GraphPaneModel),
    )
    const layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    layer.setAttribute(PANS_WITH_DRAWING, '')
    const chip = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    layer.append(chip)
    const { onPointerDown, onClickCapture } = result.current.labelHandlers
    onPointerDown({
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 20,
      target: chip,
    } as unknown as React.PointerEvent)
    const click = { stopPropagation: vi.fn() }
    return {
      model,
      click: () => {
        onClickCapture(click as unknown as React.MouseEvent)
        return click.stopPropagation.mock.calls.length === 0
      },
    }
  }

  test('pans the graph once it travels, and its click does not reach the label', () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
      frames.push(cb),
    )
    const { model, click } = pressLabel()
    act(() => {
      pointer('pointermove', 102)
      pointer('pointermove', 140)
      frames.shift()?.(0)
    })
    expect(model.setTransform).toHaveBeenCalledWith(1, 40, 0)
    act(() => {
      pointer('pointerup', 140)
    })
    expect(model.isPanning).toBe(false)
    expect(click()).toBe(false)
  })

  test('that stays put is a click on the label', () => {
    const { model, click } = pressLabel()
    act(() => {
      pointer('pointermove', 102)
      pointer('pointerup', 102)
    })
    expect(model.setTransform).not.toHaveBeenCalled()
    expect(click()).toBe(true)
  })
})

test('a wheel notch eases in over a few frames and lands the whole zoom', () => {
  const owed = Math.log(1.21)
  let left = owed
  const steps: number[] = []
  while (left !== 0 && steps.length < 50) {
    const step = easeZoom(left, 16.7)
    steps.push(step)
    left -= step
  }
  expect(steps.length).toBeGreaterThan(2)
  expect(steps.length).toBeLessThan(10)
  expect(steps.reduce((a, b) => a + b, 0)).toBeCloseTo(owed, 12)
  expect(steps[0]).toBeGreaterThan(steps[1]!)
})
