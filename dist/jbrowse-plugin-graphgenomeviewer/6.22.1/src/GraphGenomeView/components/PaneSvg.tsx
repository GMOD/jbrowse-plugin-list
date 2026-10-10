import { FACET_GAP_PX, FACET_TITLE_PX } from '@jbrowse/bandage-core/facetGrid'
import { formatBp } from '@jbrowse/bandage-core/graphLabels'
import { LEGEND_INSET_PX } from '@jbrowse/bandage-core/labelLayout'
import {
  walkRowsKey,
  walkRowsKeyTree,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import { Canvas2DRenderer } from '@jbrowse/bandage-core/renderer/Canvas2DRenderer'
import {
  LIFT_BACKDROP_CSS,
  REFERENCE_RAMP_ALT_CSS,
} from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { svgCanvas } from '@jbrowse/bandage-core/renderer/svgCanvas'
import { rulerInk } from '@jbrowse/bandage-core/tubeMap/axis'
import { deviationInk } from '@jbrowse/bandage-core/tubeMap/deviations'
import {
  FORWARD_READ_COLORS,
  REVERSE_READ_COLORS,
} from '@jbrowse/bandage-core/tubeMap/reads'
import { encodingStops } from '@jbrowse/bandage-core/walkEncoding'
import { walkKey } from '@jbrowse/bandage-core/walkKey'
import { PaintLayer } from '@jbrowse/core/util/paintLayer'

import BubbleHalos, { haloKeyEntries } from './BubbleHalos'
import ElTree from './ElTree'
import GenePins, { EXON_COLOR } from './GenePins'
import LabelLayer from './LabelLayer'
import { paintReferenceStrip } from './ReferenceStripOverlay'
import { paintTubeMap } from './TubeMapOverlay'
import { PANEL_REFERENCE_TUBE, PANEL_TUBE } from '../tubeMapPanels'
import WalkRowsOverlay from './WalkRowsOverlay'
import { UNPLACED_SWATCH } from './legendStyles'

import type { GraphPaneModel } from '../model'
import type { LiftedWalk, WalkLift } from '@jbrowse/bandage-core/walkHighlight'
import type { Ctx2D } from '@jbrowse/core/util/paintLayer'

const FONT = { fontFamily: 'sans-serif', fontSize: 11 }
const CHAR_PX = 6.2
const ROW_PX = 16
const SWATCH_PX = 18
const BAR_PX = 48
const RASTER_SCALE = 2
const STRIP_SAMPLES = 6

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

function Swatch({
  id,
  x,
  y = -9,
  stops,
  width,
  height = 8,
}: {
  id: string
  x: number
  y?: number
  stops: { offset: number; color: string }[]
  width: number
  height?: number
}) {
  return stops.length > 1 ? (
    <>
      <defs>
        <linearGradient id={id}>
          {stops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={2}
        fill={`url(#${id})`}
      />
    </>
  ) : (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={2}
      fill={stops[0]?.color}
    />
  )
}

interface KeyRow {
  key: string
  width: number
  height: number
  draw: (right: number) => React.ReactNode
}

// A row of the key: a swatch, then its words, ending at `right`
function swatchRow(
  key: string,
  swatch: (x: number) => React.ReactNode,
  swatchWidth: number,
  label: string,
  after = '',
  under?: string,
): KeyRow {
  const width = Math.max(
    swatchWidth + 5 + (label.length + after.length) * CHAR_PX,
    (under?.length ?? 0) * CHAR_PX,
  )
  return {
    key,
    width,
    height: under ? ROW_PX * 2 : ROW_PX,
    draw: right => {
      const x = right - width
      return (
        <g key={key} {...FONT}>
          {swatch(x)}
          <text x={x + swatchWidth + 5} y={0}>
            <tspan fontWeight="bold">{label}</tspan>
            {after}
          </text>
          {under ? (
            <text x={x} y={ROW_PX}>
              {under}
            </text>
          ) : null}
        </g>
      )
    },
  }
}

function walkRow(model: GraphPaneModel, walk: LiftedWalk, id: string) {
  const key = walkKey(walk, model.walkReference)
  const stops = encodingStops(walk.encoding)
  const width = key.shades ? BAR_PX : SWATCH_PX
  return swatchRow(
    walk.name,
    x => <Swatch id={id} x={x} stops={stops} width={width} />,
    width,
    model.walkLabel(walk.name),
    key.delta + key.outside + key.reversed,
    key.scale,
  )
}

function flatRow(key: string, color: string, label: string) {
  return swatchRow(
    key,
    x => (
      <Swatch id={key} x={x} stops={[{ offset: 0, color }]} width={SWATCH_PX} />
    ),
    SWATCH_PX,
    '',
    label,
  )
}

// The strip's own colours, a row per lifted walk, else the node scheme's
function stripStops(model: GraphPaneModel) {
  const lift = model.walkLift
  if (lift) {
    return lift.walks.map(w => encodingStops(w.encoding))
  }
  if (model.effectiveColorScheme === 'reference-position') {
    return [encodingStops({ field: 'reference', scheme: 'rainbow' })]
  }
  const colors = model.referenceStripBlocks
    .map(b => b.colors[0]!)
    .filter((c, i, all) => c !== all[i - 1])
  const n = Math.min(STRIP_SAMPLES, colors.length)
  return [
    Array.from({ length: n }, (_, i) => ({
      offset: n > 1 ? i / (n - 1) : 0,
      color:
        colors[n > 1 ? Math.round((i * (colors.length - 1)) / (n - 1)) : 0]!,
    })),
  ]
}

function stripKeyRows(model: GraphPaneModel, idPrefix: string): KeyRow[] {
  if (!model.referenceStripShown) {
    return []
  }
  const rowPerWalk = (model.walkLift?.walks.length ?? 0) > 1
  const bands = stripStops(model)
  const rows = [
    swatchRow(
      'strip',
      x => (
        <>
          {bands.map((stops, i) => (
            <g key={i} transform={`translate(0 ${(i * 8) / bands.length})`}>
              <Swatch
                id={`${idPrefix}-strip-${i}`}
                x={x}
                y={-9}
                stops={stops}
                width={SWATCH_PX}
                height={8 / bands.length}
              />
            </g>
          ))}
        </>
      ),
      SWATCH_PX,
      '',
      `top strip: reference segments at their bp${rowPerWalk ? ', a row per walk' : ''}`,
    ),
  ]
  if (model.referenceStripFaded) {
    rows.push(
      flatRow(
        'strip-faded',
        LIFT_BACKDROP_CSS,
        `reference not on ${rowPerWalk ? "that row's walk" : model.liftedWalksLabel}`,
      ),
    )
  }
  if (model.referenceStripOverhangs) {
    rows.push(
      swatchRow(
        'overhang',
        x => (
          <path
            transform={`translate(${x} -10)`}
            d="M0,5 L8,0 L8,10 Z M18,5 L10,0 L10,10 Z"
            fill="#18181c"
          />
        ),
        SWATCH_PX,
        '',
        'the graph draws reference past this edge',
      ),
    )
  }
  return rows
}

function haloRows(model: GraphPaneModel): KeyRow[] {
  return haloKeyEntries(model).map(({ color, label }) =>
    swatchRow(
      `halo-${color}`,
      x => (
        <line
          x1={x + 5}
          x2={x + 13}
          y1={-5}
          y2={-5}
          stroke={color}
          strokeOpacity={0.35}
          strokeWidth={8}
          strokeLinecap="round"
        />
      ),
      SWATCH_PX,
      '',
      label,
    ),
  )
}

function pathRows(model: GraphPaneModel): KeyRow[] {
  return model.pathLegend.map(({ name, label, color }) =>
    swatchRow(
      `path-${name}`,
      x => (
        <rect x={x} y={-6} width={SWATCH_PX} height={3} rx={2} fill={color} />
      ),
      SWATCH_PX,
      '',
      label,
    ),
  )
}

function readStops(colors: readonly string[]) {
  return colors.flatMap((color, i) => [
    { offset: i / colors.length, color },
    { offset: (i + 1) / colors.length, color },
  ])
}

function tubeMapRows(model: GraphPaneModel, idPrefix: string): KeyRow[] {
  if (!model.layoutResult?.tubeMap) {
    return []
  }
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
  const rows: KeyRow[] = []
  const glyph = (key: string, char: string, label: string) =>
    swatchRow(
      key,
      x => (
        <text
          x={x + SWATCH_PX / 2}
          y={0}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize={12}
        >
          {char}
        </text>
      ),
      SWATCH_PX,
      '',
      label,
    )
  if (values) {
    rows.push(
      flatRow('ref', PANEL_REFERENCE_TUBE, 'reference'),
      ...values.map(({ value, color }) =>
        flatRow(`value-${value}`, color, value),
      ),
    )
  }
  if (roles) {
    rows.push(
      flatRow('ref', PANEL_REFERENCE_TUBE, 'reference'),
      flatRow(
        'hap',
        PANEL_TUBE,
        bundled ? 'a route, as wide as the haplotypes taking it' : 'haplotype',
      ),
    )
  }
  if (forwardReads) {
    rows.push(
      swatchRow(
        'fwd',
        x => (
          <Swatch
            id={`${idPrefix}-fwd`}
            x={x}
            stops={readStops(FORWARD_READ_COLORS)}
            width={SWATCH_PX}
          />
        ),
        SWATCH_PX,
        '',
        'read on the forward strand',
      ),
    )
  }
  if (reverseReads) {
    rows.push(
      swatchRow(
        'rev',
        x => (
          <Swatch
            id={`${idPrefix}-rev`}
            x={x}
            stops={readStops(REVERSE_READ_COLORS)}
            width={SWATCH_PX}
          />
        ),
        SWATCH_PX,
        '',
        'read on the reverse strand',
      ),
    )
  }
  if (reads && reads.shown < reads.total) {
    rows.push(
      swatchRow(
        'sampled',
        () => null,
        SWATCH_PX,
        '',
        `${reads.shown.toLocaleString('en-US')} of ${reads.total.toLocaleString('en-US')} reads shown`,
      ),
    )
  }
  if (substitution) {
    rows.push(glyph('sub', 'A', "a read's base unlike the node's"))
  }
  if (insertion) {
    rows.push(glyph('ins', '*', 'bases a read inserts'))
  }
  if (deletion) {
    rows.push(flatRow('del', 'grey', 'bases a read skips'))
  }
  if (foldBp !== undefined) {
    rows.push(
      swatchRow(
        'fold',
        x => (
          <>
            <rect x={x} y={-9} width={SWATCH_PX} height={7} fill="#b8b8c0" />
            <rect
              x={x + SWATCH_PX / 2 - 1}
              y={-9}
              width={2}
              height={7}
              fill={deviationInk()}
            />
          </>
        ),
        SWATCH_PX,
        '',
        `a haplotype's variant under ${formatBp(foldBp)}`,
      ),
    )
  }
  if (logWidths) {
    rows.push(
      swatchRow(
        'log',
        x => (
          <path
            transform={`translate(${x} -9)`}
            d={`M0.5,6 V1.5 H5.5 V6 M8.5,6 V1.5 H${SWATCH_PX - 0.5} V6`}
            fill="none"
            stroke={rulerInk()}
          />
        ),
        SWATCH_PX,
        '',
        'width grows with log of length',
      ),
    )
  }
  return rows
}

function walkRowsKeyRows(model: GraphPaneModel, idPrefix: string): KeyRow[] {
  const bars = model.walkRowBars
  if (!bars) {
    return []
  }
  return walkRowsKey(bars, {
    ramp: model.referenceRampDomain,
    genes: model.walkRowGeneKey,
  }).map((entry, i) => {
    const { tree, width } = walkRowsKeyTree(
      [entry],
      0,
      0,
      `${idPrefix}-rows-key-${i}`,
    )
    return {
      key: `walk-rows-${i}`,
      width,
      height: ROW_PX,
      draw: (right: number) => (
        <g key={i} transform={`translate(${right - width} -12)`}>
          <ElTree el={tree} />
        </g>
      ),
    }
  })
}

// The keys the screen stacks in the top right corner, in its order
function Keys({
  model,
  idPrefix,
}: {
  model: GraphPaneModel
  idPrefix: string
}) {
  const rows: KeyRow[] = []
  const lift = model.walkLift
  const domain = lift ? undefined : model.referenceRampDomain
  if (domain) {
    const start = Math.round(domain.start)
    const end = Math.round(domain.end)
    rows.push(
      swatchRow(
        'ramp',
        x => (
          <Swatch
            id={`${idPrefix}-ramp`}
            x={x}
            stops={encodingStops({ field: 'reference', scheme: 'rainbow' })}
            width={BAR_PX}
          />
        ),
        BAR_PX,
        '',
        `${start.toLocaleString()}-${end.toLocaleString()} (${formatBp(end - start)})`,
      ),
    )
    if (model.referenceRampOffKeys.offReference) {
      rows.push(flatRow('off', REFERENCE_RAMP_ALT_CSS, 'off the reference'))
    }
    if (model.referenceRampOffKeys.unplaced) {
      rows.push(flatRow('unplaced', UNPLACED_SWATCH, 'no reference position'))
    }
  }
  rows.push(...stripKeyRows(model, idPrefix), ...haloRows(model))
  if (model.genePins.some(pin => pin.exonsByNode.length > 0)) {
    rows.push(
      swatchRow(
        'exon',
        x => (
          <rect
            x={x + 1}
            y={-10}
            width={SWATCH_PX - 2}
            height={10}
            rx={4}
            fill="none"
            stroke={EXON_COLOR}
            strokeWidth={2}
          />
        ),
        SWATCH_PX,
        '',
        'exon',
      ),
    )
  }
  if (model.foldNote) {
    rows.push(swatchRow('fold', () => null, 0, '', model.foldNote))
  }
  rows.push(
    ...pathRows(model),
    ...tubeMapRows(model, idPrefix),
    ...walkRowsKeyRows(model, idPrefix),
  )
  if (lift && !model.facetPanels) {
    lift.walks.forEach((walk, i) => {
      rows.push(walkRow(model, walk, `${idPrefix}-walk-${i}`))
    })
    if (model.liftPaintsOffReference) {
      rows.push(
        flatRow('lift-off', REFERENCE_RAMP_ALT_CSS, 'off the reference'),
      )
    }
    rows.push(
      flatRow('faded', LIFT_BACKDROP_CSS, `not on ${model.liftedWalksLabel}`),
    )
  }
  if (rows.length === 0) {
    return null
  }
  const top = LEGEND_INSET_PX + model.referenceStripZonePx
  const right = model.paneWidth - LEGEND_INSET_PX - 6
  const boxWidth = Math.max(...rows.map(r => r.width)) + 12
  const left = right + 6 - boxWidth + 6
  const boxHeight = rows.reduce((sum, r) => sum + r.height, 0) + 6
  let y = top + ROW_PX
  return (
    <g data-testid="graph-svg-keys">
      <rect
        x={left - 6}
        y={top}
        width={boxWidth}
        height={boxHeight}
        rx={3}
        fill="#fff"
        fillOpacity={0.82}
      />
      {rows.map(row => {
        const at = y
        y += row.height
        return (
          <g key={row.key} transform={`translate(0 ${at})`}>
            {row.draw(left + row.width)}
          </g>
        )
      })}
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
        const title = walkRow(model, walk, `${idPrefix}-facet-${i}`)
        return (
          <g key={walk.name} transform={`translate(${x} ${y})`}>
            <g transform={`translate(0 ${ROW_PX - 2})`}>
              {title.draw(title.width + 6)}
            </g>
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
