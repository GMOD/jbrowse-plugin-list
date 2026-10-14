import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { syncCanvasSize } from '@jbrowse/bandage-core/renderer/canvas'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'

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
  children,
}: {
  model: GraphPaneModel
  zIndex: number
  overflow?: 'hidden' | 'visible'
  testId?: string
  children: ReactNode
}) {
  return (
    <svg
      style={paneLayerStyle(zIndex, overflow)}
      width={model.paneWidth}
      height={model.canvasHeight}
      data-testid={testId}
    >
      {children}
    </svg>
  )
})

// A canvas the pane's size that an autorun repaints, so a pan moves its ink in
// the same frame as the drawing. `paint` draws in css px.
export function PaneOverlayCanvas({
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
}
