import { useEffect, useRef } from 'react'

import { drawReferenceStrip } from '@jbrowse/bandage-core/referenceStrip'
import { LIFT_BACKDROP_CSS } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { getDpr } from '@jbrowse/bandage-core/renderer/canvas'
import { encodingSwatchCss } from '@jbrowse/bandage-core/walkEncoding'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'

import { legendBoxStyle, legendRowStyle } from './legendStyles'

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

const SWATCH_PX = 18

const RAMP_SWATCH =
  'linear-gradient(to right, hsl(0, 70%, 50%) 0 33%, hsl(120, 70%, 50%) 33% 61%, hsl(240, 70%, 50%) 61%)'

// A scheme other than the ramp shows a few of the strip's own blocks in bp
// order, as the strip draws them, rather than a rainbow it does not
const SAMPLED_BLOCKS = 6

function sampledSwatch(colors: string[]) {
  const distinct = colors.filter((c, i) => c !== colors[i - 1])
  const n = Math.min(SAMPLED_BLOCKS, distinct.length)
  const picked = Array.from(
    { length: n },
    (_, i) =>
      distinct[n > 1 ? Math.round((i * (distinct.length - 1)) / (n - 1)) : 0]!,
  )
  return picked.length > 1
    ? `linear-gradient(to right, ${picked.join(', ')})`
    : (picked[0] ?? LIFT_BACKDROP_CSS)
}

// the strip's own colours: a row per lifted walk in its lane's, else the
// node scheme's
function StripSwatch({
  rows,
}: {
  rows: { key: string; background: string }[]
}) {
  return (
    <div style={{ width: SWATCH_PX, flex: 'none' }}>
      {rows.map(({ key, background }) => (
        <div
          key={key}
          style={{ height: rows.length > 1 ? 3 : 4, background }}
        />
      ))}
    </div>
  )
}

function stripRows(model: GraphPaneModel) {
  return (
    model.walkLift?.walks.map(w => ({
      key: w.name,
      background: encodingSwatchCss(w.encoding),
    })) ?? [
      {
        key: 'scheme',
        background:
          model.effectiveColorScheme === 'reference-position'
            ? RAMP_SWATCH
            : sampledSwatch(model.referenceStripBlocks.map(b => b.colors[0]!)),
      },
    ]
  )
}

function OverhangSwatch() {
  return (
    <svg width={SWATCH_PX} height={10} style={{ flex: 'none' }}>
      <path d="M0,5 L8,0 L8,10 Z M18,5 L10,0 L10,10 Z" fill="#18181c" />
    </svg>
  )
}

// Hovering a node boxes its span on the strip and draws a leader to it
export const ReferenceStripLegend = observer(function ReferenceStripLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  const rowPerWalk = (model.walkLift?.walks.length ?? 0) > 1
  return model.referenceStripShown ? (
    <div style={legendBoxStyle} data-testid="graph-reference-strip-legend">
      <div style={legendRowStyle}>
        <StripSwatch rows={stripRows(model)} />
        <span>
          top strip: reference segments at their bp
          {rowPerWalk ? ', a row per walk' : ''}
        </span>
      </div>
      {model.referenceStripFaded ? (
        <div style={legendRowStyle}>
          <StripSwatch
            rows={[{ key: 'pale', background: LIFT_BACKDROP_CSS }]}
          />
          <span>
            reference not on{' '}
            {rowPerWalk ? "that row's walk" : model.liftedWalksLabel}
          </span>
        </div>
      ) : null}
      {model.referenceStripOverhangs ? (
        <div style={legendRowStyle}>
          <OverhangSwatch />
          <span>the graph draws reference past this edge</span>
        </div>
      ) : null}
    </div>
  ) : null
})
