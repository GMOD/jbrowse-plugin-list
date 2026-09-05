import React from 'react'

import { getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import Highlight from './Highlight'
import { isTView } from '../TViewPanel/model'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const MsaToGenomeHighlight = observer(function MsaToGenomeHighlight2({
  model,
}: {
  model: LinearGenomeViewModel
}) {
  const { views } = getSession(model)
  const highlights = views
    .filter(isTView)
    .filter(v => v.connectedViewId === model.id)
    .flatMap(v => v.connectedHighlights)

  return (
    <>
      {highlights.map(r => (
        <Highlight key={`${r.refName}:${r.start}`} model={model} {...r} />
      ))}
    </>
  )
})

export default MsaToGenomeHighlight
