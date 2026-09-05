import React from 'react'

import { observer } from 'mobx-react'

import type {
  JBrowsePluginProteinStructureModel,
  JBrowsePluginProteinViewModel,
} from '../model'

const HeaderStructureInfo = observer(function HeaderStructureInfo({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const { structures } = model
  // With several structures open a hover lights the same residue on each, so
  // every readout is prefixed with the structure it describes. A genome hover
  // that reaches one structure but not another says so, since a crystal that
  // lacks the residue is the point of showing several.
  const genomeHover = structures.some(
    (s: JBrowsePluginProteinStructureModel) =>
      s.hoverPosition?.source === 'genome',
  )
  const readouts = structures.map(
    (s: JBrowsePluginProteinStructureModel) =>
      s.hoverString || (genomeHover ? 'not in structure' : ''),
  )
  const hoverText = structures
    .map((s: JBrowsePluginProteinStructureModel, i) =>
      readouts[i] && structures.length > 1 && s.label
        ? `${s.label}: ${readouts[i]}`
        : readouts[i],
    )
    .filter(Boolean)
    .join(' | ')
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: 12,
      }}
      title={hoverText}
    >
      {/* nbsp keeps the line height stable when there is no hover */}
      {hoverText ? `Hover: ${hoverText}` : ' '}
    </div>
  )
})

export default HeaderStructureInfo
