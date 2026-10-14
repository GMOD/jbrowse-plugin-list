import { useCallback } from 'react'

import { drawReferenceStrip } from '@jbrowse/bandage-core/referenceStrip'
import { observer } from 'mobx-react'

import { PaneOverlayCanvas } from './PaneLayer'

import type { GraphPaneModel } from '../model'

// Each reference segment at its bp in the linear view, onto the pane's
// canvas or the linear view's SVG export
export function paintReferenceStrip(
  ctx: CanvasRenderingContext2D,
  model: GraphPaneModel,
  {
    lit,
    dpr,
  }: { lit: GraphPaneModel['referenceStripLit'] | undefined; dpr: number },
) {
  const frame = model.hostBpFrame
  if (frame) {
    drawReferenceStrip(ctx, model.referenceStripBlocks, frame, {
      width: model.paneWidth,
      lit,
      dpr,
    })
  }
}

// Each reference segment at its bp in the linear view, over a drawing that
// has no bp axis of its own. Repainted by an autorun, so a pan in the linear
// view moves the strip in the same frame as its other tracks.
const ReferenceStripOverlay = observer(function ReferenceStripOverlay({
  model,
}: {
  model: GraphPaneModel
}) {
  const paint = useCallback(
    (ctx: CanvasRenderingContext2D, dpr: number) => {
      paintReferenceStrip(ctx, model, { lit: model.referenceStripLit, dpr })
    },
    [model],
  )
  return (
    <PaneOverlayCanvas
      model={model}
      zIndex={5}
      shown={model.referenceStripShown}
      testId="graph-reference-strip"
      paint={paint}
    />
  )
})

export default ReferenceStripOverlay
