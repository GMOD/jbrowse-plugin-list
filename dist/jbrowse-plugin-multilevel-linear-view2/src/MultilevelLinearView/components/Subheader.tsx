import React from 'react'
import { observer } from 'mobx-react'

import { LinearGenomeMultilevelViewModel } from '../../LinearGenomeMultilevelView/model'
import { MultilevelLinearViewModel } from '../model'
import Controls from './Controls'

type MLLV = MultilevelLinearViewModel
type LGMLV = LinearGenomeMultilevelViewModel

const Subheader = observer(
  ({
    model,
    view,
    polygonPoints,
  }: {
    model: MLLV
    view: LGMLV
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    polygonPoints: any
  }) => {
    return (
      <div data-testid="subheader">
        <Controls model={model} view={view} polygonPoints={polygonPoints} />
      </div>
    )
  },
)

export default Subheader
