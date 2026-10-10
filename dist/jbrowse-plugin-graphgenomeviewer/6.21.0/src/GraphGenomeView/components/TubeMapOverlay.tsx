import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { formatBp } from '@jbrowse/bandage-core/graphLabels'
import { getDpr } from '@jbrowse/bandage-core/renderer/canvas'
import { drawTubeMapRuler, rulerInk } from '@jbrowse/bandage-core/tubeMap/axis'
import { drawTubeMapConnectors } from '@jbrowse/bandage-core/tubeMap/connectors'
import {
  deviationInk,
  drawDeviationMarks,
} from '@jbrowse/bandage-core/tubeMap/deviations'
import { drawTubeMap } from '@jbrowse/bandage-core/tubeMap/draw'
import { drawTubeMapGenes } from '@jbrowse/bandage-core/tubeMap/genes'
import {
  FORWARD_READ_COLORS,
  REVERSE_READ_COLORS,
} from '@jbrowse/bandage-core/tubeMap/reads'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'

import { legendBoxStyle, legendRowStyle } from './legendStyles'
import {
  PANEL_REFERENCE_TUBE,
  PANEL_TITLE_FONT,
  PANEL_TUBE,
  drawBundleCounts,
} from '../tubeMapPanels'

// variants folded into a box mark texture under a panel's routes
const PANEL_TICK_ALPHA = 0.45

import type { GraphPaneModel } from '../model'

const canvasStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  zIndex: 1,
}

// The tubes, their connectors, genes and ruler, onto a canvas sized to the
// pane or onto the linear view's SVG export
export function paintTubeMap(
  ctx: CanvasRenderingContext2D,
  model: GraphPaneModel,
  { highlightNode }: { highlightNode: string | null },
) {
  const picture = model.tubeMapPicture
  const frame = model.tubeMapFrame
  if (!picture || !frame) {
    return
  }
  const width = model.paneWidth
  const panels = model.tubeMapPanelViews
  if (panels) {
    paintPanels(ctx, model, panels, highlightNode)
    return
  }
  const tubeFrame = {
    ...frame,
    width,
    highlightNode,
    darkMode: model.darkMode,
    tubeColors: model.tubeMapTubeColors,
    nodeColors: model.tubeMapNodeColors,
  }
  drawTubeMap(ctx, picture, tubeFrame)
  const drawn = model.layoutResult?.tubeMap
  if (drawn) {
    drawBundleCounts(ctx, picture, drawn.graph, tubeFrame)
  }
  drawDeviationMarks(ctx, model.tubeMapDeviations, tubeFrame)
  drawTubeMapConnectors(
    ctx,
    model.tubeMapConnectors,
    model.connectorZoneBottom,
    tubeFrame,
  )
  const { bounds } = picture
  drawTubeMapGenes(ctx, model.tubeMapGenes, tubeFrame, frame.y(bounds.minY) - 2)
  const boxes = model.tubeMapRulerBoxes
  if (boxes) {
    drawTubeMapRuler(
      ctx,
      boxes,
      tubeFrame,
      frame.y(bounds.maxY) + 4,
      model.layoutResult?.referenceAxis,
    )
  }
}

// Each panel of a split tube map under a rule and its title, which the canvas
// draws so a figure's SVG carries them
function paintPanels(
  ctx: CanvasRenderingContext2D,
  model: GraphPaneModel,
  panels: NonNullable<GraphPaneModel['tubeMapPanelViews']>,
  highlightNode: string | null,
) {
  const width = model.paneWidth
  const ink = model.darkMode ? '255,255,255' : '0,0,0'
  for (const p of panels) {
    if (p.bottom < 0 || p.titleTop > model.canvasHeight) {
      continue
    }
    const tubeFrame = {
      ...p.frame,
      width,
      highlightNode,
      darkMode: model.darkMode,
      tubeColors: p.tubeColors,
      nodeColors: p.nodeColors,
    }
    drawTubeMap(ctx, p.picture, tubeFrame)
    drawBundleCounts(ctx, p.picture, p.panel.result.tubeMap.graph, tubeFrame)
    ctx.globalAlpha = PANEL_TICK_ALPHA
    drawDeviationMarks(ctx, p.deviations, tubeFrame)
    ctx.globalAlpha = 1
    ctx.strokeStyle = `rgba(${ink},0.15)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, Math.round(p.titleTop) + 0.5)
    ctx.lineTo(width, Math.round(p.titleTop) + 0.5)
    ctx.stroke()
    ctx.font = PANEL_TITLE_FONT
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = `rgba(${ink},0.85)`
    ctx.fillText(p.label, 6, p.titleTop + 4)
  }
  const last = panels.at(-1)
  const boxes = model.tubeMapPanelRulerBoxes
  if (last && boxes) {
    drawTubeMapRuler(
      ctx,
      boxes,
      { ...last.frame, width, darkMode: model.darkMode },
      last.bottom + 4,
      true,
    )
  }
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
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx && model.tubeMapPicture && model.tubeMapFrame) {
          const dpr = getDpr()
          const width = model.paneWidth
          const height = model.canvasHeight
          canvas.width = Math.round(width * dpr)
          canvas.height = Math.round(height * dpr)
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          ctx.clearRect(0, 0, width, height)
          paintTubeMap(ctx, model, { highlightNode: model.selectedNode })
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

const SWATCH_PX = 18

// Two boxes' brackets, as the ruler draws them under every box
function BracketSwatch() {
  const brackets = [
    [0.5, 5.5],
    [8.5, SWATCH_PX - 0.5],
  ]
  return (
    <svg width={SWATCH_PX} height={7} style={{ flex: 'none' }}>
      <path
        d={brackets.map(([x0, x1]) => `M${x0},6 V1.5 H${x1} V6`).join(' ')}
        fill="none"
        stroke={rulerInk()}
        strokeWidth={1}
      />
    </svg>
  )
}

const barSwatchStyle = { width: SWATCH_PX, height: 7, flex: 'none' }

const tubeSwatchStyle = {
  ...barSwatchStyle,
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

// A read takes one shade of its strand's palette, varied so neighbours differ
function ReadSwatch({ colors }: { colors: readonly string[] }) {
  const step = 100 / colors.length
  const stops = colors.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`)
  return (
    <div
      style={{
        ...barSwatchStyle,
        background: `linear-gradient(to right, ${stops.join(', ')})`,
      }}
    />
  )
}

