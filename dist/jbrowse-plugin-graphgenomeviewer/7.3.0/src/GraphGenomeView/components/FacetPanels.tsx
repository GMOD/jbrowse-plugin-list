import { useEffect, useState } from 'react'

import { FACET_GAP_PX, FACET_TITLE_PX } from '@jbrowse/bandage-core/facetGrid'
import { Canvas2DRenderer } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'
import { autorun, computed } from 'mobx'
import { observer } from 'mobx-react'

import { hoverLayerStyle } from './HoverLayer'
import { LegendRowView } from './Legend'
import { facetKeyRows, walkKeyRow } from '../legendSections'
import { FACET_KEY_ROW_PX } from '../pane/fitViews'
import { PAPER_CSS } from '../pane/paneBase'

import type { PaneHandlers } from './usePaneGestures'
import type { GraphPaneModel } from '../model'
import type { WalkLift } from '@jbrowse/bandage-core/walkHighlight'

// The pane faceted by walk: the same layout drawn once per lifted walk, each
// panel with that walk alone shading along itself, so walks compare by where
// they go rather than by which lane is which colour. The panels share the
// pane's transform, so a pan, zoom or hover in one is in all of them.

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
  fontFamily: 'inherit',
  fontSize: 11,
  color: 'inherit',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  textAlign: 'left' as const,
  display: 'block',
}

const panelStyle = { position: 'relative' as const }

const keyStyle = {
  gridColumn: '1 / -1',
  height: FACET_KEY_ROW_PX,
  padding: '2px 6px',
  boxSizing: 'border-box' as const,
  display: 'flex',
  gap: 14,
  fontSize: 11,
  lineHeight: '15px',
}

const FacetPanel = observer(function FacetPanel({
  model,
  lift,
  width,
  height,
  cell,
  handlers,
  canvasStyle,
}: {
  model: GraphPaneModel
  lift: WalkLift
  width: number
  height: number
  cell: { gridRow: number; gridColumn: number }
  handlers: PaneHandlers
  canvasStyle: React.CSSProperties
}) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [hoverCanvas, setHoverCanvas] = useState<HTMLCanvasElement | null>(null)
  const walk = lift.walks[0]!
  useEffect(() => {
    if (!canvas || !hoverCanvas) {
      return undefined
    }
    const renderer = new Canvas2DRenderer(canvas)
    const hover = new Canvas2DRenderer(hoverCanvas)
    const drawing = computed(() => model.buildDrawing(lift, false))
    let uploaded: ReturnType<typeof model.buildDrawing>
    const disposers = [
      autorun(() => {
        const grid = model.facetGrid
        if (grid) {
          renderer.resize(grid.width, grid.height)
        }
        const built = drawing.get()
        if (!built) {
          return
        }
        if (built !== uploaded) {
          renderer.uploadGeometry(built.batch)
          uploaded = built
        }
        model.applySelection(renderer)
        model.paint(renderer)
      }),
      autorun(() => {
        const grid = model.facetGrid
        if (grid) {
          hover.resize(grid.width, grid.height)
        }
        const built = drawing.get()
        if (built) {
          model.paintHover(hover, built.batch)
        }
      }),
    ]
    return () => {
      for (const dispose of disposers) {
        dispose()
      }
      renderer.dispose()
      hover.dispose()
    }
  }, [canvas, hoverCanvas, model, lift])

  const label = model.walkLabel(walk.name)
  return (
    <div style={cell}>
      <button
        type="button"
        style={titleStyle}
        data-testid="graph-facet-title"
        onClick={() => {
          model.liftWalks([walk.name])
          model.setFacet('')
        }}
      >
        <LegendRowView
          row={walkKeyRow(model, walk)}
          hint={`click to lift ${label} alone`}
          at={model.hoveredOn(walk)}
        />
      </button>
      <div style={panelStyle}>
        <canvas
          ref={setCanvas}
          data-testid="graph-facet-canvas"
          style={{ ...canvasStyle, width, height, display: 'block' }}
          {...handlers}
        />
        <canvas ref={setHoverCanvas} style={hoverLayerStyle} />
      </div>
    </div>
  )
})

const FacetPanels = observer(function FacetPanels({
  model,
  handlers,
  canvasStyle,
}: {
  model: GraphPaneModel
  handlers: PaneHandlers
  canvasStyle: React.CSSProperties
}) {
  const panels = model.facetPanels
  const grid = model.facetGrid
  const place = model.facetPlacement
  if (!panels || !grid || !place) {
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
        background: PAPER_CSS,
      }}
    >
      {panels.map((lift, i) => (
        <FacetPanel
          key={lift.walks[0]!.name}
          model={model}
          lift={lift}
          width={width}
          height={height}
          cell={{
            gridRow: Math.floor(place.cells[i]! / columns) + 1,
            gridColumn: (place.cells[i]! % columns) + 1,
          }}
          handlers={handlers}
          canvasStyle={canvasStyle}
        />
      ))}
      <div
        style={{
          ...keyStyle,
          gridRow: Math.floor(Math.max(...place.cells) / columns) + 2,
        }}
        data-testid="graph-facet-key"
      >
        {facetKeyRows(model).map(row => (
          <LegendRowView key={row.key} row={row} />
        ))}
      </div>
    </div>
  )
})

export default FacetPanels
