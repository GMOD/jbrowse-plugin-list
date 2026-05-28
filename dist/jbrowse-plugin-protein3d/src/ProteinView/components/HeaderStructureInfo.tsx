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
  return structures.map(
    (structure: JBrowsePluginProteinStructureModel, idx: number) => {
      const { hoverString } = structure
      return (
        <span key={idx}>
          {hoverString ? `Hover: ${hoverString}` : ''}
          &nbsp;
        </span>
      )
    },
  )
})

export default HeaderStructureInfo