const glyphSwatchStyle = {
  width: SWATCH_PX,
  flex: 'none',
  textAlign: 'center' as const,
  fontFamily: 'monospace',
  fontSize: 12,
}

function DeletionSwatch() {
  return <div style={{ ...barSwatchStyle, backgroundColor: 'grey' }} />
}

function LegendRow({
  swatch,
  children,
}: {
  swatch: ReactNode
  children: ReactNode
}) {
  return (
    <div style={legendRowStyle}>
      {swatch}
      <span>{children}</span>
    </div>
  )
}

// What a tube map draws that nothing else on screen explains, each listed
// only while it applies
export const TubeMapLegend = observer(function TubeMapLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  const {
    roles,
    bundled,
    values,
    logWidths,
    foldBp,
    forwardReads,
    reverseReads,
    substitution,
    insertion,
    deletion,
  } = model.tubeMapKeys
  const reads = model.readsShown
  const sampled = reads && reads.shown < reads.total ? reads : undefined
  const rows = [
    ...(values
      ? [{ value: 'reference', color: PANEL_REFERENCE_TUBE }, ...values].map(
          ({ value, color }) => (
            <LegendRow
              key={`value-${value}`}
              swatch={
                <div style={{ ...barSwatchStyle, backgroundColor: color }} />
              }
            >
              {value}
            </LegendRow>
          ),
        )
      : []),
    roles && (
      <LegendRow
        key="ref"
        swatch={
          <div
            style={{ ...barSwatchStyle, backgroundColor: PANEL_REFERENCE_TUBE }}
          />
        }
      >
        reference
      </LegendRow>
    ),
    roles && (
      <LegendRow
        key="hap"
        swatch={
          <div style={{ ...barSwatchStyle, backgroundColor: PANEL_TUBE }} />
        }
      >
        {bundled ? 'a route, as wide as the haplotypes taking it' : 'haplotype'}
      </LegendRow>
    ),
    forwardReads && (
      <LegendRow key="fwd" swatch={<ReadSwatch colors={FORWARD_READ_COLORS} />}>
        read on the forward strand
      </LegendRow>
    ),
    reverseReads && (
      <LegendRow key="rev" swatch={<ReadSwatch colors={REVERSE_READ_COLORS} />}>
        read on the reverse strand
      </LegendRow>
    ),
    sampled && (
      <LegendRow key="sampled" swatch={<span style={glyphSwatchStyle} />}>
        {sampled.shown.toLocaleString('en-US')} of{' '}
        {sampled.total.toLocaleString('en-US')} reads shown
      </LegendRow>
    ),
    substitution && (
      <LegendRow key="sub" swatch={<span style={glyphSwatchStyle}>A</span>}>
        a read's base unlike the node's
      </LegendRow>
    ),
    insertion && (
      <LegendRow key="ins" swatch={<span style={glyphSwatchStyle}>*</span>}>
        bases a read inserts
      </LegendRow>
    ),
    deletion && (
      <LegendRow key="del" swatch={<DeletionSwatch />}>
        bases a read skips
      </LegendRow>
    ),
    foldBp !== undefined && (
      <LegendRow key="fold" swatch={<TickSwatch />}>
        a haplotype's variant under {formatBp(foldBp)}
      </LegendRow>
    ),
    logWidths && (
      <LegendRow key="log" swatch={<BracketSwatch />}>
        width grows with log of length
      </LegendRow>
    ),
  ].filter(Boolean)
  return rows.length > 0 ? (
    <div style={legendBoxStyle} data-testid="graph-tube-map-legend">
      {rows}
    </div>
  ) : null
})
