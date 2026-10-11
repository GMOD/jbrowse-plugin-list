import { FACET_GAP_PX, FACET_TITLE_PX } from '@jbrowse/bandage-core/facetGrid'
import { LEGEND_INSET_PX } from '@jbrowse/bandage-core/labelLayout'
import { Canvas2DRenderer } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'
import { svgCanvas } from '@jbrowse/bandage-core/renderer/svgCanvas'
import { rulerInk } from '@jbrowse/bandage-core/tubeMap/axis'
import { PaintLayer } from '@jbrowse/core/util/paintLayer'

import BubbleHalos from './BubbleHalos'
import GenePins from './GenePins'
import LabelLayer from './LabelLayer'
import { paintReferenceStrip } from './ReferenceStripOverlay'
import { paintTubeMap } from './TubeMapOverlay'
import WalkRowsOverlay from './WalkRowsOverlay'
import {
  SWATCH_PX,
  legendSections,
  swatchWidth,
  walkKeyRow,
} from '../legendSections'

import type { LegendRow, LegendSwatch, Stop } from '../legendSections'
import type { GraphPaneModel } from '../model'
import type { WalkLift } from '@jbrowse/bandage-core/walkHighlight'
import type { Ctx2D } from '@jbrowse/core/util/paintLayer'

const FONT = { fontFamily: 'sans-serif', fontSize: 11 }
const CHAR_PX = 6.2
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
  const transform = {
    scaleX: model.scaleX,
    scaleY: model.scaleY,
    translateX: model.translateX,
    translateY: model.translateY,
  }
  if (rasterize) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * RASTER_SCALE)
    canvas.height = Math.round(height * RASTER_SCALE)
    const renderer = new Canvas2DRenderer(canvas)
    renderer.uploadGeometry(built.batch)
    renderer.updateTransform({
      scaleX: transform.scaleX * RASTER_SCALE,
      scaleY: transform.scaleY * RASTER_SCALE,
      translateX: transform.translateX * RASTER_SCALE,
      translateY: transform.translateY * RASTER_SCALE,
      dpr: RASTER_SCALE,
    })
    renderer.render([0, 0, 0, 0])
    return (
      <image
        width={width}
        height={height}
        href={canvas.toDataURL('image/png')}
      />
    )
  }
  const { canvas, markup } = svgCanvas(width, height)
  const ctx = canvas.getContext('2d') as unknown as { clearRect?: () => void }
  ctx.clearRect ??= () => {}
  const renderer = new Canvas2DRenderer(canvas)
  renderer.uploadGeometry(built.batch)
  renderer.updateTransform({ ...transform, dpr: 1 })
  renderer.render([0, 0, 0, 0])
  return (
    <svg width={width} height={height} overflow="hidden">
      <g dangerouslySetInnerHTML={{ __html: markup() }} />
    </svg>
  )
}

function Gradient({
  id,
  x,
  y,
  stops,
  width,
  height,
  square,
}: {
  id: string
  x: number
  y: number
  stops: readonly Stop[]
  width: number
  height: number
  square?: boolean
}) {
  const rect = (fill: string) => (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={square ? 0 : 2}
      fill={fill}
    />
  )
  return stops.length > 1 ? (
    <>
      <defs>
        <linearGradient id={id}>
          {stops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>
      {rect(`url(#${id})`)}
    </>
  ) : (
    rect(stops[0]!.color)
  )
}

// A row's swatch with its left edge at x, centred on the row's text 5 px
// above the baseline, as the screen centres it
function SvgSwatch({
  swatch,
  x,
  id,
}: {
  swatch: LegendSwatch
  x: number
  id: string
}) {
  const mid = -5
  switch (swatch.kind) {
    case 'fill': {
      const height = swatch.height ?? 8
      return (
        <Gradient
          id={id}
          x={x}
          y={mid - height / 2}
          stops={swatch.stops}
          width={swatchWidth(swatch)}
          height={height}
          square={swatch.square}
        />
      )
    }
    case 'bands': {
      const band = swatch.bands.length > 1 ? 3 : 4
      const top = mid - (band * swatch.bands.length) / 2
      return (
        <>
          {swatch.bands.map((stops, i) => (
            <Gradient
              key={i}
              id={`${id}-${i}`}
              x={x}
              y={top + i * band}
              stops={stops}
              width={SWATCH_PX}
              height={band}
              square
            />
          ))}
        </>
      )
    }
    case 'line':
      return (
        <rect
          x={x}
          y={mid - 1.5}
          width={SWATCH_PX}
          height={3}
          rx={2}
          fill={swatch.color}
        />
      )
    case 'halo':
      return (
        <line
          x1={x + 5}
          x2={x + 13}
          y1={mid}
          y2={mid}
          stroke={swatch.color}
          strokeOpacity={0.35}
          strokeWidth={8}
          strokeLinecap="round"
        />
      )
    case 'outline': {
      const inset = swatch.stroke / 2
      return (
        <rect
          x={x + inset}
          y={mid - swatch.height / 2 + inset}
          width={SWATCH_PX - swatch.stroke}
          height={swatch.height - swatch.stroke}
          rx={Math.max(0, swatch.radius - inset)}
          fill="none"
          stroke={swatch.color}
          strokeWidth={swatch.stroke}
        />
      )
    }
    case 'overhang':
      return (
        <path
          transform={`translate(${x} ${mid - 5})`}
          d="M0,5 L8,0 L8,10 Z M18,5 L10,0 L10,10 Z"
          fill="#18181c"
        />
      )
    case 'glyph':
      return (
        <text
          x={x + SWATCH_PX / 2}
          y={0}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize={12}
        >
          {swatch.char}
        </text>
      )
    case 'tick': {
      const y = mid - swatch.height / 2
      return (
        <>
          {swatch.backing ? (
            <rect
              x={x}
              y={y}
              width={SWATCH_PX}
              height={swatch.height}
              fill={swatch.backing}
            />
          ) : null}
          <rect
            x={x + SWATCH_PX / 2 - 1}
            y={y}
            width={2}
            height={swatch.height}
            fill={swatch.color}
          />
        </>
      )
    }
    case 'bracket':
      return (
        <path
          transform={`translate(${x} ${mid - 4})`}
          d={`M0.5,6 V1.5 H5.5 V6 M8.5,6 V1.5 H${SWATCH_PX - 0.5} V6`}
          fill="none"
          stroke={rulerInk()}
        />
      )
    case 'blank':
      return null
  }
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
      width: row.label.length * CHAR_PX,
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
      sw + 5 + words.length * CHAR_PX,
      (row.under?.length ?? 0) * CHAR_PX,
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
      {model.drawnRowLabels.map(({ label, y }) => {
        const screenY = y * model.scaleY + model.translateY
        return screenY >= 0 && screenY <= model.canvasHeight ? (
          <Chip
            key={y}
            x={10}
            y={screenY}
            text={label}
            fontSize={11}
            anchor="start"
          />
        ) : null
      })}
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
  return (
    <>
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
          lift={model.walkLift}
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
