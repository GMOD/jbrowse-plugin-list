import React, { useMemo } from 'react'

import { Tooltip } from '@mui/material'
import { observer } from 'mobx-react'

import type { JBrowsePluginProteinStructureModel } from '../model'

export interface ResidueCell {
  col: number
  value: number
}

const Cells = observer(function Cells({
  cells,
  colorFor,
  model,
}: {
  cells: ResidueCell[]
  colorFor: (value: number) => string
  model: JBrowsePluginProteinStructureModel
}) {
  const { columnWidth, trackHeight } = model
  return (
    <div style={{ position: 'relative', height: trackHeight }}>
      {cells.map(cell => (
        <div
          key={cell.col}
          style={{
            position: 'absolute',
            left: cell.col * columnWidth,
            width: columnWidth,
            height: trackHeight,
            backgroundColor: colorFor(cell.value),
          }}
        />
      ))}
    </div>
  )
})

/**
 * A per-residue scalar track (e.g. pLDDT, hydrophobicity) drawn as one colored
 * cell per alignment column. The panel's own pointer handler drives the hover,
 * so the tooltip reads the hovered column off the model; the cells sit in
 * their own observer so a hover elsewhere doesn't redraw them.
 */
const ResidueValueTrack = observer(function ResidueValueTrack({
  cells,
  colorFor,
  formatValue,
  model,
}: {
  cells: ResidueCell[]
  colorFor: (value: number) => string
  formatValue: (value: number) => string
  model: JBrowsePluginProteinStructureModel
}) {
  const valueByCol = useMemo(
    () => new Map(cells.map(cell => [cell.col, cell.value])),
    [cells],
  )
  const { alignmentHoverPos } = model
  const hoveredValue =
    alignmentHoverPos === undefined
      ? undefined
      : valueByCol.get(alignmentHoverPos)
  return (
    <Tooltip
      title={hoveredValue === undefined ? '' : formatValue(hoveredValue)}
      followCursor
    >
      <div>
        <Cells cells={cells} colorFor={colorFor} model={model} />
      </div>
    </Tooltip>
  )
})

export default ResidueValueTrack
