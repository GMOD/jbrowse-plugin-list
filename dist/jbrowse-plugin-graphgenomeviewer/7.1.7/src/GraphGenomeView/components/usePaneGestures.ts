import { useEffect, useRef, useState } from 'react'

import {
  findHoveredEdge,
  findHoveredNode,
} from '@jbrowse/bandage-core/util/hitDetection'
import { wheelZoomFactor } from '@jbrowse/bandage-core/util/wheelZoom'
import { screenToLayout } from '@jbrowse/bandage-core/viewport'
import { isAlive } from '@jbrowse/mobx-state-tree'

import { chipReadoutAt } from './LabelLayer'

import type { PaneContextAt } from './PaneContextMenu'
import type { GraphPaneModel } from '../model'

const WHEEL_LINE_PX = 40

// A trackpad pinch trails a little sideways scroll that would pan the drawing
// out from under it; core's linear view ignores deltaX this long after a zoom.
const ZOOM_ACTIVE_MS = 100

// What a wheel does over a pane that draws its own coordinates. Inside a linear
// view it follows the view's rules: ctrl/⌘+wheel (a trackpad pinch) zooms, a
// plain vertical wheel zooms only with the session's scroll-to-zoom on and
// otherwise scrolls the page, and a sideways swipe pans. A graph view of its
// own zooms on a plain wheel.
export function wheelAction(
  e: Pick<WheelEvent, 'deltaX' | 'deltaY' | 'ctrlKey' | 'metaKey'>,
  host: { scrollZoom?: boolean } | undefined,
) {
  const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY)
  if (e.ctrlKey || e.metaKey || (!sideways && (!host || host.scrollZoom))) {
    return 'zoom'
  }
  return sideways ? 'pan' : 'page'
}

// Bound on the whole canvas area, so a wheel over a label, pin or legend acts
// as it does over the drawing. Imperative, because React registers wheel
// listeners as passive and this one has to preventDefault.
export function useWheelZoom(
  area: HTMLElement | null,
  canvas: HTMLCanvasElement | null | undefined,
  model: GraphPaneModel,
) {
  useEffect(() => {
    if (!area) {
      return undefined
    }
    let lastZoom = -Infinity
    const handleWheel = (e: WheelEvent) => {
      if (model.hostPlacesX) {
        return
      }
      const action = wheelAction(e, model.host)
      if (action === 'page') {
        return
      }
      if (model.host) {
        e.stopPropagation()
      }
      e.preventDefault()
      if (action === 'pan') {
        if (e.timeStamp - lastZoom > ZOOM_ACTIVE_MS) {
          const px = e.deltaMode === 1 ? WHEEL_LINE_PX : 1
          model.setTransform(
            model.scale,
            model.translateX - e.deltaX * px,
            model.translateY,
          )
        }
        return
      }
      lastZoom = e.timeStamp
      const under =
        e.target instanceof Element ? e.target.closest('canvas') : null
      const origin = under ?? (model.facetPanels ? null : canvas)
      if (!origin) {
        return
      }
      const rect = origin.getBoundingClientRect()
      model.zoom(
        wheelZoomFactor(e),
        e.clientX - rect.left,
        e.clientY - rect.top,
      )
    }
    area.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      area.removeEventListener('wheel', handleWheel)
    }
  }, [area, canvas, model])
}

const CLICK_SLOP_PX = 3

interface Point {
  x: number
  y: number
}

const pointOf = (e: { clientX: number; clientY: number }): Point => ({
  x: e.clientX,
  y: e.clientY,
})

function pinchOf(points: Map<number, Point>) {
  const [a, b] = [...points.values()] as [Point, Point]
  return {
    spread: Math.hypot(a.x - b.x, a.y - b.y),
    mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
  }
}

