import React from 'react'

import { observer } from 'mobx-react'

import {
  HOVER_COLOR,
  HOVER_RANGE_COLOR,
  MATCH_COLOR,
  SELECTION_COLOR,
  SELECTION_OUTLINE,
} from '../constants'
import { positionRuns } from '../residueRanges'

import type { JBrowsePluginProteinStructureModel } from '../model'

function Band({
  start,
  end,
  columnWidth,
  background,
  border,
}: {
  start: number
  end: number
  columnWidth: number
  background: string
  border?: string
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: start * columnWidth,
        width: (end - start + 1) * columnWidth,
        background,
        border,
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    />
  )
}

function Layer({
  zIndex,
  children,
}: {
  zIndex: number
  children: React.ReactNode
}) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex }}
    >
      {children}
    </div>
  )
}

/**
 * The persistent state, drawn beneath every row: a band on top would tint the
 * pLDDT cells and feature bars inside it, and those colours are data. The
 * aligned portion (`showHighlight`) lights the sequence rows, `matchHeight`
 * tall, and the selection's fill goes over it; ColumnOverlays draws the
 * selection's outline over the rows.
 */
export const SelectionBackdrop = observer(function SelectionBackdrop({
  model,
  matchHeight,
}: {
  model: JBrowsePluginProteinStructureModel
  matchHeight: number
}) {
  const {
    clickAlignmentRanges,
    columnWidth,
    showHighlight,
    alignmentMatchSet,
  } = model
  return (
    <Layer zIndex={0}>
      {showHighlight && alignmentMatchSet ? (
        <div style={{ position: 'relative', height: matchHeight }}>
          {positionRuns(alignmentMatchSet).map(run => (
            <Band
              key={run.start}
              start={run.start}
              end={run.end - 1}
              columnWidth={columnWidth}
              background={MATCH_COLOR}
            />
          ))}
        </div>
      ) : null}
      {clickAlignmentRanges.map(range => (
        <Band
          key={range.start}
          start={range.start}
          end={range.end}
          columnWidth={columnWidth}
          background={SELECTION_COLOR}
        />
      ))}
    </Layer>
  )
})

/**
 * The interaction state, drawn once over every row of the panel so the
 * sequence, the ruler and the tracks all agree on which columns are hovered
 * and selected. Columns are inclusive.
 */
const ColumnOverlays = observer(function ColumnOverlays({
  model,
}: {
  model: JBrowsePluginProteinStructureModel
}) {
  const {
    clickAlignmentRanges,
    alignmentHoverRange,
    alignmentHoverPos,
    columnWidth,
  } = model
  return (
    <Layer zIndex={1}>
      {clickAlignmentRanges.map(range => (
        <Band
          key={range.start}
          start={range.start}
          end={range.end}
          columnWidth={columnWidth}
          background="transparent"
          border={SELECTION_OUTLINE}
        />
      ))}
      {alignmentHoverRange ? (
        <Band
          start={alignmentHoverRange.start}
          end={alignmentHoverRange.end}
          columnWidth={columnWidth}
          background={HOVER_RANGE_COLOR}
        />
      ) : null}
      {alignmentHoverPos === undefined ? null : (
        <Band
          start={alignmentHoverPos}
          end={alignmentHoverPos}
          columnWidth={columnWidth}
          background={HOVER_COLOR}
        />
      )}
    </Layer>
  )
})

export default ColumnOverlays
