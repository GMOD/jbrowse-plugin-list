import { useCallback } from 'react'

import { drawTubeMapRuler } from '@jbrowse/bandage-core/tubeMap/axis'
import { drawTubeMapConnectors } from '@jbrowse/bandage-core/tubeMap/connectors'
import { drawDeviationMarks } from '@jbrowse/bandage-core/tubeMap/deviations'
import { drawTubeMap } from '@jbrowse/bandage-core/tubeMap/draw'
import { drawTubeMapGenes } from '@jbrowse/bandage-core/tubeMap/genes'
import { observer } from 'mobx-react'

import { PaneOverlayCanvas } from './PaneLayer'
import {
  PANEL_TITLE_FONT,
  drawBundleCounts,
  drawSqueezedLengths,
} from '../tubeMapPanels'

// variants folded into a box mark texture under a panel's routes
const PANEL_TICK_ALPHA = 0.45

import type { GraphPaneModel } from '../model'

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
    tubeColors: model.tubeMapTubeColors,
    nodeColors: model.tubeMapNodeColors,
  }
  drawTubeMap(ctx, picture, tubeFrame)
  const drawn = model.layoutResult?.tubeMap
  if (drawn) {
    drawBundleCounts(ctx, picture, drawn.graph, tubeFrame)
    drawSqueezedLengths(ctx, drawn, tubeFrame)
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
  for (const p of panels) {
    if (p.bottom < 0 || p.titleTop > model.canvasHeight) {
      continue
    }
    const tubeFrame = {
      ...p.frame,
      width,
      highlightNode,
      tubeColors: p.tubeColors,
      nodeColors: p.nodeColors,
    }
    drawTubeMap(ctx, p.picture, tubeFrame)
    drawBundleCounts(ctx, p.picture, p.panel.result.tubeMap.graph, tubeFrame)
    drawSqueezedLengths(ctx, p.panel.result.tubeMap, tubeFrame)
    ctx.globalAlpha = PANEL_TICK_ALPHA
    drawDeviationMarks(ctx, p.deviations, tubeFrame)
    ctx.globalAlpha = 1
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, Math.round(p.titleTop) + 0.5)
    ctx.lineTo(width, Math.round(p.titleTop) + 0.5)
    ctx.stroke()
    ctx.font = PANEL_TITLE_FONT
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = 'rgba(0,0,0,0.85)'
    ctx.fillText(p.label, 6, p.titleTop + 4)
  }
  const last = panels.at(-1)
  const boxes = model.tubeMapPanelRulerBoxes
  if (last && boxes) {
    drawTubeMapRuler(
      ctx,
      boxes,
      { ...last.frame, width },
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
  const paint = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      paintTubeMap(ctx, model, { highlightNode: model.selectedNode })
    },
    [model],
  )
  return (
    <PaneOverlayCanvas
      model={model}
      zIndex={1}
      shown={!!model.tubeMapPicture}
      testId="graph-tube-map"
      paint={paint}
    />
  )
})

export default TubeMapOverlay
