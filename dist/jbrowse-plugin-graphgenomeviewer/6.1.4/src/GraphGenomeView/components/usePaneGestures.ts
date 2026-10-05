import { useEffect, useRef, useState } from 'react'

import {
  findHoveredEdge,
  findHoveredNode,
} from '@jbrowse/bandage-core/util/hitDetection'
import { wheelZoomFactor } from '@jbrowse/bandage-core/util/wheelZoom'
import { isAlive } from '@jbrowse/mobx-state-tree'

import type { GraphPaneModel } from '../model'

// wheel events need passive:false to call preventDefault — React registers
// wheel listeners as passive, so we must add this imperatively
export function useWheelZoom(
  canvas: HTMLCanvasElement | null | undefined,
  model: GraphPaneModel,
) {
  useEffect(() => {
    if (!canvas) {
      return undefined
    }
    const c = canvas
    function handleWheel(e: WheelEvent) {
      if (model.hostPlacesX) {
        return
      }
      if (model.host) {
        e.stopPropagation()
      }
      e.preventDefault()
      const rect = c.getBoundingClientRect()
      model.zoom(
        wheelZoomFactor(e),
        e.clientX - rect.left,
        e.clientY - rect.top,
      )
    }
    c.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      c.removeEventListener('wheel', handleWheel)
    }
  }, [canvas, model])
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
  const hasMovedRef = useRef(false)
  // A pan and a hover are applied once per frame, not once per mousemove:
  // mousemove fires in bursts well above the frame rate, and each pan step
  // repainted the canvas and re-placed every overlay label, while each hover
  // step ran both hit indexes. The pending pan is the summed delta; the pending
  // hover is the last pointer position, since only the last one can be right.
  const pendingRef = useRef<{
    frame: number
    pan: { dx: number; dy: number } | null
    hover: { x: number; y: number } | null
  }>({ frame: 0, pan: null, hover: null })
  useEffect(
    () => () => {
      cancelAnimationFrame(pendingRef.current.frame)
    },
    [],
  )
  const [contextNode, setContextNode] = useState<
    { nodeId: string; top: number; left: number } | undefined
  >(undefined)
  const [contextRow, setContextRow] = useState<
    { row: number; top: number; left: number } | undefined
  >(undefined)

  function screenToGraph(screenX: number, screenY: number) {
    return {
      x: (screenX - model.translateX) / model.scaleX,
      y: (screenY - model.translateY) / model.scaleY,
    }
  }

  function getMouseCoord(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect()
    return screenToGraph(e.clientX - rect.left, e.clientY - rect.top)
  }

  // The node at a graph coordinate, which mousedown, mousemove and click all
  // need. Takes the coordinate rather than the event so a caller that already
  // has one does not pay for a second getBoundingClientRect.
  function nodeAt(x: number, y: number) {
    const { nodePositions } = model
    const sx = x * model.scaleX + model.translateX
    const sy = y * model.scaleY + model.translateY
    if (model.layoutResult?.tubeMap) {
      return model.tubeMapNodeAt(sx, sy)
    }
    const onStrip = model.referenceStripNodeAt(sx, sy)
    if (onStrip) {
      return onStrip
    }
    return nodePositions
      ? findHoveredNode(
          nodePositions,
          x,
          y,
          model.axisScale,
          model.positionsVersion,
          model.nodeInk,
        )
      : null
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button === 0) {
      hasMovedRef.current = false
      if (model.hostPlacesX) {
        return
      }
      if (model.host) {
        e.stopPropagation()
      }
      const { x, y } = getMouseCoord(e)
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
  }

  function applyPending() {
    const pending = pendingRef.current
    pending.frame = 0
    if (pending.pan) {
      model.setTransform(
        model.scale,
        model.translateX + pending.pan.dx,
        model.translateY + pending.pan.dy,
      )
      pending.pan = null
    }
    const bars = model.walkRowBars
    if (pending.hover && bars) {
      const i = model.walkRowAt(pending.hover.x, pending.hover.y)
      model.setHoveredWalkRow(
        i === undefined ? null : [bars.reference, ...bars.rows][i]!.name,
      )
    }
    if (pending.hover && model.nodePositions && model.graph) {
      const { x, y } = screenToGraph(pending.hover.x, pending.hover.y)
      pending.hover = null
      const node = nodeAt(x, y)
      model.setHoveredNode(node)
      model.setHoveredEdge(
        node || model.layoutResult?.tubeMap
          ? null
          : findHoveredEdge(
              model.nodePositions,
              model.graph,
              x,
              y,
              model.axisScale,
              // resolved, so the hit index bounds the ribbons that are
              // actually drawn — see effectiveDrawPaths. Facet panels draw
              // none.
              model.effectiveDrawPaths && !model.facetPanels,
              model.positionsVersion,
              model.deletionEdgeIndexes,
              model.hiddenEdgeIndexes,
              model.deletionRoutes,
              model.layoutResult?.stranded,
            ),
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
  }

  function onMouseMove(e: React.MouseEvent) {
    const dx = e.clientX - lastMouseRef.current.x
    const dy = e.clientY - lastMouseRef.current.y
    lastMouseRef.current = { x: e.clientX, y: e.clientY }

    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
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

  function onMouseUp() {
    model.stopDragging()
  }

  // also fired by the canvas unmounting under a resting pointer, after the
  // view closing it has destroyed the model
  function onMouseLeave() {
    dropPending()
    if (!isAlive(model)) {
      return
    }
    model.stopDragging()
    model.setHoveredNode(null)
    model.setHoveredEdge(null)
    model.setHoveredWalkRow(null)
  }

  // Right-clicking a node is the gesture that asks "where is this?", and until
  // now the graph had no answer: a node named an assembly and an offset in its
  // tags that nothing surfaced. The items come from the model's launch targets,
  // so what is offered is what can actually be opened.
  function onContextMenu(e: React.MouseEvent) {
    const { x, y } = getMouseCoord(e)
    const node = nodeAt(x, y)
    if (node) {
      e.preventDefault()
      setContextNode({ nodeId: node, top: e.clientY, left: e.clientX })
      return
    }
    const row = model.walkRowAt(
      x * model.scaleX + model.translateX,
      y * model.scaleY + model.translateY,
    )
    if (row !== undefined) {
      e.preventDefault()
      setContextRow({ row, top: e.clientY, left: e.clientX })
    }
  }

  function onClick(e: React.MouseEvent) {
    // a click that ended a drag selects nothing
    if (!hasMovedRef.current) {
      const { x, y } = getMouseCoord(e)
      const node = nodeAt(x, y)
      model.setSelectedNode(node)
      if (node) {
        model.showNodeDetails(node)
      }
    }
  }

  return {
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onClick,
      onContextMenu,
    },
    contextNode,
    contextRow,
    closeContextMenu: () => {
      setContextNode(undefined)
      setContextRow(undefined)
    },
  }
}

export type PaneHandlers = ReturnType<typeof usePaneGestures>['handlers']
