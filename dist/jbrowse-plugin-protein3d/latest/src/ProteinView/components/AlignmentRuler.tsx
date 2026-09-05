import React from 'react'

import { observer } from 'mobx-react'

import { CHAR_WIDTH, ROW_HEIGHT } from '../constants'

import type { JBrowsePluginProteinStructureModel } from '../model'

/** Which alignment columns get a tick, and which of those a label, in
 * 1-based structure residue numbers so the ruler reads like the 3D view's
 * hover text. Pure so it can be tested without the DOM. */
export function rulerTicks(
  alignmentToStructure: Record<number, number> | undefined,
  columns: number,
) {
  const ticks: { col: number; label?: string }[] = []
  if (!alignmentToStructure) {
    return ticks
  }
  for (let col = 0; col < columns; col++) {
    const pos = alignmentToStructure[col]
    if (pos === undefined) {
      continue
    }
    const residue = pos + 1
    if (residue % 10 === 0) {
      ticks.push({ col, label: `${residue}` })
    } else if (residue % 5 === 0) {
      ticks.push({ col })
    }
  }
  return ticks
}

const AlignmentRuler = observer(function AlignmentRuler({
  model,
  columns,
}: {
  model: JBrowsePluginProteinStructureModel
  columns: number
}) {
  const ticks = rulerTicks(model.pairwiseAlignmentToStructurePosition, columns)
  return (
    <div
      style={{
        position: 'relative',
        height: ROW_HEIGHT,
        width: columns * CHAR_WIDTH,
        color: '#888',
        fontSize: 8,
      }}
    >
      {ticks.map(({ col, label }) => (
        <span
          key={col}
          style={{
            position: 'absolute',
            left: col * CHAR_WIDTH,
            top: 0,
            height: ROW_HEIGHT,
            borderLeft: '1px solid #aaa',
            paddingLeft: 2,
            lineHeight: `${ROW_HEIGHT}px`,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      ))}
    </div>
  )
})

export default AlignmentRuler
