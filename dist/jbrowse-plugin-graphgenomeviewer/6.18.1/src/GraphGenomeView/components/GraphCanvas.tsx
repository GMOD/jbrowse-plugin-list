import { useEffect, useRef } from 'react'

import { formatBp } from '@jbrowse/bandage-core/graphLabels'
import { edgeHoverText } from '@jbrowse/bandage-core/hoverText'
import { LEGEND_INSET_PX } from '@jbrowse/bandage-core/labelLayout'
import { RAMP_GRADIENT_CSS } from '@jbrowse/bandage-core/referenceRampCss'
import {
  LIFT_BACKDROP_CSS,
  REFERENCE_RAMP_ALT_CSS,
} from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { ErrorBanner, LoadingOverlay, Menu } from '@jbrowse/core/ui'
import { isAlive } from '@jbrowse/mobx-state-tree'
import { useRenderingBackend } from '@jbrowse/render-core/useRenderingBackend'
import InfoIcon from '@mui/icons-material/Info'
import { observer } from 'mobx-react'

import BubbleHalos, { HaloLegend } from './BubbleHalos'
import FacetPanels from './FacetPanels'
import GenePins, { EXON_COLOR } from './GenePins'
import GraphToolbar from './GraphToolbar'
import HoverLayer from './HoverLayer'
import LabelLayer from './LabelLayer'
import ReferenceStripOverlay, {
  ReferenceStripLegend,
} from './ReferenceStripOverlay'
import TubeMapOverlay, { TubeMapLegend } from './TubeMapOverlay'
import UnpopButton from './UnpopButton'
import WalkKey, { walkSwatchStyle } from './WalkKey'
import { WalkRowContextMenu } from './WalkRowContextMenu'
import WalkRowsOverlay, { WalkRowsLegend } from './WalkRowsOverlay'
import WalkStrip from './WalkStrip'
import WalkStripLocator from './WalkStripLocator'
import { UNPLACED_SWATCH, legendBoxStyle, legendRowStyle } from './legendStyles'
import { usePaneGestures, useWheelZoom } from './usePaneGestures'
import { locLabel, nodeOwnLocation } from '../../launchFromGraph/contributors'
import { nodeLaunchMenuItems } from '../../launchFromGraph/graphMenuItems'
import { createGraphRenderer } from '../renderer/GraphRenderer'

import type { GraphPaneModel } from '../model'

// Bottom RIGHT, not bottom left: the row labels of a row-structured layout are
// pinned to the left edge, so a bottom-left tooltip lands on top of them and
// covers the one thing that says which haplotype a row is. Nothing is drawn
// against the right edge.
const tooltipStyle = {
  position: 'absolute' as const,
  bottom: 8,
  right: 8,
  background: 'rgba(0,0,0,0.75)',
  color: 'white',
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 12,
  pointerEvents: 'none' as const,
  zIndex: 6,
}

const wrapperStyle = { position: 'relative' as const }

// The overlay origin has to be the canvas, not the wrapper: the wrapper also
// holds the toolbar, so anything positioned against it is offset by the
// toolbar's height, and a row label lands a whole row off the row it names.
const canvasAreaStyle = {
  position: 'relative' as const,
  lineHeight: 0,
  isolation: 'isolate' as const,
}

// Under a transparent canvas, from below the reference strip down, so the
// linear view's gridlines show only behind the strip
const paperStyle = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
}

// Above the labels, pins and legends drawn over the canvas, and with the line
// height the canvas area zeroes, which would collapse the overlay's label
const loadingLayerStyle = {
  position: 'absolute' as const,
  inset: 0,
  zIndex: 10,
  lineHeight: 'normal',
  pointerEvents: 'none' as const,
}

const rowLabelStyle = {
  position: 'absolute' as const,
  left: 6,
  transform: 'translateY(-50%)',
  background: 'rgba(255,255,255,0.82)',
  padding: '0 4px',
  borderRadius: 3,
  fontSize: 11,
  // explicit, because the canvas container zeroes line-height to kill the
  // inline-block gap under the canvas. Inherited, that collapses the label to a
  // zero-height box: it still paints, but it has no layout, so anything asking
  // whether it is visible (a screenshot spec's waitForVisible, a11y tooling)
  // is told no.
  lineHeight: '16px',
  whiteSpace: 'nowrap' as const,
  pointerEvents: 'none' as const,
  zIndex: 4,
}

