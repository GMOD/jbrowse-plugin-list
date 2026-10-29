import { rulerInk } from '@jbrowse/bandage-core/tubeMap/axis'

import { useSvgId } from './ElTree'
import { SWATCH_PX, bandPx, swatchHeight, swatchWidth } from '../legendSections'

import type { LegendSwatch, Stop } from '../legendSections'

const EDGE_INK = 'rgba(0, 0, 0, 0.28)'

function Gradient({
  id,
  x,
  y,
  stops,
  width,
  height,
  square,
  edged,
}: {
  id: string
  x: number
  y: number
  stops: readonly Stop[]
  width: number
  height: number
  square?: boolean
  edged?: boolean
}) {
  // an edge's stroke sits half inside, so the chip keeps its size
  const inset = edged ? 0.5 : 0
  const rect = (fill: string) => (
    <rect
      x={x + inset}
      y={y + inset}
      width={width - inset * 2}
      height={height - inset * 2}
      rx={square ? 0 : 2}
      fill={fill}
      stroke={edged ? EDGE_INK : undefined}
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
      return (
        <Gradient
          id={id}
          x={x}
          y={mid - height / 2}
          stops={swatch.stops}
          width={swatchWidth(swatch)}
          height={height}
          square={swatch.square}
          edged={swatch.edged}
        />
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
      return swatch.dashed ? (
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
  }
}

// The same swatch on screen, in a box as tall as the swatch so the row
// centres it on its words
export function LegendSwatchView({ swatch }: { swatch: LegendSwatch }) {
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
}
