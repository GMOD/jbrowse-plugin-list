import { useCallback } from 'react'

import { drawEdgeMarks } from '@jbrowse/bandage-core/trackFit'
import { observer } from 'mobx-react'

import { PaneOverlayCanvas } from './PaneLayer'
import { PAPER_CSS } from '../pane/paneBase'

import type { GraphPaneModel } from '../model'

const EDGE_MARK_INK = '#18181c'

// A mark on the pane's top or bottom edge over each stretch where the drawing
// runs past it, onto the pane's canvas or the linear view's SVG export
export function paintEdgeMarks(
  ctx: CanvasRenderingContext2D,
  model: GraphPaneModel,
) {
  const marks = model.edgeMarks
  if (marks) {
    drawEdgeMarks(
      ctx,
      marks,
      { top: model.referenceStripZonePx, bottom: model.canvasHeight },
      { ink: EDGE_MARK_INK, paper: PAPER_CSS },
    )
  }
}

const EdgeMarksOverlay = observer(function EdgeMarksOverlay({
  model,
}: {
  model: GraphPaneModel
}) {
  const paint = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      paintEdgeMarks(ctx, model)
    },
    [model],
  )
  return (
    <PaneOverlayCanvas
      model={model}
      zIndex={5}
      shown={model.runsPastEdge}
      testId="graph-edge-marks"
      paint={paint}
    />
  )
})

export default EdgeMarksOverlay
