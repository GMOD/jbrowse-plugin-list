import { useEffect, useRef } from 'react'

import { drawReferenceStrip } from '@jbrowse/bandage-core/referenceStrip'
import { getDpr } from '@jbrowse/bandage-core/renderer/canvas'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'

const canvasStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  zIndex: 5,
}

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
      darkMode: model.darkMode,
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
  const ref = useRef<HTMLCanvasElement>(null)
  const { referenceStripShown, paneWidth, canvasHeight } = model
  useEffect(
    () =>
      autorun(() => {
        const canvas = ref.current
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx && model.referenceStripShown) {
          const dpr = getDpr()
          const width = model.paneWidth
          const height = model.canvasHeight
          canvas.width = Math.round(width * dpr)
          canvas.height = Math.round(height * dpr)
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          ctx.clearRect(0, 0, width, height)
          paintReferenceStrip(ctx, model, {
            lit: model.referenceStripLit,
            dpr,
          })
        }
      }),
    [model],
  )
  return (
    <canvas
      ref={ref}
      data-testid={referenceStripShown ? 'graph-reference-strip' : undefined}
      style={{
        ...canvasStyle,
        width: paneWidth,
        height: canvasHeight,
        display: referenceStripShown ? 'block' : 'none',
      }}
    />
  )
})

export default ReferenceStripOverlay
