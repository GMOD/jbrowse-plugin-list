import { rulerInk } from '@jbrowse/bandage-core/tubeMap/axis'

import { useSvgId } from './ElTree'
import { SWATCH_PX, swatchWidth } from '../legendSections'

import type { LegendSwatch, Stop } from '../legendSections'

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

const bandPx = (bands: readonly unknown[]) => (bands.length > 1 ? 3 : 4)

function swatchHeight(swatch: LegendSwatch) {
  switch (swatch.kind) {
    case 'fill':
      return swatch.height ?? 8
    case 'bands':
      return bandPx(swatch.bands) * swatch.bands.length
    case 'line':
      return 3
    case 'halo':
    case 'overhang':
      return 10
    case 'outline':
    case 'tick':
      return swatch.height
    case 'glyph':
      return 15
    case 'bracket':
      return 7
    case 'blank':
      return 0
  }
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
