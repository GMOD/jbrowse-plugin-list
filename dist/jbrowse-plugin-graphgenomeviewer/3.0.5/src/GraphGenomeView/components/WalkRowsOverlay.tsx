import { observer } from 'mobx-react'

import { LABEL_CHAR_PX } from './overlayLabels'
import { ROW_HEIGHT_PX } from '../layout/rowSpacing'
import { CALL_TOLERANCE } from '../repeats/walkCalls'

import type { GraphGenomeViewModel } from '../model'

// The walk-rows layout's bars: one per haplotype walk under the reference line
// the canvas draws, each on its own bp axis from the window's left edge. Blue
// is sequence the reference walk also carries, purple is sequence it does not,
// and the readout at the end of a bar is what it carries against the
// reference, which for a repeat array is the expansion.
//
// A tick is the genotyped allele length paired with THAT walk, and the walk
// rows pair them — see repeats/walkCalls.ts, which also holds the threshold
// this reads a red readout off.

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'visible' as const,
  zIndex: 3,
}

const ON_REFERENCE = '#2f8fd6'
const CALL_TICK = '#111'
const UNBACKED_TICK = '#9e9e9e'
const DISAGREES = '#c62828'
const OFF_REFERENCE = '#8e3fbf'
const BAR_PX = 12

const legendBoxStyle = {
  background: 'rgba(255,255,255,0.82)',
  padding: '4px 6px',
  borderRadius: 3,
  fontSize: 11,
  lineHeight: '15px',
  whiteSpace: 'nowrap' as const,
}
const legendRowStyle = { display: 'flex', alignItems: 'center', gap: 5 }
const swatchStyle = { width: 18, height: BAR_PX - 4, borderRadius: 2 }
const tickSwatchStyle = {
  ...swatchStyle,
  display: 'flex',
  justifyContent: 'center',
}

function TickSwatch({ color }: { color: string }) {
  return (
    <div style={tickSwatchStyle}>
      <div style={{ width: 2, backgroundColor: color }} />
    </div>
  )
}

