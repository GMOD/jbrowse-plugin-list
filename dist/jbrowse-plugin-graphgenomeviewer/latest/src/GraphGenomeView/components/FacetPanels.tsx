import { useEffect, useRef } from 'react'

import { formatBp } from '@jbrowse/bandage-core/graphLabels'
import { fitTransform } from '@jbrowse/bandage-core/pipeline'
import { Canvas2DRenderer } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'
import { buildGeometry } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { axisScaleOf } from '@jbrowse/bandage-core/viewport'
import { encodingSwatchCss } from '@jbrowse/bandage-core/walkEncoding'
import { getDpr } from '@jbrowse/render-core/canvas2dUtils'
import { observer } from 'mobx-react'

import { FACET_GAP_PX, FACET_PAD_PX, FACET_TITLE_PX } from '../model'

import type { GraphPaneModel } from '../model'
import type { WalkLift } from '@jbrowse/bandage-core/walkHighlight'

// The pane faceted by walk: the same layout drawn once per lifted walk, each
// panel with that walk alone shading along itself, so walks compare by where
// they go rather than by which lane is which colour. A panel's title is its
// scale, and clicking it lifts that walk alone in the whole pane.

const gridStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  zIndex: 4,
  display: 'grid',
  gap: FACET_GAP_PX,
  lineHeight: 'normal',
}

const titleStyle = {
  height: FACET_TITLE_PX,
  padding: '2px 6px',
  boxSizing: 'border-box' as const,
  fontSize: 11,
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  textAlign: 'left' as const,
  width: '100%',
}

const barRowStyle = { display: 'flex', alignItems: 'center', gap: 5 }
const barStyle = { flex: 1, height: 8, borderRadius: 2 }

const FacetPanel = observer(function FacetPanel({
  model,
  lift,
  width,
  height,
}: {
  model: GraphPaneModel
  lift: WalkLift
  width: number
  height: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { graph, nodePositions, nodeById, layoutBounds, pixelRows } = model
  const walk = lift.walks[0]!

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !graph || !nodePositions || !nodeById || !layoutBounds) {
      return
    }
    const renderer = new Canvas2DRenderer(canvas)
    renderer.resize(width, height)
    const fit = fitTransform(layoutBounds, width, height, pixelRows, {
      padLeft: FACET_PAD_PX,
      padTop: FACET_PAD_PX,
      padRight: FACET_PAD_PX,
      padBottom: FACET_PAD_PX,
    })
    if (fit) {
      const axis = axisScaleOf(fit.scale, pixelRows)
      renderer.uploadGeometry(
        buildGeometry({
          nodePositions,
          graph,
          nodeById,
          colorScheme: model.effectiveColorScheme,
          contigThickness: model.contigThickness,
          connectorThickness: model.connectorThickness,
          drawPaths: false,
          nodeWidth: model.nodeWidth,
          highlight: lift,
          axis,
          linearLayout: model.linearLayout,
          referenceRamp: model.referenceRamp,
          deletions: model.deletionEdgeIndexes,
          hiddenEdges: model.hiddenEdgeIndexes,
          version: model.positionsVersion,
        }),
      )
      const dpr = getDpr()
      renderer.updateTransform({
        scaleX: axis.scaleX * dpr,
        scaleY: axis.scaleY * dpr,
        translateX: fit.translateX * dpr,
        translateY: fit.translateY * dpr,
        dpr,
      })
      renderer.render(model.darkMode ? [0.12, 0.12, 0.12, 1] : [1, 1, 1, 1])
    }
    return () => {
      renderer.dispose()
    }
  }, [
    model,
    lift,
    width,
    height,
    graph,
    nodePositions,
    nodeById,
    layoutBounds,
    pixelRows,
  ])

  const label =
    model.walkChoices.find(c => c.name === walk.name)?.label ?? walk.name
  const delta =
    walk.referenceBp === undefined || walk.bp === walk.referenceBp
      ? ''
      : ` ${walk.bp > walk.referenceBp ? '+' : '−'}${formatBp(Math.abs(walk.bp - walk.referenceBp))}`
  const range = walk.range
  return (
    <div>
      <button
        type="button"
        style={titleStyle}
        data-testid="graph-facet-title"
        title={
          range
            ? `${range.contig}:${range.start.toLocaleString()}-${range.end.toLocaleString()} · click to lift ${label} alone`
            : `click to lift ${label} alone`
        }
        onClick={() => {
          model.liftWalks([walk.name])
          model.setFacet('none')
        }}
      >
        <div>
          <strong>{label}</strong>
          {delta}
          {walk.reversedBp > 0 ? `, ${formatBp(walk.reversedBp)} reversed` : ''}
        </div>
        <div style={barRowStyle}>
          {range ? <span>{range.start.toLocaleString()}</span> : null}
          <div
            style={{
              ...barStyle,
              background: encodingSwatchCss(walk.encoding),
            }}
          />
          {range ? <span>{range.end.toLocaleString()}</span> : null}
        </div>
      </button>
      <canvas
        ref={canvasRef}
        data-testid="graph-facet-canvas"
        style={{ width, height, display: 'block' }}
      />
    </div>
  )
})

const FacetPanels = observer(function FacetPanels({
  model,
}: {
  model: GraphPaneModel
}) {
  const panels = model.facetPanels
  const grid = model.facetGrid
  if (!panels || !grid) {
    return null
  }
  const { columns, width, height } = grid
  return (
    <div
      data-testid="graph-facet-panels"
      style={{
        ...gridStyle,
        width: model.paneWidth,
        minHeight: model.canvasHeight,
        gridTemplateColumns: `repeat(${columns}, ${width}px)`,
        background: model.darkMode ? '#1f1f1f' : 'white',
      }}
    >
      {panels.map(lift => (
        <FacetPanel
          key={lift.walks[0]!.name}
          model={model}
          lift={lift}
          width={width}
          height={height}
        />
      ))}
    </div>
  )
})

export default FacetPanels
