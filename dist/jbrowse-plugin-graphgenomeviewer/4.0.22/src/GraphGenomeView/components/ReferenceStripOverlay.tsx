import { useEffect, useRef } from 'react'

import { drawReferenceStrip } from '@jbrowse/bandage-core/referenceStrip'
import { encodingSwatchCss } from '@jbrowse/bandage-core/walkEncoding'
import { getDpr } from '@jbrowse/render-core/canvas2dUtils'
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
        const frame = model.referenceStripFrame
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx && frame && model.referenceStripShown) {
          const dpr = getDpr()
          const width = model.paneWidth
          const height = model.canvasHeight
          canvas.width = Math.round(width * dpr)
          canvas.height = Math.round(height * dpr)
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          ctx.clearRect(0, 0, width, height)
          drawReferenceStrip(ctx, model.referenceStripBlocks, frame, {
            width,
            lit: model.referenceStripLit,
            darkMode: model.darkMode,
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

const legendBoxStyle = {
  background: 'rgba(255,255,255,0.82)',
  padding: '4px 6px',
  borderRadius: 3,
  fontSize: 11,
  lineHeight: '15px',
  whiteSpace: 'nowrap' as const,
}
const legendRowStyle = { display: 'flex', alignItems: 'center', gap: 5 }
const SWATCH_PX = 18

// the strip's own colours: the reference lane's under lifted walks, grey
// when the reference is not one of them, else the node scheme's ramp
function StripSwatch({ background }: { background: string }) {
  return (
    <div style={{ width: SWATCH_PX, height: 4, flex: 'none', background }} />
  )
}

const RAMP_SWATCH =
  'linear-gradient(to right, hsl(0, 70%, 50%) 0 33%, hsl(120, 70%, 50%) 33% 61%, hsl(240, 70%, 50%) 61%)'

function stripBackground(model: GraphPaneModel) {
  const lift = model.walkLift
  const reference = lift?.walks.find(w => w.reference)
  return reference
    ? encodingSwatchCss(reference.encoding)
    : lift
      ? 'rgb(160, 160, 160)'
      : RAMP_SWATCH
}

function OverhangSwatch() {
  return (
    <svg width={SWATCH_PX} height={8} style={{ flex: 'none' }}>
      <path d="M0,4 L5,0.5 L5,7.5 Z M18,4 L13,0.5 L13,7.5 Z" fill="#18181c" />
    </svg>
  )
}

// Hovering a node boxes its span on the strip and draws a leader to it
export const ReferenceStripLegend = observer(function ReferenceStripLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  return model.referenceStripShown ? (
    <div style={legendBoxStyle} data-testid="graph-reference-strip-legend">
      <div style={legendRowStyle}>
        <StripSwatch background={stripBackground(model)} />
        <span>top strip: reference segments at their bp</span>
      </div>
      {model.referenceStripOverhangs ? (
        <div style={legendRowStyle}>
          <OverhangSwatch />
          <span>the graph runs past this edge</span>
        </div>
      ) : null}
    </div>
  ) : null
})