// What the bar colours and the ticks mean, in the legend stack with the other
// keys. The reference row is named, so "the reference" here reads as that row.
// Each tick row appears once the rows hold one, so a catalogue with no
// genotypes keeps the two-colour key it had.
export const WalkRowsLegend = observer(function WalkRowsLegend({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const bars = model.walkRowBars
  if (!bars) {
    return null
  }
  const calls = bars.rows.flatMap(row => row.call ?? [])
  return (
    <div style={legendBoxStyle} data-testid="graph-walk-rows-legend">
      <div style={legendRowStyle}>
        <div style={{ ...swatchStyle, backgroundColor: ON_REFERENCE }} />
        <span>sequence {bars.reference.label} also carries</span>
      </div>
      <div style={legendRowStyle}>
        <div style={{ ...swatchStyle, backgroundColor: OFF_REFERENCE }} />
        <span>sequence it does not</span>
      </div>
      {calls.some(call => call.spanningReads !== 0) ? (
        <div style={legendRowStyle}>
          <TickSwatch color={CALL_TICK} />
          <span>allele length called for this walk</span>
        </div>
      ) : null}
      {calls.some(call => call.spanningReads === 0) ? (
        <div style={legendRowStyle}>
          <TickSwatch color={UNBACKED_TICK} />
          <span>called with no read spanning it</span>
        </div>
      ) : null}
      {calls.some(call => call.agrees === false) ? (
        <div style={legendRowStyle}>
          <div style={swatchStyle} />
          <span style={{ color: DISAGREES }}>
            walk and call over {Math.round(CALL_TOLERANCE * 100)}% apart
          </span>
        </div>
      ) : null}
    </div>
  )
})

function kb(bp: number) {
  return `${(bp / 1000).toFixed(bp < 10_000 ? 1 : 0)} kb`
}

function units(bp: number, unit: number | undefined) {
  return unit ? ` ≈ ${Math.round(bp / unit)} units` : ''
}

function readout(
  bp: number,
  referenceBp: number,
  complete: boolean,
  unit: number | undefined,
) {
  const delta = bp - referenceBp
  const against =
    delta === 0 ? '' : ` (${delta > 0 ? '+' : '−'}${kb(Math.abs(delta))})`
  return `${kb(bp)}${units(bp, unit)}${against}${complete ? '' : ' · partial walk'}`
}

function calledReadout(call: { bp: number; spanningReads?: number }) {
  const unbacked = call.spanningReads === 0 ? ' · no spanning read' : ''
  return ` · called ${kb(call.bp)}${unbacked}`
}

// One separator per unit along a bar, so copies are countable, dropped when a
// unit is under a few px. The reference bar is the canvas's, so it gets none.
const MIN_TILE_PX = 3

function tileSeparators(bp: number, unit: number, X: (bp: number) => number) {
  if (X(unit) - X(0) < MIN_TILE_PX) {
    return []
  }
  const xs: number[] = []
  for (let k = unit; k < bp; k += unit) {
    xs.push(k)
  }
  return xs
}

const WalkRowsOverlay = observer(function WalkRowsOverlay({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const { walkRowBars } = model
  if (!walkRowBars) {
    return null
  }
  const { scaleX, scaleY, translateX, translateY, width, canvasHeight } = model
  const X = (bp: number) => bp * scaleX + translateX
  const Y = (row: number) => row * ROW_HEIGHT_PX * scaleY + translateY
  const { origin, unit, reference, rows } = walkRowBars
  // The backbone the canvas draws spans the cut window, which reaches past a
  // selected array on both sides, so the reference readout sits after it.
  const backboneEnd = Math.max(
    origin + reference.bp,
    model.loadedRegion?.end ?? 0,
  )
  // A readout that would leave the pane is written inside the end of its bar.
  const label = (text: string, endBp: number, y: number, fill = '#333') => {
    const x = X(endBp) + 6
    const fits = x + text.length * LABEL_CHAR_PX < width
    return (
      <text
        x={fits ? x : X(endBp) - 6}
        y={y + 4}
        fontSize={11}
        fontFamily="sans-serif"
        fill={fill}
        stroke={fits ? undefined : 'white'}
        strokeWidth={fits ? undefined : 3}
        paintOrder="stroke"
        textAnchor={fits ? 'start' : 'end'}
      >
        {text}
      </text>
    )
  }
  return (
    <svg
      style={svgStyle}
      width={width}
      height={canvasHeight}
      data-testid="graph-walk-rows"
    >
      {label(
        `${kb(reference.bp)}${units(reference.bp, unit)}`,
        backboneEnd,
        Y(0),
      )}
      {rows.map((row, i) => {
        const y = Y(i + 1)
        if (y < -BAR_PX || y > canvasHeight + BAR_PX) {
          return null
        }
        const { call } = row
        return (
          <g key={row.name} data-testid="graph-walk-row">
            {row.runs.map(run => (
              <rect
                key={run.start}
                x={X(origin + run.start)}
                y={y - BAR_PX / 2}
                width={Math.max(1, run.bp * scaleX)}
                height={BAR_PX}
                fill={run.onReference ? ON_REFERENCE : OFF_REFERENCE}
              />
            ))}
            {unit
              ? tileSeparators(row.bp, unit, bp => bp * scaleX).map(k => (
                  <line
                    key={k}
                    x1={X(origin + k)}
                    x2={X(origin + k)}
                    y1={y - BAR_PX / 2}
                    y2={y + BAR_PX / 2}
                    stroke="white"
                    strokeWidth={1}
                  />
                ))
              : null}
            {call ? (
              <rect
                data-testid="graph-walk-call"
                x={X(origin + call.bp) - 1}
                y={y - BAR_PX / 2 - 3}
                width={2}
                height={BAR_PX + 6}
                fill={call.spanningReads === 0 ? UNBACKED_TICK : CALL_TICK}
              />
            ) : null}
            {label(
              `${readout(row.bp, reference.bp, row.complete, unit)}${call ? calledReadout(call) : ''}`,
              origin + row.bp,
              y,
              call?.agrees === false ? DISAGREES : undefined,
            )}
          </g>
        )
      })}
    </svg>
  )
})

export default WalkRowsOverlay
