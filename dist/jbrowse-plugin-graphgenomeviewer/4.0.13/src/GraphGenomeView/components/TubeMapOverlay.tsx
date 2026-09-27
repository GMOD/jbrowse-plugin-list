import { useEffect, useRef } from 'react'

import { formatBp } from '@jbrowse/bandage-core/graphLabels'
import {
  ZIGZAG_AMPLITUDE_PX,
  ZIGZAG_PX,
  drawTubeMapRuler,
  rulerInk,
} from '@jbrowse/bandage-core/tubeMap/axis'
import { drawTubeMapConnectors } from '@jbrowse/bandage-core/tubeMap/connectors'
import {
  deviationInk,
  drawDeviationMarks,
} from '@jbrowse/bandage-core/tubeMap/deviations'
import { drawTubeMap } from '@jbrowse/bandage-core/tubeMap/draw'
import { drawTubeMapGenes } from '@jbrowse/bandage-core/tubeMap/genes'
import { getDpr } from '@jbrowse/render-core/canvas2dUtils'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'

import type { GraphPaneModel } from '../model'

const canvasStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  zIndex: 1,
}

// The tube map's ink, over the canvas, which draws nothing under a tube map
// layout. Above the tubes go the session's genes in a view of its own, or in
// a linear view the bands tying each reference box to its bp there; under
// them a reference ruler, unless the linear view's is already the axis.
// Repainted by an autorun on every change of transform, so a pan in the linear
// view above moves the tubes in the same frame as its other tracks.
const TubeMapOverlay = observer(function TubeMapOverlay({
  model,
}: {
  model: GraphPaneModel
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { tubeMapPicture, paneWidth, canvasHeight } = model
  useEffect(
    () =>
      autorun(() => {
        const canvas = ref.current
        const picture = model.tubeMapPicture
        const frame = model.tubeMapFrame
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx && picture && frame) {
          const dpr = getDpr()
          const width = model.paneWidth
          const height = model.canvasHeight
          canvas.width = Math.round(width * dpr)
          canvas.height = Math.round(height * dpr)
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          ctx.clearRect(0, 0, width, height)
          const tubeFrame = {
            ...frame,
            width,
            highlightNode: model.hoveredNode ?? model.selectedNode,
            darkMode: model.darkMode,
          }
          drawTubeMap(ctx, picture, tubeFrame)
          drawDeviationMarks(ctx, model.tubeMapDeviations, tubeFrame)
          drawTubeMapConnectors(
            ctx,
            model.tubeMapConnectors,
            model.connectorZoneBottom,
            tubeFrame,
          )
          const { bounds } = picture
          drawTubeMapGenes(
            ctx,
            model.tubeMapGenes,
            tubeFrame,
            frame.y(bounds.minY) - 2,
          )
          const boxes = model.tubeMapRulerBoxes
          if (boxes) {
            drawTubeMapRuler(ctx, boxes, tubeFrame, frame.y(bounds.maxY) + 4)
          }
        }
      }),
    [model],
  )
  // Mounted whether or not there is a tube map, so the autorun above has its
  // canvas the moment a layout brings one.
  return (
    <canvas
      ref={ref}
      data-testid={tubeMapPicture ? 'graph-tube-map' : undefined}
      style={{
        ...canvasStyle,
        width: paneWidth,
        height: canvasHeight,
        display: tubeMapPicture ? 'block' : 'none',
      }}
    />
  )
})

export default TubeMapOverlay

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

// The ruler's own zigzag, tooth for tooth
function ZigzagSwatch() {
  const teeth = Math.round(SWATCH_PX / ZIGZAG_PX)
  const dx = SWATCH_PX / teeth
  const mid = ZIGZAG_AMPLITUDE_PX + 1
  const points = [`0,${mid}`]
  for (let i = 0; i < teeth; i++) {
    points.push(
      `${(i + 0.5) * dx},${mid + (i % 2 ? 1 : -1) * ZIGZAG_AMPLITUDE_PX}`,
    )
  }
  points.push(`${SWATCH_PX},${mid}`)
  return (
    <svg width={SWATCH_PX} height={mid * 2} style={{ flex: 'none' }}>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={rulerInk()}
        strokeWidth={1}
      />
    </svg>
  )
}

const tubeSwatchStyle = {
  width: SWATCH_PX,
  height: 7,
  flex: 'none',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '#b8b8c0',
}

function TickSwatch() {
  return (
    <div style={tubeSwatchStyle}>
      <div style={{ width: 2, backgroundColor: deviationInk() }} />
    </div>
  )
}

// The two marks a tube map draws that nothing else on screen explains, each
// listed only while it is drawn
export const TubeMapLegend = observer(function TubeMapLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  const { squeezed, foldBp } = model.tubeMapKeys
  return squeezed || foldBp !== undefined ? (
    <div style={legendBoxStyle} data-testid="graph-tube-map-legend">
      {foldBp !== undefined ? (
        <div style={legendRowStyle}>
          <TickSwatch />
          <span>a haplotype's variant under {formatBp(foldBp)}</span>
        </div>
      ) : null}
      {squeezed ? (
        <div style={legendRowStyle}>
          <ZigzagSwatch />
          <span>ruler not to scale, box length below</span>
        </div>
      ) : null}
    </div>
  ) : null
})
