import { useEffect, useRef } from 'react'

import { LEGEND_INSET_PX } from '@jbrowse/bandage-core/labelLayout'
import { ErrorBanner, LoadingOverlay } from '@jbrowse/core/ui'
import { isAlive } from '@jbrowse/mobx-state-tree'
import { useRenderingBackend } from '@jbrowse/render-core/useRenderingBackend'
import { observer } from 'mobx-react'

import BubbleHalos from './BubbleHalos'
import FacetPanels from './FacetPanels'
import GenePins from './GenePins'
import GraphToolbar from './GraphToolbar'
import HoverLayer from './HoverLayer'
import HoverTooltip from './HoverTooltip'
import LabelLayer from './LabelLayer'
import { LegendPanel } from './Legend'
import PaneContextMenu from './PaneContextMenu'
import { PaneSvgLayer } from './PaneLayer'
import ReferenceStripOverlay from './ReferenceStripOverlay'
import TubeMapOverlay from './TubeMapOverlay'
import WalkRowsOverlay from './WalkRowsOverlay'
import WalkStrip from './WalkStrip'
import WalkStripLocator from './WalkStripLocator'
import { usePaneGestures, useWheelZoom } from './usePaneGestures'
import { PAPER_CSS } from '../pane/paneBase'
import { createGraphRenderer } from '../renderer/GraphRenderer'

import type { GraphPaneModel } from '../model'

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
// allele happens to branch.
//
// Keyed on the row, not on the label: two rows can have the same words. The
// sample-row layout names row 0 for the assembly the backbone comes from and
// the rows below it for the samples contributing alleles, and a diploid
// reference is in both lists — one haplotype is the reference path, the other
// walks alleles of its own, and `parsePanSN` reduces both to one sample name.
const RowLabels = observer(function RowLabels({
  model,
}: {
  model: GraphPaneModel
}) {
  return (
    <>
      {model.visibleRowLabels.map(({ label, y, top }) => (
        <div
          key={y}
          data-testid="graph-row-label"
          style={{ ...rowLabelStyle, top }}
        >
          {label}
        </div>
      ))}
    </>
  )
})

// Top RIGHT: the row labels own the left edge and the hover tooltip owns the
// bottom right, so this is the one corner nothing else claims. Every key
// stretches to the widest, so together they read as one panel. It takes the
// pointer, for its rows' titles and its close button.
const legendStackStyle = {
  position: 'absolute' as const,
  top: LEGEND_INSET_PX,
  right: LEGEND_INSET_PX,
  display: 'flex',
  flexDirection: 'column' as const,
  borderRadius: 3,
  overflow: 'hidden' as const,
  zIndex: 4,
}

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

// Measures itself for the model, so no label is placed under a legend and
// none gives way to one that is not drawn.
//
// At rest only, and again on returning to rest: a hover's walk keys would
// otherwise refit the view, and the refit clears the hover that grew them
export const Legends = observer(function Legends({
  model,
}: {
  model: GraphPaneModel
}) {
  const ref = useRef<HTMLDivElement>(null)
  const atRest = model.legendAtRest
  useEffect(() => {
    const el = ref.current
    if (!el || !atRest) {
      return
    }
    // the last callback can land after the track is closed
    const measure = () => {
      if (isAlive(model) && model.legendAtRest) {
        model.setLegendSize({ width: el.offsetWidth, height: el.offsetHeight })
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [model, atRest])
  return (
    <div
      ref={ref}
      style={{
        ...legendStackStyle,
        top: LEGEND_INSET_PX + model.referenceStripZonePx,
      }}
    >
      <LegendPanel model={model} />
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
      {/* under the labels (z 3), so a leader runs beneath the text it points
          from; the placement culls a label past the canvas edge, so the
          layer leaves overflow visible */}
      {leaders.length > 0 ? (
        <PaneSvgLayer model={model} zIndex={2} overflow="visible">
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
        </PaneSvgLayer>
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
  const { handlers, canvasStyle, contextMenu, closeContextMenu, hoveredChip } =
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
              background: PAPER_CSS,
            }}
          />
        ) : null}
        <canvas
          ref={canvasRef}
          data-testid="graph-genome-canvas"
          style={{
            ...canvasStyle,
            width: model.paneWidth,
            height: model.canvasHeight,
            display: 'block',
            position: 'relative',
            zIndex: 1,
          }}
          {...handlers}
        />

        {faceted ? (
          <FacetPanels
            model={model}
            handlers={handlers}
            canvasStyle={canvasStyle}
          />
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

        <HoverTooltip model={model} chip={hoveredChip} />
      </div>

      {model.walkStripShown ? <WalkStrip model={model} /> : null}

      <PaneContextMenu
        model={model}
        at={contextMenu}
        onClose={closeContextMenu}
      />

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
