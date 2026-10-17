import { FACET_GAP_PX, FACET_TITLE_PX } from '@jbrowse/bandage-core/facetGrid'
import { LEGEND_INSET_PX } from '@jbrowse/bandage-core/labelLayout'
import { LABEL_CHAR_PX } from '@jbrowse/bandage-core/overlayLabels'
import { Canvas2DRenderer } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'
import { svgCanvas } from '@jbrowse/bandage-core/renderer/svgCanvas'
import { PaintLayer } from '@jbrowse/core/util/paintLayer'

import BubbleHalos from './BubbleHalos'
import GenePins from './GenePins'
import LabelLayer from './LabelLayer'
import { SvgSwatch } from './LegendSwatch'
import { paintReferenceStrip } from './ReferenceStripOverlay'
import { paintTubeMap } from './TubeMapOverlay'
import WalkRowsOverlay from './WalkRowsOverlay'
import {
  facetKeyRows,
  legendSections,
  swatchWidth,
  walkKeyRow,
} from '../legendSections'

import type { LegendRow } from '../legendSections'
import type { GraphPaneModel } from '../model'
import type { WalkLift } from '@jbrowse/bandage-core/walkHighlight'
import type { Ctx2D } from '@jbrowse/core/util/paintLayer'

const FONT = { fontFamily: 'sans-serif', fontSize: 11 }
const ROW_PX = 16
const RASTER_SCALE = 2

const asCanvasCtx = (ctx: Ctx2D) => ctx as CanvasRenderingContext2D

// The drawing's nodes and edges through the pane's own transform, so the
// export lines up with the linear view's ruler wherever the screen does
function Body({
  model,
  lift,
  drawPaths,
  width,
  height,
  rasterize,
}: {
  model: GraphPaneModel
  lift: WalkLift | undefined
  drawPaths: boolean
  width: number
  height: number
  rasterize: boolean
}) {
  const built = model.buildDrawing(lift, drawPaths)
  if (!built) {
    return null
  }
  const k = rasterize ? RASTER_SCALE : 1
  const vector = rasterize ? undefined : svgCanvas(width, height)
  const canvas = vector?.canvas ?? document.createElement('canvas')
  if (!vector) {
    canvas.width = Math.round(width * k)
    canvas.height = Math.round(height * k)
  }
  const { scaleX, scaleY, translateX, translateY } = model.screenTransform
  const renderer = new Canvas2DRenderer(canvas)
  renderer.uploadGeometry(built.batch)
  renderer.updateTransform({
    scaleX: scaleX * k,
    scaleY: scaleY * k,
    translateX: translateX * k,
    translateY: translateY * k,
    dpr: k,
  })
  renderer.render([0, 0, 0, 0])
  return vector ? (
    <svg width={width} height={height} overflow="hidden">
      <g dangerouslySetInnerHTML={{ __html: vector.markup() }} />
    </svg>
  ) : (
    <image width={width} height={height} href={canvas.toDataURL('image/png')} />
  )
}

interface KeyRow {
  key: string
  width: number
  height: number
  draw: (left: number) => React.ReactNode
}

// A legend row as the screen lays it out: its swatch, then its words, the
// line under it if any; a note is grey words alone
function svgRow(row: LegendRow, id: string): KeyRow {
  if (!row.swatch) {
    return {
      key: row.key,
      width: row.label.length * LABEL_CHAR_PX,
      height: ROW_PX,
      draw: left => (
        <text key={row.key} {...FONT} x={left} y={0} fill="#666">
          {row.label}
        </text>
      ),
    }
  }
  const swatch = row.swatch
  const sw = swatchWidth(swatch)
  const words = (row.strong ?? '') + row.label
  return {
    key: row.key,
    width: Math.max(
      sw + 5 + words.length * LABEL_CHAR_PX,
      (row.under?.length ?? 0) * LABEL_CHAR_PX,
    ),
    height: row.under ? ROW_PX * 2 : ROW_PX,
    draw: left => (
      <g key={row.key} {...FONT}>
        <SvgSwatch swatch={swatch} x={left} id={id} />
        <text x={left + sw + 5} y={0}>
          {row.strong ? <tspan fontWeight="bold">{row.strong}</tspan> : null}
          {row.label}
        </text>
        {row.under ? (
          <text x={left} y={ROW_PX}>
            {row.under}
          </text>
        ) : null}
      </g>
    ),
  }
}

// The screen's legend panel, section by section
function Keys({
  model,
  idPrefix,
}: {
  model: GraphPaneModel
  idPrefix: string
}) {
  const sections = legendSections(model).map(({ testid, rows }) =>
    rows.map((row, i) => svgRow(row, `${idPrefix}-${testid}-${i}`)),
  )
  if (sections.length === 0) {
    return null
  }
  const pad = 6
  const rows = sections.flat()
  const boxWidth = Math.max(...rows.map(r => r.width)) + pad * 2
  const boxHeight =
    rows.reduce((sum, r) => sum + r.height, 0) + sections.length * pad
  const right = model.paneWidth - LEGEND_INSET_PX
  const left = right - boxWidth + pad
  const top = LEGEND_INSET_PX + model.referenceStripZonePx
  const placed: { row: KeyRow; y: number }[] = []
  let y = top + 12 - pad / 2
  for (const section of sections) {
    y += pad
    for (const row of section) {
      placed.push({ row, y })
      y += row.height
    }
  }
  return (
    <g data-testid="graph-svg-keys">
      <rect
        x={left - pad}
        y={top}
        width={boxWidth}
        height={boxHeight}
        rx={3}
        fill="#fff"
        fillOpacity={0.82}
      />
      {placed.map(({ row, y }) => (
        <g key={row.key} transform={`translate(0 ${y})`}>
          {row.draw(left)}
        </g>
      ))}
    </g>
  )
}

