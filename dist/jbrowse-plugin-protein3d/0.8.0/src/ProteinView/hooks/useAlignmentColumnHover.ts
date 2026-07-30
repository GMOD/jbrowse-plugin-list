import type React from 'react'

import { CHAR_WIDTH } from '../constants'

import type { JBrowsePluginProteinStructureModel } from '../model'

/**
 * Shared mouse handlers for tracks that map cursor x-position to an alignment
 * column and drive the structure hover. Optionally reports the hovered column
 * (used by tracks that show a per-column tooltip).
 */
export default function useAlignmentColumnHover(
  model: JBrowsePluginProteinStructureModel,
  sequenceLength: number,
  onCol?: (col: number | undefined) => void,
) {
  return {
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const col = Math.floor((e.clientX - rect.left) / CHAR_WIDTH)
      const inRange = col >= 0 && col < sequenceLength
      onCol?.(inRange ? col : undefined)
      if (inRange) {
        model.hoverAlignmentPosition(col)
      }
    },
    onMouseLeave: () => {
      onCol?.(undefined)
      model.setHoveredPosition(undefined)
    },
  }
}
