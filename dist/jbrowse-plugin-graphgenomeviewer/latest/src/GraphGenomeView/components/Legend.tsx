import type { ReactNode } from 'react'

import { rulerInk } from '@jbrowse/bandage-core/tubeMap/axis'
import { observer } from 'mobx-react'

import { SWATCH_PX, legendSections, swatchWidth } from '../legendSections'
import { legendBoxStyle, legendNoteStyle, legendRowStyle } from './legendStyles'

import type { LegendRow, LegendSwatch, Stop } from '../legendSections'
import type { GraphPaneModel } from '../model'

function stopsCss(stops: readonly Stop[]) {
  return stops.length === 1
    ? stops[0]!.color
    : `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`
}

const glyphStyle = {
  width: SWATCH_PX,
  flex: 'none',
  textAlign: 'center' as const,
  fontFamily: 'monospace',
  fontSize: 12,
}

export function LegendSwatchView({ swatch }: { swatch: LegendSwatch }) {
  const width = swatchWidth(swatch)
  const box = { width, flex: 'none' }
  switch (swatch.kind) {
    case 'fill':
      return (
        <div
          style={{
            ...box,
            height: swatch.height ?? 8,
            borderRadius: swatch.square ? 0 : 2,
            background: stopsCss(swatch.stops),
          }}
        />
      )
    case 'bands':
      return (
        <div style={box}>
          {swatch.bands.map((stops, i) => (
            <div
              key={i}
              style={{
                height: swatch.bands.length > 1 ? 3 : 4,
                background: stopsCss(stops),
              }}
            />
          ))}
        </div>
      )
    case 'line':
      return (
        <div
          style={{
            ...box,
            height: 3,
            borderRadius: 2,
            background: swatch.color,
          }}
        />
      )
    case 'halo':
      return (
        <svg width={width} height={10} style={{ flex: 'none' }}>
          <line
            x1={5}
            y1={5}
            x2={13}
            y2={5}
            stroke={swatch.color}
            strokeOpacity={0.35}
            strokeWidth={8}
            strokeLinecap="round"
          />
        </svg>
      )
    case 'outline':
      return (
        <div
          style={{
            ...box,
            height: swatch.height,
            boxSizing: 'border-box',
            border: `${swatch.stroke}px solid ${swatch.color}`,
            borderRadius: swatch.radius,
          }}
        />
      )
    case 'overhang':
      return (
        <svg width={width} height={10} style={{ flex: 'none' }}>
          <path d="M0,5 L8,0 L8,10 Z M18,5 L10,0 L10,10 Z" fill="#18181c" />
        </svg>
      )
    case 'glyph':
      return <span style={glyphStyle}>{swatch.char}</span>
    case 'tick':
      return (
        <div
          style={{
            ...box,
            height: swatch.height,
            display: 'flex',
            justifyContent: 'center',
            background: swatch.backing,
          }}
        >
          <div style={{ width: 2, backgroundColor: swatch.color }} />
        </div>
      )
    case 'bracket':
      return (
        <svg width={width} height={7} style={{ flex: 'none' }}>
          <path
            d={`M0.5,6 V1.5 H5.5 V6 M8.5,6 V1.5 H${SWATCH_PX - 0.5} V6`}
            fill="none"
            stroke={rulerInk()}
          />
        </svg>
      )
    case 'blank':
      return <span style={box} />
  }
}

// One row: its swatch then its words, or a note with neither. `at`, where
// the hovered node sits on a walk, stands in for the line under it.
export function LegendRowView({
  row,
  at,
  hint,
  after,
}: {
  row: LegendRow
  at?: string
  hint?: string
  after?: ReactNode
}) {
  return row.swatch ? (
    <div title={[row.title, hint].filter(Boolean).join(' · ') || undefined}>
      <div style={legendRowStyle}>
        <LegendSwatchView swatch={row.swatch} />
        <span>
          {row.strong ? <strong>{row.strong}</strong> : null}
          {row.label}
        </span>
        {after}
      </div>
      {at ? (
        <div data-testid="graph-walk-at">{at}</div>
      ) : row.under ? (
        <div>{row.under}</div>
      ) : null}
    </div>
  ) : (
    <div style={legendNoteStyle}>{row.label}</div>
  )
}

const closeStyle = {
  pointerEvents: 'auto' as const,
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  padding: '0 2px',
  font: 'inherit',
  textDecoration: 'underline',
}

// Every key the drawing needs, a section each
export const LegendPanel = observer(function LegendPanel({
  model,
}: {
  model: GraphPaneModel
}) {
  return (
    <>
      {legendSections(model).map(({ testid, rows }) => (
        <div key={testid} style={legendBoxStyle} data-testid={testid}>
          {rows.map(row => (
            <LegendRowView
              key={row.key}
              row={row}
              at={row.walk ? model.hoveredOn(row.walk) : undefined}
              after={
                row.closesBubble ? (
                  <button
                    type="button"
                    style={closeStyle}
                    data-testid="graph-close-bubble"
                    onClick={() => {
                      model.closeBubbles()
                    }}
                  >
                    close
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      ))}
    </>
  )
})
