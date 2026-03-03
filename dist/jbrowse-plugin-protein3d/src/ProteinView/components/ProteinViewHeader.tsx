import React from 'react'

import { LoadingEllipses } from '@jbrowse/core/ui'
import { observer } from 'mobx-react'

import {
  JBrowsePluginProteinStructureModel,
  JBrowsePluginProteinViewModel,
} from '../model'
import AddStructureDialog from './AddStructureDialog'
import HeaderStructureInfo from './HeaderStructureInfo'
import ProteinAlignment from './ProteinAlignment'

const ProteinViewHeader = observer(function ProteinViewHeader({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  const { structures, showAlignment } = model
  return (
    <div>
      <HeaderStructureInfo model={model} />
      {showAlignment
        ? structures.map(
            (structure: JBrowsePluginProteinStructureModel, idx: number) => {
              const { pairwiseAlignment } = structure
              return (
                <div key={idx}>
                  {pairwiseAlignment ? (
                    <ProteinAlignment key={idx} model={structure} />
                  ) : (
                    <LoadingEllipses message="Loading pairwise alignment" />
                  )}
                </div>
              )
            },
          )
        : null}
      <AddStructureDialog model={model} />
    </div>
  )
})

export default ProteinViewHeader