// Words on a pale rounded backing, as the screen's labels sit
function Chip({
  x,
  y,
  text,
  fontSize,
  anchor,
  bold,
}: {
  x: number
  y: number
  text: string
  fontSize: number
  anchor: 'start' | 'middle'
  bold?: boolean
}) {
  const w = text.length * fontSize * 0.56 + 6
  const left = anchor === 'middle' ? x - w / 2 : x - 3
  return (
    <>
      <rect
        x={left}
        y={y - fontSize * 0.65}
        width={w}
        height={fontSize * 1.3}
        rx={3}
        fill="#fff"
        fillOpacity={0.8}
      />
      <text
        x={x}
        y={y + fontSize * 0.35}
        textAnchor={anchor}
        fontSize={fontSize}
        fontWeight={bold ? 600 : undefined}
        fill="#18181c"
      >
        {text}
      </text>
    </>
  )
}

// The node and deletion lengths written on the drawing, with their leaders
function SizeLabels({ model }: { model: GraphPaneModel }) {
  return (
    <g fontFamily={FONT.fontFamily}>
      {model.overlayLabels.sizes.map(({ key, text, x, y, kind, leader }) => (
        <g key={key}>
          {leader ? (
            <line
              x1={leader.arcX}
              y1={leader.arcY}
              x2={leader.labelX}
              y2={leader.labelY}
              stroke="#18181c"
            />
          ) : null}
          <Chip
            x={x}
            y={y}
            text={text}
            fontSize={10}
            anchor="middle"
            bold={kind === 'deletion'}
          />
        </g>
      ))}
    </g>
  )
}

function RowLabels({ model }: { model: GraphPaneModel }) {
  return (
    <g fontFamily={FONT.fontFamily}>
      {model.visibleRowLabels.map(({ label, y, top }) => (
        <Chip
          key={y}
          x={10}
          y={top}
          text={label}
          fontSize={11}
          anchor="start"
        />
      ))}
    </g>
  )
}

// Each lifted walk in a panel of its own, its key as the panel's title
function Facets({
  model,
  rasterize,
  idPrefix,
}: {
  model: GraphPaneModel
  rasterize: boolean
  idPrefix: string
}) {
  const panels = model.facetPanels
  const grid = model.facetGrid
  const place = model.facetPlacement
  if (!panels || !grid || !place) {
    return null
  }
  const { columns, width, height } = grid
  const keyY = grid.total + FACET_GAP_PX + 14
  const key = facetKeyRows(model).map((row, i) =>
    svgRow(row, `${idPrefix}-facet-key-${i}`),
  )
  const keyX = key.map((_, i) =>
    key.slice(0, i).reduce((x, row) => x + row.width + 14, 6),
  )
  return (
    <>
      <g transform={`translate(0 ${keyY})`}>
        {key.map((row, i) => row.draw(keyX[i]!))}
      </g>
      {panels.map((lift, i) => {
        const cell = place.cells[i]!
        const x = (cell % columns) * (width + FACET_GAP_PX)
        const y =
          Math.floor(cell / columns) * (FACET_TITLE_PX + height + FACET_GAP_PX)
        const walk = lift.walks[0]!
        const title = svgRow(walkKeyRow(model, walk), `${idPrefix}-facet-${i}`)
        return (
          <g key={walk.name} transform={`translate(${x} ${y})`}>
            <g transform={`translate(0 ${ROW_PX - 2})`}>{title.draw(6)}</g>
            <g transform={`translate(0 ${FACET_TITLE_PX})`}>
              <Body
                model={model}
                lift={lift}
                drawPaths={false}
                width={width}
                height={height}
                rasterize={rasterize}
              />
            </g>
          </g>
        )
      })}
    </>
  )
}

// The pane as the screen draws it, for the linear view's SVG export: the
// canvas's ink, the tube map and reference strip painters, and the SVG
// overlays the screen mounts over them. Hover and selection are left out.
export default function PaneSvg({
  model,
  rasterize = false,
  idPrefix,
}: {
  model: GraphPaneModel
  rasterize?: boolean
  idPrefix: string
}) {
  const width = model.paneWidth
  const height = model.canvasHeight
  const tubeMap = !!model.layoutResult?.tubeMap
  const opts = { rasterizeLayers: rasterize }
  return (
    <g data-testid="graph-pane-svg">
      {model.facetPanels ? (
        <Facets model={model} rasterize={rasterize} idPrefix={idPrefix} />
      ) : tubeMap ? (
        <PaintLayer
          width={width}
          height={height}
          opts={opts}
          paint={ctx => {
            paintTubeMap(asCanvasCtx(ctx), model, { highlightNode: null })
          }}
        />
      ) : (
        <Body
          model={model}
          lift={model.drawnHighlight}
          drawPaths={model.effectiveDrawPaths}
          width={width}
          height={height}
          rasterize={rasterize}
        />
      )}
      {/* in the screen's stacking order, bottom first */}
      {model.facetPanels ? null : (
        <>
          <BubbleHalos model={model} />
          <GenePins model={model} />
          <SizeLabels model={model} />
          <LabelLayer model={model} />
          <WalkRowsOverlay model={model} vector />
          <RowLabels model={model} />
        </>
      )}
      {model.referenceStripShown ? (
        <PaintLayer
          width={width}
          height={height}
          opts={opts}
          paint={ctx => {
            paintReferenceStrip(asCanvasCtx(ctx), model, {
              lit: undefined,
              dpr: 1,
            })
          }}
        />
      ) : null}
      {model.facetPanels ? null : <Keys model={model} idPrefix={idPrefix} />}
    </g>
  )
}
