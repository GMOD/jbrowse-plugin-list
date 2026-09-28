import { useId } from 'react'

import { ROW_HEIGHT_PX } from '@jbrowse/bandage-core/layout/rowSpacing'
import { LABEL_CHAR_PX } from '@jbrowse/bandage-core/overlayLabels'
import { REFERENCE_RAMP_ALT_CSS } from '@jbrowse/bandage-core/renderer/GeometryBuilder'
import { observer } from 'mobx-react'

import { RAMP_GRADIENT_CSS, rampHueCss, rampStops } from './referenceRampCss'
import { CALL_TOLERANCE } from '../repeats/walkCalls'

import type { GraphPaneModel } from '../model'
import type { RepeatSequence, RepeatUnit } from '../repeats/repeatFeatures'
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
// A repeat record that states each allele's runs (VCF 4.5 <CNV:TR> RN, RUS,
// RUC, RB) paints every bar by unit instead: the allele paired with THAT walk,
// one colour per unit the record names. A record stating only a length marks
// it with a tick. The walk rows pair them — see repeats/walkCalls.ts, which
// also holds the threshold this reads a red readout off.

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

// Tableau 10, whose leading hues stay apart in lightness as well as hue
const UNIT_COLORS = [
  '#4e79a7',
  '#f28e2b',
  '#59a14f',
  '#e15759',
  '#76b7b2',
  '#edc948',
  '#b07aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ac',
]
const NO_ALLELE = '#d0d0d0'
// the canvas's grey scheme, for the backbone past the array when no ramp is
// drawn anywhere else
const BACKBONE = 'rgb(160, 160, 160)'

function unitColor(units: RepeatUnit[], unit: string) {
  const i = units.findIndex(u => u.unit === unit)
  return i < 0 ? NO_ALLELE : UNIT_COLORS[i % UNIT_COLORS.length]!
}

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
  model: GraphPaneModel
}) {
  const bars = model.walkRowBars
  if (!bars) {
    return null
  }
  const ramp = model.referenceRampDomain
  const units = model.walkRowUnits
  const drawn = [bars.reference, ...bars.rows]
  const calls = drawn.flatMap(row =>
    row.call && !row.call.sequences ? row.call : [],
  )
  return (
    <div style={legendBoxStyle} data-testid="graph-walk-rows-legend">
      {units ? (
        <>
          {units.map((unit, i) => (
            <div key={unit.unit} style={legendRowStyle}>
              <div
                style={{
                  ...swatchStyle,
                  backgroundColor: unitColor(units, unit.unit),
                }}
              />
              <span>
                unit {i + 1} · {unit.unitLength.toLocaleString()} bp
              </span>
            </div>
          ))}
          {drawn.some(row => !row.call?.sequences) ? (
            <div style={legendRowStyle}>
              <div style={{ ...swatchStyle, backgroundColor: NO_ALLELE }} />
              <span>no allele in the repeat track</span>
            </div>
          ) : null}
        </>
      ) : (
        <>
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
        </>
      )}
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

// A call stating its runs counts its copies outright; otherwise the bar's
// length in units is the estimate.
function copies(bp: number, unit: number | undefined, call?: WalkCall) {
  if (!call?.sequences) {
    return units(bp, unit)
  }
  const n = call.sequences.reduce((sum, run) => sum + run.count, 0)
  return ` · ${Number.isInteger(n) ? n : n.toFixed(1)} copies`
}

function readout(
  row: { bp: number; complete: boolean; call?: WalkCall },
  referenceBp: number,
  unit: number | undefined,
) {
  const { bp, complete, call } = row
  const delta = bp - referenceBp
  const against =
    delta === 0 ? '' : ` (${delta > 0 ? '+' : '−'}${kb(Math.abs(delta))})`
  const called = call && !call.sequences ? calledReadout(call) : ''
  return `${kb(bp)}${copies(bp, unit, call)}${against}${complete ? '' : ' · partial walk'}${called}`
}

function calledReadout(call: { bp: number; spanningReads?: number }) {
  const unbacked = call.spanningReads === 0 ? ' · no spanning read' : ''
  return ` · called ${kb(call.bp)}${unbacked}`
}

// Each run's extent from the bar's left end, and where each of its copies
// starts: RUB's lengths where the record gives them, else the unit's.
function runsOf(sequences: RepeatSequence[]) {
  let at = 0
  return sequences.map(run => {
    const start = at
    const lengths =
      run.copyBp ??
      Array.from({ length: Math.ceil(run.count) }, () => run.unitLength)
    const copyStarts: number[] = []
    let copy = start
    for (const bp of lengths) {
      copyStarts.push(copy)
      copy += bp
    }
    at += run.bp
    return { start, bp: run.bp, unit: run.unit, copyStarts }
  })
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

// A shared run covers its reference contiguously, so a gradient along it
// paints the hue of every base.
function runFill(
  run: WalkRun,
  ramp: { start: number; end: number } | undefined,
  gradientId: string,
) {
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
  const units = model.walkRowUnits
  // The backbone the canvas draws spans the cut window, which reaches past a
  // selected array on both sides, so the reference readout sits after it.
  const backboneStart = Math.min(origin, model.graphRegion?.start ?? origin)
  const backboneEnd = Math.max(
    origin + reference.bp,
    model.graphRegion?.end ?? 0,
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
  const rect = (start: number, bp: number, y: number, fill: string) => (
    <rect
      key={start}
      x={X(origin + start)}
      y={y - BAR_PX / 2}
      width={Math.max(1, bp * scaleX)}
      height={BAR_PX}
      fill={fill}
    />
  )
  // The paired allele's runs, cut at the end of the walk, over grey where it
  // states none.
  const unitBar = (
    row: { bp: number; call?: WalkCall },
    y: number,
    painted: RepeatUnit[],
  ) => {
    const runs = row.call?.sequences ? runsOf(row.call.sequences) : []
    const tiled = unit !== undefined && unit * scaleX >= MIN_TILE_PX
    return (
      <>
        {rect(0, row.bp, y, NO_ALLELE)}
        {runs
          .filter(run => run.start < row.bp)
          .map(run =>
            rect(
              run.start,
              Math.min(run.bp, row.bp - run.start),
              y,
              unitColor(painted, run.unit),
            ),
          )}
        {tiled
          ? separators(
              runs.flatMap(run => run.copyStarts),
              row.bp,
              y,
            )
          : null}
      </>
    )
  }
  return (
    <svg
      style={svgStyle}
      width={width}
      height={canvasHeight}
      data-testid="graph-walk-rows"
    >
      {units ? (
        <>
          <rect
            x={X(backboneStart) - BAR_PX / 2}
            y={Y(0) - BAR_PX / 2}
            width={(backboneEnd - backboneStart) * scaleX + BAR_PX}
            height={BAR_PX}
            rx={BAR_PX / 2}
            fill={BACKBONE}
          />
          {unitBar(reference, Y(0), units)}
        </>
      ) : null}
      {label(
        `${kb(reference.bp)}${copies(reference.bp, unit, reference.call)}`,
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
            {units ? (
              unitBar(row, y, units)
            ) : (
              <>
                {row.runs.map(run => {
                  const { fill, gradient } = runFill(
                    run,
                    ramp,
                    `${idPrefix}-${i}-${run.start}`,
                  )
                  return (
                    <g key={run.start}>
                      {gradient}
                      {rect(run.start, run.bp, y, fill)}
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
              </>
            )}
            {call && !call.sequences ? (
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
              readout(row, reference.bp, unit),
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
