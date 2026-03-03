import React from 'react'

import { observer } from 'mobx-react'

import {
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
      const { clickString, hoverString } = structure
      return (
        <span key={`${clickString}-${hoverString}-${idx}`}>
          {[
            clickString ? `Click: ${clickString}` : '',
            hoverString ? `Hover: ${hoverString}` : '',
          ].join(' ')}
          &nbsp;
        </span>
      )
    },
  )
})

export default HeaderStructureInfo
