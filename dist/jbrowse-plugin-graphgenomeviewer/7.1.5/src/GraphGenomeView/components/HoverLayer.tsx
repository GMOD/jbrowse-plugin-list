import { useEffect, useState } from 'react'

import { Canvas2DRenderer } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'
import { autorun } from 'mobx'

import { paneLayerStyle } from './PaneLayer'

import type { GraphPaneModel } from '../model'

export const hoverLayerStyle = paneLayerStyle(1)

// The pane's hover, on a transparent canvas over its drawing and tube map
export default function HoverLayer({ model }: { model: GraphPaneModel }) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useEffect(() => {
    if (!canvas) {
      return undefined
    }
    const renderer = new Canvas2DRenderer(canvas)
    const dispose = autorun(() => {
      renderer.resize(model.paneWidth, model.canvasHeight)
      model.paintHover(renderer, model.drawnBatch)
    })
    return () => {
      dispose()
      renderer.dispose()
    }
  }, [canvas, model])
  return (
    <canvas
      ref={setCanvas}
      data-testid="graph-hover-layer"
      style={hoverLayerStyle}
    />
  )
}
