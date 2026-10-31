import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { syncCanvasSize } from '@jbrowse/bandage-core/renderer/canvas'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'

import { dependOn } from '../pane/paneBase'
import { trackedDpr } from '../trackedDpr'

import type { GraphPaneModel } from '../model'

// marks an overlay whose labels move with the drawing, so a press on one pans
export const PANS_WITH_DRAWING = 'data-pans-with-drawing'

// A layer over the pane's canvas that leaves the pointer to it
export function paneLayerStyle(
  zIndex: number,
  overflow?: 'hidden' | 'visible',
) {
  return {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    pointerEvents: 'none' as const,
    overflow,
    zIndex,
  }
}

// An SVG the pane's size, over the canvas or inside PaneSvg's export
export const PaneSvgLayer = observer(function PaneSvgLayer({
  model,
  zIndex,
  overflow = 'hidden',
  testId,
  pansWithDrawing,
  children,
}: {
  model: GraphPaneModel
  zIndex: number
  overflow?: 'hidden' | 'visible'
  testId?: string
  pansWithDrawing?: boolean
  children: ReactNode
}) {
  return (
    <svg
      style={{
        ...paneLayerStyle(zIndex, overflow),
        userSelect: pansWithDrawing ? 'none' : undefined,
      }}
      width={model.paneWidth}
      height={model.canvasHeight}
      data-testid={testId}
      {...(pansWithDrawing ? { [PANS_WITH_DRAWING]: '' } : {})}
    >
      {children}
    </svg>
  )
})

// Layout units onto the screen. Its own observer, so a pan frame re-renders
// this group's transform and not the children a parent built.
export const PaneTransformGroup = observer(function PaneTransformGroup({
  model,
  children,
}: {
  model: GraphPaneModel
  children: ReactNode
}) {
  const { scaleX, scaleY, translateX, translateY } = model
  return (
    <g
      transform={`translate(${translateX} ${translateY}) scale(${scaleX} ${scaleY})`}
    >
      {children}
    </g>
  )
})

// A canvas the pane's size that an autorun repaints, so a pan moves its ink in
// the same frame as the drawing. `paint` draws in css px.
export const PaneOverlayCanvas = observer(function PaneOverlayCanvas({
  model,
  zIndex,
  shown = true,
  testId,
  paint,
}: {
  model: GraphPaneModel
  zIndex: number
  shown?: boolean
  testId: string
  paint: (ctx: CanvasRenderingContext2D, dpr: number) => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!shown) {
      return undefined
    }
    return autorun(() => {
      const canvas = ref.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx) {
        const width = model.paneWidth
        const height = model.canvasHeight
        dependOn(trackedDpr())
        const dpr = syncCanvasSize(canvas, width, height)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, width, height)
        paint(ctx, dpr)
      }
    })
  }, [model, shown, paint])
  return (
    <canvas
      ref={ref}
      data-testid={shown ? testId : undefined}
      style={{ ...paneLayerStyle(zIndex), display: shown ? 'block' : 'none' }}
    />
  )
})
