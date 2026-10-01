import { useEffect, useState } from 'react'

import { FACET_GAP_PX, FACET_TITLE_PX } from '@jbrowse/bandage-core/facetGrid'
import { Canvas2DRenderer } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'
import { autorun, computed } from 'mobx'
import { observer } from 'mobx-react'

import WalkKey from './WalkKey'
import { useWheelZoom } from './usePaneGestures'

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

const FacetPanel = observer(function FacetPanel({
  model,
  lift,
  width,
  height,
  cell,
  handlers,
}: {
  model: GraphPaneModel
  lift: WalkLift
  width: number
  height: number
  cell: { gridRow: number; gridColumn: number }
  handlers: PaneHandlers
}) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const walk = lift.walks[0]!
  useWheelZoom(canvas, model)

  useEffect(() => {
    if (!canvas) {
      return undefined
    }
    const renderer = new Canvas2DRenderer(canvas)
    renderer.resize(width, height)
    const drawing = computed(() => model.buildDrawing(lift, false))
    let uploaded: ReturnType<typeof model.buildDrawing>
    const dispose = autorun(() => {
      const built = drawing.get()
      if (!built) {
        return
      }
      if (built !== uploaded) {
        renderer.uploadGeometry(built.batch)
        uploaded = built
      }
      model.applyHighlights(renderer)
      model.paint(renderer)
    })
    return () => {
      dispose()
      renderer.dispose()
    }
  }, [canvas, model, lift, width, height])

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
        <WalkKey
          walk={walk}
          label={label}
          reference={model.walkReference}
          hint={`click to lift ${label} alone`}
          at={model.hoveredOn(walk)}
        />
      </button>
      <canvas
        ref={setCanvas}
        data-testid="graph-facet-canvas"
        style={{
          width,
          height,
          display: 'block',
          cursor: model.isPanning || model.draggingNode ? 'grabbing' : 'grab',
        }}
        {...handlers}
      />
    </div>
  )
})

const FacetPanels = observer(function FacetPanels({
  model,
  handlers,
}: {
  model: GraphPaneModel
  handlers: PaneHandlers
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
        background: model.darkMode ? '#1f1f1f' : 'white',
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
        />
      ))}
    </div>
  )
})

export default FacetPanels
