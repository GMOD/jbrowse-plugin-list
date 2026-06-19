import React from 'react'

import { Tooltip } from '@mui/material'
import { observer } from 'mobx-react'

import { CHAR_WIDTH } from '../constants'

import type { JBrowsePluginProteinStructureModel } from '../model'

export interface ResidueCell {
  col: number
  value: number
}

/**
 * A per-residue scalar track (e.g. pLDDT, hydrophobicity) rendered as colored
 * cells aligned to the pairwise-alignment columns, matching the UniProt feature
 * tracks. Hovering drives the same structure hover as the feature tracks.
 */
const ResidueValueTrack = observer(function ResidueValueTrack({
  cells,
  colorFor,
  formatValue,
  sequenceLength,
  model,
}: {
  cells: ResidueCell[]
  colorFor: (value: number) => string
  formatValue: (value: number) => string
  sequenceLength: number
  model: JBrowsePluginProteinStructureModel
}) {
  return (
    <div
      style={{
        position: 'relative',
        height: model.trackHeight,
        width: sequenceLength * CHAR_WIDTH,
        marginBottom: model.trackGap,
      }}
      onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const alignmentPos = Math.floor((e.clientX - rect.left) / CHAR_WIDTH)
        if (alignmentPos >= 0 && alignmentPos < sequenceLength) {
          model.hoverAlignmentPosition(alignmentPos)
        }
      }}
      onMouseLeave={() => {
        model.setHoveredPosition(undefined)
      }}
    >
      {cells.map(cell => (
        <Tooltip key={cell.col} title={formatValue(cell.value)} followCursor>
          <div
            style={{
              position: 'absolute',
              left: cell.col * CHAR_WIDTH,
              top: 0,
              width: CHAR_WIDTH,
              height: model.trackHeight,
              backgroundColor: colorFor(cell.value),
            }}
          />
        </Tooltip>
      ))}
    </div>
  )
})

export default ResidueValueTrack
