import { useId } from 'react'

import { ROW_HEIGHT_PX } from '@jbrowse/bandage-core/layout/rowSpacing'
import { LABEL_CHAR_PX } from '@jbrowse/bandage-core/overlayLabels'
import { REFERENCE_RAMP_ALT_CSS } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { observer } from 'mobx-react'

import { legendBoxStyle, legendRowStyle } from './legendStyles'
import { RAMP_GRADIENT_CSS, rampHueCss, rampStops } from './referenceRampCss'
import { CALL_TOLERANCE } from '../repeats/walkCalls'

import type { GraphPaneModel } from '../model'
import type { WalkCall } from '../repeats/walkCalls'
import type { WalkRun } from '@jbrowse/bandage-core/layout/walkRows'

// The walk-rows layout's bars: one per haplotype walk under the reference line
// the canvas draws, each on its own bp axis from the window's left edge. Blue
// marks sequence shared with the reference walk and purple sequence only the
// haplotypes carry. Under the reference-position ramp, shared sequence takes
// the hue of the reference it is threaded through and haplotype-only sequence
// the charcoal the ramp reserves for rGFA's off-reference ranks. In a tandem
// array the threading is the aligner's pick among near-identical copies, so
// the hue there says which reference copy the graph used, not which one a copy
// resembles. The readout at the end of a bar is what it carries against the
// reference, which for a repeat array is the expansion.
//
// A repeat record's allele for a walk marks its length with a tick. The walk
// rows pair them — see repeats/walkCalls.ts, which also holds the threshold
// this reads a red readout off. Colouring each copy by its unit is
// jbrowse-plugin-tandem-repeat's.

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
const OUTSIDE_CUT = '#bdbdbd'
const BAR_PX = 12
const GAP_PX = 4

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
  model: GraphPaneModel
}) {
  const bars = model.walkRowBars
  if (!bars) {
    return null
  }
  const ramp = model.referenceRampDomain
  const calls = [bars.reference, ...bars.rows].flatMap(row => row.call ?? [])
  return (
    <div style={legendBoxStyle} data-testid="graph-walk-rows-legend">
      <div style={legendRowStyle}>
        <div
          style={{
            ...swatchStyle,
            background: ramp ? RAMP_GRADIENT_CSS : ON_REFERENCE,
          }}
        />
        <span>shared with {bars.reference.label}</span>
      </div>
      <div style={legendRowStyle}>
        <div
          style={{
            ...swatchStyle,
            backgroundColor: ramp ? REFERENCE_RAMP_ALT_CSS : OFF_REFERENCE,
          }}
        />
        <span>carried by haplotypes only</span>
      </div>
      {[bars.reference, ...bars.rows].some(row => row.gapBp > 0) ? (
        <div style={legendRowStyle}>
          <div
            style={{
              ...swatchStyle,
              height: GAP_PX,
              backgroundColor: OUTSIDE_CUT,
            }}
          />
          <span>walked outside the cut</span>
        </div>
      ) : null}
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
  row: { bp: number; gapBp: number; complete: boolean; call?: WalkCall },
  referenceBp: number,
  unit: number | undefined,
) {
  const { bp, gapBp, complete, call } = row
  const delta = bp - referenceBp
  const against =
    delta === 0 ? '' : ` (${delta > 0 ? '+' : '−'}${kb(Math.abs(delta))})`
  const outside = gapBp > 0 ? ` · ${kb(gapBp)} outside the cut` : ''
  const called = call ? calledReadout(call) : ''
  return `${kb(bp)}${units(bp, unit)}${against}${outside}${complete ? '' : ' · partial walk'}${called}`
}

function calledReadout(call: { bp: number; spanningReads?: number }) {
  const unbacked = call.spanningReads === 0 ? ' · no spanning read' : ''
  return ` · called ${kb(call.bp)}${unbacked}`
}

// One separator per unit along a bar, so copies are countable, dropped when a
// unit is under a few px
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

// A shared run covers its reference contiguously, so a gradient along it
// paints the hue of every base.
function runFill(
  run: WalkRun,
  ramp: { start: number; end: number } | undefined,
  gradientId: string,
) {
  if (run.gap) {
    return { fill: OUTSIDE_CUT }
  }
  if (!ramp) {
    return { fill: run.onReference ? ON_REFERENCE : OFF_REFERENCE }
  }
  if (run.referenceStart === undefined) {
    return { fill: REFERENCE_RAMP_ALT_CSS }
  }
  const stops = rampStops({ ...run, start: run.referenceStart }, ramp)
  if (stops.length === 1) {
    return { fill: rampHueCss(stops[0]!) }
  }
  return {
    fill: `url(#${gradientId})`,
    gradient: (
      <linearGradient id={gradientId}>
        {stops.map((hue, i) => (
          <stop
            key={i}
            offset={i / (stops.length - 1)}
            stopColor={rampHueCss(hue)}
          />
        ))}
      </linearGradient>
    ),
  }
}

const WalkRowsOverlay = observer(function WalkRowsOverlay({
  model,
}: {
  model: GraphPaneModel
}) {
  const idPrefix = useId().replace(/[^\w-]/g, '')
  const { walkRowBars, referenceRampDomain: ramp } = model
  if (!walkRowBars) {
    return null
  }
  const {
    scaleX,
    scaleY,
    translateX,
    translateY,
    paneWidth: width,
    canvasHeight,
  } = model
  const X = (bp: number) => bp * scaleX + translateX
  const Y = (row: number) => row * ROW_HEIGHT_PX * scaleY + translateY
  const { origin, unit, reference, rows } = walkRowBars
  // A readout that would leave the pane is written inside the end of its bar
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
  const separators = (starts: number[], bp: number, y: number) =>
    starts
      .filter(k => k > 0 && k < bp)
      .map(k => (
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
  const rect = (
    start: number,
    bp: number,
    y: number,
    fill: string,
    height = BAR_PX,
  ) => (
    <rect
      key={start}
      x={X(origin + start)}
      y={y - height / 2}
      width={Math.max(1, bp * scaleX)}
      height={height}
      fill={fill}
    />
  )
  return (
    <svg
      style={svgStyle}
      width={width}
      height={canvasHeight}
      data-testid="graph-walk-rows"
    >
      {[reference, ...rows].map((row, i) => {
        const y = Y(i)
        if (y < -BAR_PX || y > canvasHeight + BAR_PX) {
          return null
        }
        const { call } = row
        return (
          <g
            key={row.name}
            data-testid={i === 0 ? 'graph-walk-reference' : 'graph-walk-row'}
          >
            {row.runs.map(run => {
              const { fill, gradient } = runFill(
                run,
                ramp,
                `${idPrefix}-${i}-${run.start}`,
              )
              return (
                <g key={run.start}>
                  {gradient}
                  {rect(run.start, run.bp, y, fill, run.gap ? GAP_PX : BAR_PX)}
                </g>
              )
            })}
            {unit
              ? separators(
                  tileSeparators(row.bp, unit, bp => bp * scaleX),
                  row.bp,
                  y,
                )
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
              i === 0
                ? `${kb(row.bp)}${units(row.bp, unit)}`
                : readout(row, reference.bp, unit),
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