// Names the rows of a row-structured layout (anchored, sample rows). Without
// them the layout draws real structure that cannot be read: a stack of bars
// where every row means something and nothing says what.
//
// Positioned from the layout's own `rowLabels` through the same transform the
// canvas draws with, so a label tracks its row across pan and zoom instead of
// sitting at a measured pixel. It therefore has to be mounted in the canvas's
// own positioning context (canvasAreaStyle) — against the wrapper it picks up
// the toolbar's height and names the wrong row. Pinned to the left edge rather
// than to the row's own x, because a row's leftmost node is wherever its first
// allele happens to branch. Rows scrolled out of the canvas are dropped rather
// than clamped to the edge, so a label never points at a row that is not
// there.
const RowLabels = observer(function RowLabels({
  model,
}: {
  model: GraphPaneModel
}) {
  const rowLabels = model.drawnRowLabels
  return (
    <>
      {rowLabels.map(({ label, y }) => {
        const screenY = y * model.scaleY + model.translateY
        return screenY >= 0 && screenY <= model.canvasHeight ? (
          // Keyed on the row, not on the label: two rows can carry the same
          // words. The sample-row layout names row 0 for the assembly the
          // backbone comes from and the rows below it for the samples
          // contributing alleles, and a diploid reference is in both lists —
          // one haplotype is the reference path, the other walks alleles of its
          // own, and `parsePanSN` reduces both to one sample name.
          <div
            key={y}
            data-testid="graph-row-label"
            style={{ ...rowLabelStyle, top: screenY }}
          >
            {label}
          </div>
        ) : null
      })}
    </>
  )
})

// Top RIGHT: the row labels own the left edge and the hover tooltip owns the
// bottom right, so this is the one corner nothing else claims. A row-structured
// layout draws its band across the middle, which is what the keys are for. The
// two keys stack rather than each claiming the corner, since a path-coloured
// graph can also be reference-position coloured.
const legendStackStyle = {
  position: 'absolute' as const,
  top: LEGEND_INSET_PX,
  right: LEGEND_INSET_PX,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-end',
  gap: 4,
  pointerEvents: 'none' as const,
  zIndex: 4,
}

const pathSwatchStyle = { width: 18, height: 3, borderRadius: 2 }

// Which haplotype each ribbon colour is. The ribbons are one stroke per path
// fanned across every edge the path crosses, so without this the drawing states
// that the alleles are taken by *different* samples and never which.
const PathLegend = observer(function PathLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  const { pathLegend } = model
  return pathLegend.length > 0 ? (
    <div style={legendBoxStyle} data-testid="graph-path-legend">
      {pathLegend.map(({ name, label, color }) => (
        <div key={name} style={legendRowStyle}>
          <div style={{ ...pathSwatchStyle, backgroundColor: color }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  ) : null
})

// Each lifted walk's key, then what the faded rest is
const WalkReadout = observer(function WalkReadout({
  model,
}: {
  model: GraphPaneModel
}) {
  const lift = model.walkLift
  if (!lift) {
    return null
  }
  return (
    <div style={legendBoxStyle} data-testid="graph-walk-readout">
      {lift.walks.map(w => (
        <WalkKey
          key={w.name}
          walk={w}
          label={model.walkLabel(w.name)}
          reference={model.walkReference}
          at={model.hoveredOn(w)}
        />
      ))}
      {/* the ramp's own key, which names this, is off while walks are lifted */}
      {model.liftPaintsOffReference ? <OffReferenceRow /> : null}
      <div style={legendRowStyle}>
        <div style={{ ...walkSwatchStyle, background: LIFT_BACKDROP_CSS }} />
        <span>not on {model.liftedWalksLabel}</span>
      </div>
    </div>
  )
})

// The reference-position ramp, as a strip labelled with the interval it runs
// over. Nothing on screen used to say that red-to-magenta means left-to-right of
// the cut window, so two tutorials carried that sentence in prose and a reader
// arriving at a figure had no way to know it at all.
const rampStripStyle = {
  minWidth: 90,
  height: 8,
  borderRadius: 2,
  background: RAMP_GRADIENT_CSS,
}

const rampEndsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
}

const ReferenceRampLegend = observer(function ReferenceRampLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  // under lifted walks each lane states its own scale, and the rest is grey
  const domain = model.walkLift ? undefined : model.referenceRampDomain
  const { offReference, unplaced } = model.referenceRampOffKeys
  // a measured domain runs between node midpoints, which can fall on a half bp
  const start = Math.round(domain?.start ?? 0)
  const end = Math.round(domain?.end ?? 0)
  return domain ? (
    <div style={legendBoxStyle} data-testid="graph-ramp-legend">
      <div style={rampStripStyle} />
      <div style={rampEndsStyle}>
        <span>{start.toLocaleString()}</span>
        <span>({formatBp(end - start)})</span>
        <span>{end.toLocaleString()}</span>
      </div>
      {offReference ? <OffReferenceRow /> : null}
      {unplaced ? (
        <div style={legendRowStyle}>
          <div style={{ ...walkSwatchStyle, background: UNPLACED_SWATCH }} />
          <span>no reference position</span>
        </div>
      ) : null}
    </div>
  ) : null
})

// The charcoal both the ramp and a lane coloured by reference position give
// sequence the reference does not carry
function OffReferenceRow() {
  return (
    <div style={legendRowStyle}>
      <div style={{ ...walkSwatchStyle, background: REFERENCE_RAMP_ALT_CSS }} />
      <span>off the reference</span>
    </div>
  )
}

const exonSwatchStyle = {
  ...walkSwatchStyle,
  border: `2px solid ${EXON_COLOR}`,
  borderRadius: 5,
  boxSizing: 'border-box' as const,
}

const FoldLegend = observer(function FoldLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  const note = model.foldNote
  return note ? (
    <div style={legendBoxStyle} data-testid="graph-fold-legend">
      <span>{note}</span>
    </div>
  ) : null
})

