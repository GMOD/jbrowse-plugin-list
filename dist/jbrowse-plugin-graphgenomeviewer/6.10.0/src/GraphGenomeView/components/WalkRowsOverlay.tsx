import { useId } from 'react'

import {
  BAR_PX,
  CALL_TICK,
  DISAGREES,
  GAP_PX,
  GENE_INK,
  UNBACKED_TICK,
  walkRowsKey,
  walkRowsTree,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import { RAMP_GRADIENT_CSS } from '@jbrowse/bandage-core/referenceRampCss'
import { observer } from 'mobx-react'

import ElTree from './ElTree'
import { legendBoxStyle, legendRowStyle } from './legendStyles'
import { CALL_TOLERANCE } from '../repeats/walkCalls'
import { SECTION_HEADER_PX } from '../walkRowGroups'

import type { GraphPaneModel } from '../model'
import type { WalkRowSection } from '../walkRowGroups'
import type { El } from '@jbrowse/bandage-core/el'
import type {
  KeySwatch,
  WalkRowsFrame,
  WalkRowsWithCalls,
} from '@jbrowse/bandage-core/layout/walkRowDraw'

// The walk-rows layout's bars: one per haplotype walk under the reference
// row, each on its own bp axis from the window's left edge, drawn from core's
// walkRowsTree: runs coloured by whether they are on the reference walk's
// path, unit separators, each row's genes from its own assembly's
// annotation, the allele a repeat genotype called and a readout. Under the
// reference-position ramp an aligned run takes the hue of the reference it is
// threaded through. In a tandem array that is the aligner's pick among
// near-identical copies, so the hue says which reference copy the graph used,
// not which one a copy resembles.
//
// The walk rows pair a repeat record's allele with each walk — see
// repeats/walkCalls.ts, which also holds the threshold a red readout is read
// off. Colouring each copy by its unit is jbrowse-plugin-tandem-repeat's.

const svgStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  pointerEvents: 'none' as const,
  overflow: 'visible' as const,
  zIndex: 3,
}

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

export function Swatch({ swatch }: { swatch: KeySwatch }) {
  return swatch.kind === 'gene' ? (
    <div
      style={{
        ...swatchStyle,
        boxSizing: 'border-box',
        border: `1.5px solid ${GENE_INK}`,
        borderRadius: 0,
      }}
    />
  ) : (
    <div
      style={{
        ...swatchStyle,
        height: swatch.kind === 'gap' ? GAP_PX : swatchStyle.height,
        background: swatch.fill,
      }}
    />
  )
}

// What the bar colours, genes and ticks mean, in the legend stack with the
// other keys. Each tick row appears once the rows hold one, so a catalogue
// with no genotypes keeps the plain key.
export const WalkRowsLegend = observer(function WalkRowsLegend({
  model,
}: {
  model: GraphPaneModel
}) {
  const bars = model.walkRowBars
  if (!bars) {
    return null
  }
  const calls = [bars.reference, ...bars.rows].flatMap(row => row.call ?? [])
  const key = walkRowsKey(bars, {
    ramp: model.referenceRampDomain,
    rampCss: RAMP_GRADIENT_CSS,
    genes: model.walkRowGeneKey,
  })
  return (
    <div style={legendBoxStyle} data-testid="graph-walk-rows-legend">
      {key.map(entry =>
        entry.note ? (
          <div key={entry.label} style={{ color: '#666', fontStyle: 'italic' }}>
            {entry.label}
          </div>
        ) : (
          <div key={entry.label} style={legendRowStyle}>
            <Swatch swatch={entry.swatch} />
            <span>{entry.label}</span>
          </div>
        ),
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
          <TickSwatch color={DISAGREES} />
          <span>
            walk and call over {Math.round(CALL_TOLERANCE * 100)}% apart
          </span>
        </div>
      ) : null}
    </div>
  )
})

// The rows' trees, a section at a time while grouped. walkRowsTree puts its
// i-th row at i * rowPx below its reference row and draws that row too, so
// each section is drawn shifted down to its place with its reference row
// dropped.
export function walkRowTrees(
  bars: WalkRowsWithCalls,
  sections: WalkRowSection[],
  rowY: (i: number) => number,
  frame: WalkRowsFrame & { rowPx: number },
  o: Parameters<typeof walkRowsTree>[2] & { idPrefix: string },
): El[] {
  if (sections.length === 0) {
    return [walkRowsTree(bars, frame, o)]
  }
  return [
    walkRowsTree({ ...bars, rows: [] }, frame, o),
    ...sections.flatMap((section, k) => {
      const tree = walkRowsTree(
        {
          ...bars,
          rows: bars.rows.slice(
            section.first - 1,
            section.first - 1 + section.count,
          ),
        },
        {
          ...frame,
          translateY:
            frame.translateY +
            (rowY(section.first) - frame.rowPx) * frame.scaleY,
        },
        { ...o, idPrefix: `${o.idPrefix}-s${k}` },
      )
      return tree.children.filter(
        (c): c is El =>
          typeof c !== 'string' &&
          c.attrs['data-testid'] !== 'graph-walk-reference',
      )
    }),
  ]
}

const WalkRowsOverlay = observer(function WalkRowsOverlay({
  model,
}: {
  model: GraphPaneModel
}) {
  const idPrefix = useId().replace(/[^\w-]/g, '')
  const bars = model.walkRowBars
  const place = model.walkRowPlacement
  const pitch = model.walkRowPitch
  if (!bars || !place || !pitch) {
    return null
  }
  const { paneWidth: width, canvasHeight } = model
  const Y = (y: number) => y * model.scaleY + model.translateY
  const hovered = model.hoveredWalkRowText
    ? [bars.reference, ...bars.rows].findIndex(
        r => r.name === model.hoveredWalkRow,
      )
    : -1
  const row =
    hovered >= 0 ? [bars.reference, ...bars.rows][hovered]! : undefined
  const frame = {
    scaleX: model.scaleX,
    scaleY: model.scaleY,
    translateX: model.translateX,
    translateY: model.translateY,
    width,
    height: canvasHeight,
    ...pitch,
  }
  return (
    <svg
      style={svgStyle}
      width={width}
      height={canvasHeight}
      data-testid="graph-walk-rows"
    >
      {walkRowTrees(
        bars,
        model.walkRowGroups?.sections ?? [],
        place.rowY,
        frame,
        {
          ramp: model.referenceRampDomain,
          rowGenes: model.walkRowGenes,
          idPrefix,
        },
      ).map((tree, i) => (
        <ElTree key={i} el={tree} />
      ))}
      {place.headers.map(header => (
        <text
          key={header.key}
          x={10}
          y={Y(header.top) + SECTION_HEADER_PX - 4}
          fontFamily="sans-serif"
          fontSize={11}
          fontWeight="bold"
          fill="#333"
          data-testid="graph-walk-section"
        >
          {header.title}
        </text>
      ))}
      {row ? (
        <rect
          data-testid="graph-walk-row-hovered"
          x={bars.origin * model.scaleX + model.translateX - 2}
          y={Y(place.rowY(hovered)) - pitch.rowPx / 2 - 1}
          width={row.bp * model.scaleX + 4}
          height={pitch.rowPx + 2}
          fill="none"
          stroke="#111"
          strokeWidth={1}
        />
      ) : null}
    </svg>
  )
})

export default WalkRowsOverlay
