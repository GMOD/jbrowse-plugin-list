import React, { useMemo, useState } from 'react'

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
  const [hoveredCol, setHoveredCol] = useState<number | undefined>(undefined)
  const valueByCol = useMemo(() => {
    const map = new Map<number, number>()
    for (const cell of cells) {
      map.set(cell.col, cell.value)
    }
    return map
  }, [cells])
  const hoveredValue =
    hoveredCol === undefined ? undefined : valueByCol.get(hoveredCol)

  return (
    <Tooltip
      title={hoveredValue === undefined ? '' : formatValue(hoveredValue)}
      followCursor
    >
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
          setHoveredCol(alignmentPos)
          if (alignmentPos >= 0 && alignmentPos < sequenceLength) {
            model.hoverAlignmentPosition(alignmentPos)
          }
        }}
        onMouseLeave={() => {
          setHoveredCol(undefined)
          model.setHoveredPosition(undefined)
        }}
      >
        {cells.map(cell => (
          <div
            key={cell.col}
            style={{
              position: 'absolute',
              left: cell.col * CHAR_WIDTH,
              top: 0,
              width: CHAR_WIDTH,
              height: model.trackHeight,
              backgroundColor: colorFor(cell.value),
            }}
          />
        ))}
      </div>
    </Tooltip>
  )
})

export default ResidueValueTrack
