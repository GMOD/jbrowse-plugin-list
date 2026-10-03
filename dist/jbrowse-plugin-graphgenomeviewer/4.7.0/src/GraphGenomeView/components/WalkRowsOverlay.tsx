import { useId } from 'react'

import {
  BAR_PX,
  DISAGREES,
  GAP_PX,
  GENE_INK,
  walkRowsKey,
  walkRowsTree,
} from '@jbrowse/bandage-core/layout/walkRowDraw'
import { RAMP_GRADIENT_CSS } from '@jbrowse/bandage-core/referenceRampCss'
import { observer } from 'mobx-react'

import ElTree from './ElTree'
import { legendBoxStyle, legendRowStyle } from './legendStyles'
import { CALL_TOLERANCE } from '../repeats/walkCalls'

import type { GraphPaneModel } from '../model'
import type { KeySwatch } from '@jbrowse/bandage-core/layout/walkRowDraw'

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

const CALL_TICK = '#111'
const UNBACKED_TICK = '#9e9e9e'

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
    genes: model.walkRowGenes?.size ? model.walkRowGeneGaps : undefined,
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
          <div style={swatchStyle} />
          <span style={{ color: DISAGREES }}>
            walk and call over {Math.round(CALL_TOLERANCE * 100)}% apart
          </span>
        </div>
      ) : null}
    </div>
  )
})

const WalkRowsOverlay = observer(function WalkRowsOverlay({
  model,
}: {
  model: GraphPaneModel
}) {
  const idPrefix = useId().replace(/[^\w-]/g, '')
  const bars = model.walkRowBars
  if (!bars) {
    return null
  }
  const { paneWidth: width, canvasHeight } = model
  return (
    <svg
      style={svgStyle}
      width={width}
      height={canvasHeight}
      data-testid="graph-walk-rows"
    >
      <ElTree
        el={walkRowsTree(
          bars,
          {
            scaleX: model.scaleX,
            scaleY: model.scaleY,
            translateX: model.translateX,
            translateY: model.translateY,
            width,
            height: canvasHeight,
          },
          {
            ramp: model.referenceRampDomain,
            rowGenes: model.walkRowGenes,
            idPrefix,
          },
        )}
      />
    </svg>
  )
})

export default WalkRowsOverlay