// The pointer on a canvas drawing the pane's transform: the pane's own, or any
// facet panel, since the panels share it. Coordinates are read against the
// canvas the event is on.
export function usePaneGestures(model: GraphPaneModel) {
  // Where the pointer was last, and whether it has travelled since mousedown —
  // per-gesture scratch that nothing renders from, which is what a ref is for.
  // Whether a drag is in progress is model state (`isPanning`/`draggingNode`),
  // because the cursor renders from it.
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const downRef = useRef({ x: 0, y: 0 })
  const hasMovedRef = useRef(false)
  // The pointer driving a drag, so a stray second one neither restarts nor
  // ends it. A second finger on a pan pinches instead: `points` holds the
  // captured fingers, and `pinch` the spread and midpoint the drawing last
  // zoomed from, measured against the canvas the pan started on.
  const dragPointerRef = useRef<number | undefined>(undefined)
  const isOtherPointer = (e: React.PointerEvent) =>
    dragPointerRef.current !== undefined &&
    e.pointerId !== dragPointerRef.current
  const pointsRef = useRef(new Map<number, Point>())
  const dragCanvasRef = useRef<Element | null>(null)
  const pinchRef = useRef<ReturnType<typeof pinchOf> | null>(null)
  // A pan and a hover are applied once per frame, not once per mousemove:
  // mousemove fires in bursts well above the frame rate, and each pan step
  // repainted the canvas and re-placed every overlay label, while each hover
  // step ran both hit indexes. The pending pan is the summed delta; the pending
  // hover is the last pointer position, since only the last one can be right.
  const pendingRef = useRef<{
    frame: number
    pan: { dx: number; dy: number } | null
    hover: { x: number; y: number } | null
    pinch: boolean
  }>({ frame: 0, pan: null, hover: null, pinch: false })
  useEffect(
    () => () => {
      cancelAnimationFrame(pendingRef.current.frame)
    },
    [],
  )
  const [contextMenu, setContextMenu] = useState<PaneContextAt>()
  // whether a press here would drag a node, for the cursor; state rather than
  // a read of `hoveredAt`, which changes on every move over a node
  const [overDraggable, setOverDraggable] = useState(false)
  const [hoveredChip, setHoveredChip] =
    useState<ReturnType<typeof chipReadoutAt>>(undefined)

  // the event's point in pane px, against the canvas it is on
  function pointerAt(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  // The node at a pane point, which mousedown, mousemove and click all need.
  // Takes the point rather than the event so a caller that already has one
  // does not pay for a second getBoundingClientRect.
  function nodeAt(sx: number, sy: number) {
    if (model.layoutResult?.tubeMap) {
      return model.tubeMapNodeAt(sx, sy)
    }
    const onStrip = model.referenceStripNodeAt(sx, sy)
    if (onStrip) {
      return onStrip
    }
    const { nodePositions } = model
    if (!nodePositions) {
      return null
    }
    const { x, y } = screenToLayout(sx, sy, model, model.axisScale)
    return findHoveredNode(
      nodePositions,
      x,
      y,
      model.axisScale,
      model.positionsVersion,
      model.nodeInk,
    )
  }

  function edgeAt(sx: number, sy: number) {
    const { nodePositions, graph } = model
    if (!nodePositions || !graph) {
      return null
    }
    const { x, y } = screenToLayout(sx, sy, model, model.axisScale)
    return findHoveredEdge(
      nodePositions,
      graph,
      x,
      y,
      model.axisScale,
      // resolved, so the hit index bounds the ribbons that are actually
      // drawn — see effectiveDrawPaths. Facet panels draw none.
      model.effectiveDrawPaths && !model.facetPanels,
      model.positionsVersion,
      model.deletionEdgeIndexes,
      model.hiddenEdgeIndexes,
      model.deletionRoutes,
      model.layoutResult?.stranded,
    )
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button === 0) {
      e.preventDefault()
    }
  }

  // Captured, so a drag keeps going over a bubble chip or the gap between
  // facet panels, and a finger drags as a mouse does
  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) {
      return
    }
    const points = pointsRef.current
    if (isOtherPointer(e)) {
      if (model.isPanning && e.pointerType === 'touch' && points.size === 1) {
        e.currentTarget.setPointerCapture(e.pointerId)
        points.set(e.pointerId, pointOf(e))
        pinchRef.current = pinchOf(points)
        hasMovedRef.current = true
      }
      return
    }
    hasMovedRef.current = false
    downRef.current = { x: e.clientX, y: e.clientY }
    if (model.hostPlacesX) {
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    dragPointerRef.current = e.pointerId
    dragCanvasRef.current = e.currentTarget
    points.clear()
    points.set(e.pointerId, pointOf(e))
    const { x, y } = pointerAt(e)
    // a tube map's boxes are the layout's, and the strip's are bp, not
    // positions to drag
    const node =
      model.layoutResult?.tubeMap ||
      e.nativeEvent.offsetY < model.referenceStripZonePx
        ? null
        : nodeAt(x, y)
    if (node) {
      model.setDraggingNode(node)
    } else {
      model.setPanning(true)
    }
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
  }

  // zooms about where the fingers' midpoint was and pans by how far it moved
  function pinchStep() {
    const was = pinchRef.current
    const canvas = dragCanvasRef.current
    if (!was || !canvas) {
      return
    }
    const now = pinchOf(pointsRef.current)
    const rect = canvas.getBoundingClientRect()
    if (was.spread > 0 && now.spread > 0) {
      model.zoom(
        now.spread / was.spread,
        was.mid.x - rect.left,
        was.mid.y - rect.top,
      )
    }
    model.setTransform(
      model.scale,
      model.translateX + now.mid.x - was.mid.x,
      model.translateY + now.mid.y - was.mid.y,
    )
    pinchRef.current = now
  }

  function applyPending() {
    const pending = pendingRef.current
    const { pan, hover, pinch } = pending
    pending.frame = 0
    pending.pan = null
    pending.hover = null
    pending.pinch = false
    if (pinch) {
      pinchStep()
    }
    if (pan) {
      model.setTransform(
        model.scale,
        model.translateX + pan.dx,
        model.translateY + pan.dy,
      )
    }
    if (!hover) {
      return
    }
    const { x: sx, y: sy } = hover
    const chip = model.facetPanels
      ? undefined
      : chipReadoutAt(model.overlayLabels, sx, sy)
    setHoveredChip(was =>
      was?.label === chip?.label && was?.readout === chip?.readout ? was : chip,
    )
    const bars = model.walkRowBars
    if (bars) {
      const i = model.walkRowAt(sx, sy)
      model.setHoveredWalkRow(
        i === undefined ? null : [bars.reference, ...bars.rows][i]!.name,
      )
    }
    if (model.nodePositions && model.graph) {
      const node = nodeAt(sx, sy)
      model.setHoveredPanel(model.tubeMapPanelAt(sy))
      model.setHoveredNode(node, { x: sx, y: sy })
      setOverDraggable(
        node !== null &&
          !model.hostPlacesX &&
          !model.layoutResult?.tubeMap &&
          sy >= model.referenceStripZonePx,
      )
      model.setHoveredTube(
        node === null && model.layoutResult?.tubeMap
          ? model.tubeAt(sx, sy)
          : null,
      )
      model.setHoveredEdge(
        node || model.layoutResult?.tubeMap || !model.hoverLightsEverything
          ? null
          : edgeAt(sx, sy),
      )
    }
  }

  function scheduleFrame() {
    if (!pendingRef.current.frame) {
      pendingRef.current.frame = requestAnimationFrame(applyPending)
    }
  }

  function dropPending() {
    const pending = pendingRef.current
    cancelAnimationFrame(pending.frame)
    pending.frame = 0
    pending.pan = null
    pending.hover = null
    pending.pinch = false
  }

  function onPointerMove(e: React.PointerEvent) {
    const points = pointsRef.current
    if (pinchRef.current && points.has(e.pointerId)) {
      points.set(e.pointerId, pointOf(e))
      pendingRef.current.pinch = true
      scheduleFrame()
      return
    }
    if (isOtherPointer(e)) {
      return
    }
    const dx = e.clientX - lastMouseRef.current.x
    const dy = e.clientY - lastMouseRef.current.y
    lastMouseRef.current = { x: e.clientX, y: e.clientY }

    // from where the button went down, not per event: a slow drag moves a
    // pixel at a time
    if (
      Math.hypot(e.clientX - downRef.current.x, e.clientY - downRef.current.y) >
      CLICK_SLOP_PX
    ) {
      hasMovedRef.current = true
    }

    const pending = pendingRef.current
    if (model.draggingNode) {
      model.moveNode(model.draggingNode, dx / model.scaleX, dy / model.scaleY)
    } else if (model.isPanning) {
      pending.pan = {
        dx: (pending.pan?.dx ?? 0) + dx,
        dy: (pending.pan?.dy ?? 0) + dy,
      }
      scheduleFrame()
    } else {
      const rect = (
        e.currentTarget as HTMLCanvasElement
      ).getBoundingClientRect()
      pending.hover = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      scheduleFrame()
    }
  }

  // also the end of a capture the browser took back
  function onPointerUp(e: React.PointerEvent) {
    const points = pointsRef.current
    if (pinchRef.current && points.has(e.pointerId)) {
      if (pendingRef.current.pinch) {
        pendingRef.current.pinch = false
        pinchStep()
      }
      points.delete(e.pointerId)
      pinchRef.current = null
      const [[id, at]] = [...points] as [[number, Point]]
      dragPointerRef.current = id
      lastMouseRef.current = at
      return
    }
    if (isOtherPointer(e)) {
      return
    }
    dragPointerRef.current = undefined
    points.clear()
    if (isAlive(model)) {
      model.stopDragging()
    }
  }

  // also fired by the canvas unmounting under a resting pointer, after the
  // view closing it has destroyed the model, and by a finger lifting
  function onPointerLeave(e: React.PointerEvent) {
    if (isOtherPointer(e)) {
      return
    }
    dragPointerRef.current = undefined
    pointsRef.current.clear()
    pinchRef.current = null
    dropPending()
    setHoveredChip(undefined)
    setOverDraggable(false)
    if (!isAlive(model)) {
      return
    }
    model.stopDragging()
    model.clearHover()
  }

  // Right-clicking a node is the gesture that asks "where is this?", and until
  // now the graph had no answer: a node named an assembly and an offset in its
  // tags that nothing surfaced. The items come from the model's launch targets,
  // so what is offered is what can actually be opened.
  function onContextMenu(e: React.MouseEvent) {
    const { x, y } = pointerAt(e)
    const node = nodeAt(x, y)
    const { clientX, clientY } = e
    if (node) {
      e.preventDefault()
      setContextMenu({ clientX, clientY, nodeId: node })
      return
    }
    const row = model.walkRowAt(x, y)
    if (row !== undefined) {
      e.preventDefault()
      setContextMenu({ clientX, clientY, row })
    }
  }

  function onClick(e: React.MouseEvent) {
    // a click that ended a drag selects nothing
    if (!hasMovedRef.current) {
      const { x, y } = pointerAt(e)
      const node = nodeAt(x, y)
      model.setSelectedNode(node)
      if (node) {
        model.showNodeDetails(node)
      }
    }
  }

  const canvasStyle: React.CSSProperties = {
    cursor:
      model.isPanning || model.draggingNode
        ? 'grabbing'
        : overDraggable
          ? 'move'
          : 'grab',
    // a pane the linear view drags leaves a finger its scroll
    touchAction: model.hostPlacesX ? 'auto' : 'none',
    overscrollBehavior: 'contain',
  }

  // A hosted pane that pans itself claims every press on its surface, labels
  // and strip included: the linear view's pan starts on pointerdown and skips
  // `[data-gesture-owner]`, and its shift-drag range select starts on
  // mousedown.
  const claimsPress = model.host !== undefined && !model.hostPlacesX
  const surfaceProps = claimsPress
    ? {
        'data-gesture-owner': '',
        onMouseDown: (e: React.MouseEvent) => {
          e.stopPropagation()
        },
      }
    : {}

  return {
    canvasStyle,
    surfaceProps,
    handlers: {
      onMouseDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onLostPointerCapture: onPointerUp,
      onPointerLeave,
      onClick,
      onContextMenu,
    },
    contextMenu,
    hoveredChip,
    closeContextMenu: () => {
      setContextMenu(undefined)
    },
  }
}

export type PaneHandlers = ReturnType<typeof usePaneGestures>['handlers']