const GeneLegend = observer(function GeneLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  return model.genePins.some(pin => pin.exonsByNode.length > 0) ? (
    <div style={legendBoxStyle} data-testid="graph-gene-legend">
      <div style={legendRowStyle}>
        <div style={exonSwatchStyle} />
        <span>exon</span>
      </div>
    </div>
  ) : null
})

const nodeLabelStyle = {
  position: 'absolute' as const,
  transform: 'translate(-50%, -50%)',
  background: 'rgba(255,255,255,0.78)',
  padding: '0 3px',
  borderRadius: 3,
  fontSize: 10,
  lineHeight: '13px',
  whiteSpace: 'nowrap' as const,
  pointerEvents: 'none' as const,
  zIndex: 3,
}

// Matches EDGE_DELETION_COLOR, so the words and the arc they name are one thing.
const deletionLabelStyle = {
  ...nodeLabelStyle,
  color: '#18181c',
  fontWeight: 600,
}

// Under the labels (z 3) and over the canvas, so a leader runs beneath the text
// it points from rather than across it. `overflow: visible` because a label
// displaced past the canvas edge is culled by the placement, not clipped here.
const leaderStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'visible' as const,
  zIndex: 2,
}

// Measures itself for the model, so no label is placed under a legend and
// none gives way to one that is not drawn.
//
// At rest only: the walk keys' hover readout would otherwise refit the view,
// and the refit clears the hover that grew it
const Legends = observer(function Legends({
  model,
}: {
  model: GraphPaneModel
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    // the last callback can land after the track is closed
    const observer = new ResizeObserver(() => {
      if (isAlive(model) && model.hoveredNode === null) {
        model.setLegendSize({ width: el.offsetWidth, height: el.offsetHeight })
      }
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [model])
  return (
    <div
      ref={ref}
      style={{
        ...legendStackStyle,
        top: LEGEND_INSET_PX + model.referenceStripZonePx,
      }}
    >
      <ReferenceRampLegend model={model} />
      <ReferenceStripLegend model={model} />
      <HaloLegend model={model} />
      <GeneLegend model={model} />
      <FoldLegend model={model} />
      <PathLegend model={model} />
      <TubeMapLegend model={model} />
      <WalkRowsLegend model={model} />
      <WalkReadout model={model} />
    </div>
  )
})

// Writes each drawn thing's size onto it, which is what Bandage's Length label
// does and what the tooltip alone could not: a graph you have to hover to read
// is a graph nobody reads. graphLabels applies the same transform the canvas
// draws with — so a label tracks its node across pan and zoom — and decides
// which labels fit; this only paints them, mounted in the canvas's own
// positioning context for the reason RowLabels is.
const GraphSizeLabels = observer(function GraphSizeLabels({
  model,
}: {
  model: GraphPaneModel
}) {
  const labels = model.overlayLabels.sizes
  // A label too wide for the arc it names is placed clear of it and tethered
  // back; nothing else in the drawing carries one.
  const leaders = labels.flatMap(({ key, leader }) =>
    leader ? [{ key, ...leader }] : [],
  )
  return (
    <>
      {leaders.length > 0 ? (
        <svg
          style={leaderStyle}
          width={model.paneWidth}
          height={model.canvasHeight}
        >
          {leaders.map(({ key, arcX, arcY, labelX, labelY }) => (
            <line
              key={key}
              data-testid="graph-label-leader"
              x1={arcX}
              y1={arcY}
              x2={labelX}
              y2={labelY}
              stroke="#18181c"
              strokeWidth={1}
            />
          ))}
        </svg>
      ) : null}
      {labels.map(({ key, text, x, y, kind }) => (
        <div
          key={key}
          data-testid="graph-size-label"
          style={{
            ...(kind === 'deletion' ? deletionLabelStyle : nodeLabelStyle),
            left: x,
            top: y,
          }}
        >
          {text}
        </div>
      ))}
    </>
  )
})

const HoverTooltips = observer(function HoverTooltips({
  model,
}: {
  model: GraphPaneModel
}) {
  const hoveredNodeData = model.hoveredNode
    ? model.hoverNodeById?.get(model.hoveredNode)
    : null
  const merged = model.hoveredNode
    ? model.hoverDrawing?.members.get(model.hoveredNode)
    : undefined

  const hoveredEdgeData =
    model.hoveredEdge !== null && model.graph
      ? model.graph.edges[model.hoveredEdge]
      : null

  const ownLocation = hoveredNodeData
    ? nodeOwnLocation(hoveredNodeData)
    : undefined

  const hoveredEdgeText = hoveredEdgeData
    ? edgeHoverText(
        hoveredEdgeData,
        model.deletions.find(d => d.edgeIndex === model.hoveredEdge),
        id => model.nodeById?.get(id)?.name ?? id,
      )
    : undefined

  const walkRow = model.hoveredWalkRowText
  const tube = model.hoveredTubeText

  return (
    <>
      {tube && !hoveredNodeData ? (
        <div style={tooltipStyle} data-testid="graph-tube-tooltip">
          <strong>{tube.label}</strong> — {tube.readout}
        </div>
      ) : null}
      {walkRow && !hoveredNodeData ? (
        <div style={tooltipStyle} data-testid="graph-walk-row-tooltip">
          <strong>{walkRow.label}</strong> — {walkRow.readout}
        </div>
      ) : null}
      {hoveredNodeData ? (
        <div style={tooltipStyle}>
          <strong>{hoveredNodeData.name}</strong>
          {merged ? ` and ${merged.length - 1} more` : ''} —{' '}
          {hoveredNodeData.length.toLocaleString()} bp, depth{' '}
          {hoveredNodeData.depth.toFixed(1)}
          {/* Which assembly contributed this segment, and where it sits on it.
              rGFA states both, and until now neither reached the screen: the
              node was a bare id in a picture. */}
          {ownLocation ? (
            <>
              <br />
              {ownLocation.sample} {locLabel(ownLocation)} (rank{' '}
              {hoveredNodeData.stable?.rank})
            </>
          ) : null}
        </div>
      ) : null}
      {hoveredEdgeText ? (
        <div style={tooltipStyle}>
          {/* A deletion edge is the one link that means something on its own —
              the backbone it skips is sequence some haplotype does not carry —
              so it says how much rather than just naming its endpoints. */}
          {hoveredEdgeText.deletion ? (
            <>
              <strong>Deletion</strong> {hoveredEdgeText.deletion.bp}
              <br />
              {hoveredEdgeText.deletion.where}
            </>
          ) : (
            <>Edge: {hoveredEdgeText.ends}</>
          )}
        </div>
      ) : null}
    </>
  )
})

// Flat rather than under a "Launch view" submenu: this menu is two or three
// items long and every one of them is contextual to the node just clicked. The
// submenu grouping earns its keep in the long view and track menus.
const NodeContextMenu = observer(function NodeContextMenu({
  model,
  nodeId,
  top,
  left,
  onClose,
}: {
  model: GraphPaneModel
  nodeId: string
  top: number
  left: number
  onClose: () => void
}) {
  const { own, reference, highlight } = model.nodeLaunchTargets(nodeId)
  return (
    <Menu
      open
      anchorReference="anchorPosition"
      anchorPosition={{ top, left }}
      onClose={() => {
        onClose()
      }}
      onMenuItemClick={callback => {
        callback()
      }}
      menuItems={[
        {
          label: 'Node details',
          icon: InfoIcon,
          onClick: () => {
            model.showNodeDetails(nodeId)
          },
        },
        ...nodeLaunchMenuItems({
          own,
          reference,
          highlight,
          onShowLinear: target => {
            model.showInLinearView(target)
          },
          onHighlight: model.canHighlightInLinearView
            ? target => {
                model.highlightInLinearView(target)
              }
            : undefined,
        }),
      ]}
    />
  )
})

// `ownChrome` false for a pane inside a track, whose controls, loading state
// and errors are the track's. A hosted pane whose x the host places takes no pan or wheel of its
// own: those are the linear view's, as on any other track. One drawing its
// own coordinates inside a track keeps them, and keeps them from the view.
const GraphCanvas = observer(function GraphCanvas({
  model,
  ownChrome = true,
}: {
  model: GraphPaneModel
  ownChrome?: boolean
}) {
  const {
    canvasRef,
    canvas,
    error: renderError,
    retry: retryRender,
  } = useRenderingBackend(createGraphRenderer, model)
  const { handlers, contextNode, contextRow, closeContextMenu } =
    usePaneGestures(model)
  useWheelZoom(canvas, model)
  const faceted = model.facetPanels !== undefined

  return (
    <div style={wrapperStyle}>
      {ownChrome ? <GraphToolbar model={model} /> : null}

      <div
        style={canvasAreaStyle}
        onMouseEnter={() => {
          model.setPointerInPane(true)
        }}
        onMouseLeave={() => {
          if (isAlive(model)) {
            model.setPointerInPane(false)
          }
        }}
      >
        {model.referenceStripShown ? (
          <div
            style={{
              ...paperStyle,
              top: model.referenceStripZonePx,
              background: model.paperCss,
            }}
          />
        ) : null}
        <canvas
          ref={canvasRef}
          data-testid="graph-genome-canvas"
          style={{
            width: model.paneWidth,
            height: model.canvasHeight,
            cursor: model.isPanning || model.draggingNode ? 'grabbing' : 'grab',
            // a pane the linear view drags leaves a finger its scroll
            touchAction: model.hostPlacesX ? 'auto' : 'none',
            overscrollBehavior: 'contain',
            display: 'block',
            position: 'relative',
            zIndex: 1,
          }}
          {...handlers}
        />

        {faceted ? (
          <FacetPanels model={model} handlers={handlers} />
        ) : (
          <>
            <TubeMapOverlay model={model} />
            <HoverLayer model={model} />
            <ReferenceStripOverlay model={model} />
            <RowLabels model={model} />
            <GraphSizeLabels model={model} />
            <BubbleHalos model={model} />
            <GenePins model={model} />
            <LabelLayer model={model} />
            <WalkRowsOverlay model={model} />
            <WalkStripLocator model={model} />
            <Legends model={model} />
          </>
        )}
        <UnpopButton model={model} />

        {ownChrome ? (
          <div style={loadingLayerStyle}>
            <LoadingOverlay
              isVisible={model.isLoading}
              immediate={!model.layoutResult}
              statusMessage={model.statusMessage}
              onCancel={
                model.canCancelLoad
                  ? () => {
                      model.cancelLoad()
                    }
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>

      {model.walkStripShown ? <WalkStrip model={model} /> : null}

      <HoverTooltips model={model} />

      {contextNode ? (
        <NodeContextMenu
          model={model}
          nodeId={contextNode.nodeId}
          top={contextNode.top}
          left={contextNode.left}
          onClose={closeContextMenu}
        />
      ) : null}

      {contextRow ? (
        <WalkRowContextMenu
          model={model}
          row={contextRow.row}
          top={contextRow.top}
          left={contextRow.left}
          onClose={closeContextMenu}
        />
      ) : null}

      {renderError ? (
        <ErrorBanner error={renderError} onReset={retryRender} />
      ) : null}

      {ownChrome && model.error ? (
        <ErrorBanner
          error={model.error}
          onReset={
            model.canRetryLoad
              ? () => {
                  model.retryLoad()
                }
              : undefined
          }
        />
      ) : null}
    </div>
  )
})

export default GraphCanvas
