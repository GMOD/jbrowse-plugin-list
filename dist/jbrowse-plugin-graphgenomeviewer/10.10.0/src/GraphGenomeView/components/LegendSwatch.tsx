import {
  CHEVRON_HALO,
  CHEVRON_INK,
  chevronPoints,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import { NOT_LOADED_RIM_PX } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { THREAD_PX } from '@jbrowse/bandage-core/renderer/walkLanes'
import { rulerInk } from '@jbrowse/bandage-core/tubeMap/axis'
import { observer } from 'mobx-react'

import { useSvgId } from './ElTree'
import { SWATCH_PX, bandPx, swatchHeight, swatchWidth } from '../legendSections'

import type { LegendSwatch, Stop } from '../legendSections'

const EDGE_INK = 'rgba(0, 0, 0, 0.28)'

// eslint-disable-next-line no-restricted-syntax -- drawn inside a frozen SVG figure
function Gradient({
  id,
  x,
  y,
  stops,
  width,
  height,
  square,
  edged,
  rim,
}: {
  id: string
  x: number
  y: number
  stops: readonly Stop[]
  width: number
  height: number
  square?: boolean
  edged?: boolean
  rim?: string
}) {
  // an edge's or a rim's stroke sits half inside, so the chip keeps its size
  const strokePx = rim ? NOT_LOADED_RIM_PX : edged ? 1 : 0
  const inset = strokePx / 2
  const rect = (fill: string) => (
    <rect
      x={x + inset}
      y={y + inset}
      width={width - inset * 2}
      height={height - inset * 2}
      rx={square ? 0 : 2}
      fill={fill}
      stroke={rim ?? (edged ? EDGE_INK : undefined)}
      strokeWidth={rim ? strokePx : undefined}
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
// above the baseline
export function SvgSwatch({
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
      const height = swatchHeight(swatch)
      const width = swatchWidth(swatch)
      return (
        <>
          <Gradient
            id={id}
            x={x}
            y={mid - height / 2}
            stops={swatch.stops}
            width={width}
            height={height}
            square={swatch.square}
            edged={swatch.edged}
            rim={swatch.rim}
          />
          {swatch.chevrons
            ? chevronPoints(x, x + width, mid, height).map(points => (
                <g key={points}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={CHEVRON_HALO}
                    strokeWidth={1.5}
                  />
                  <polyline
                    points={points}
                    fill="none"
                    stroke={CHEVRON_INK}
                    strokeWidth={0.8}
                  />
                </g>
              ))
            : null}
        </>
      )
    }
    case 'bands': {
      const band = bandPx(swatch.bands)
      const top = mid - swatchHeight(swatch) / 2
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
      return swatch.short ? (
        <line
          x1={x + 5}
          x2={x + SWATCH_PX - 5}
          y1={mid}
          y2={mid}
          stroke={swatch.color}
          strokeWidth={1.5}
        />
      ) : swatch.dashed ? (
        <line
          x1={x + 1}
          x2={x + SWATCH_PX}
          y1={mid}
          y2={mid}
          stroke={swatch.color}
          strokeWidth={3}
          strokeDasharray="4 3"
        />
      ) : (
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
    case 'overrun':
      return (
        <path
          transform={`translate(${x} ${mid - 5})`}
          d="M4,0 L0,9 L8,9 Z M14,10 L10,1 L18,1 Z"
          fill="#18181c"
        />
      )
    case 'glyph':
      return (
        <text
          x={x + SWATCH_PX / 2}
          y={mid + 4}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize={12}
          fill="currentColor"
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
          transform={`translate(${x} ${mid - 3.5})`}
          d={`M0.5,6 V1.5 H5.5 V6 M8.5,6 V1.5 H${SWATCH_PX - 0.5} V6`}
          fill="none"
          stroke={rulerInk()}
        />
      )
    case 'blank':
      return null
    case 'threads':
      return (
        <>
          {[-3, 0, 3].map(dy => (
            <line
              key={dy}
              x1={x}
              x2={x + SWATCH_PX}
              y1={mid + dy}
              y2={mid + dy}
              stroke="#444"
              strokeWidth={THREAD_PX}
            />
          ))}
        </>
      )
    case 'heads':
      return (
        <g transform={`translate(${x} ${mid})`}>
          <line
            x2={SWATCH_PX}
            stroke={swatch.lane}
            strokeWidth={swatch.lanePx}
          />
          {swatch.haloPx === undefined ? null : (
            <path
              d={swatch.heads}
              fill="none"
              stroke="#ffffff"
              strokeWidth={swatch.haloPx}
              strokeLinejoin="round"
            />
          )}
          <path d={swatch.heads} fill={swatch.fill} />
        </g>
      )
  }
}

// The same swatch on screen, in a box as tall as the swatch so the row
// centres it on its words
export const LegendSwatchView = observer(function LegendSwatchView({
  swatch,
}: {
  swatch: LegendSwatch
}) {
  const id = useSvgId()
  const height = swatchHeight(swatch)
  return (
    <svg
      width={swatchWidth(swatch)}
      height={height}
      overflow="visible"
      style={{ flex: 'none' }}
    >
      <g transform={`translate(0 ${height / 2 + 5})`}>
        <SvgSwatch swatch={swatch} x={0} id={id} />
      </g>
    </svg>
  )
})
