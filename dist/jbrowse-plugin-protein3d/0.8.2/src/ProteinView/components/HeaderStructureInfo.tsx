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
  const hoverText = structures
    .map(
      (structure: JBrowsePluginProteinStructureModel) => structure.hoverString,
    )
    .filter(Boolean)
    .join(' ')
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
