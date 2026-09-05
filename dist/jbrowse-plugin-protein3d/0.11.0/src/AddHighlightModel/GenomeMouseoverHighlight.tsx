import React from 'react'

import { getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import Highlight from './Highlight'
import { getProteinViews, getStructuresConnectedTo } from './proteinViewLookup'
import { checkHovered } from '../ProteinView/util'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// Marks the hovered base on a genome view that a structure is connected to, so
// the residue lit in 3D can be traced back. Other genome views get nothing: a
// protein view somewhere in the session says nothing about them.
const GenomeMouseoverHighlight = observer(function GenomeMouseoverHighlight({
  model,
}: {
  model: LinearGenomeViewModel
}) {
  const session = getSession(model)
  const { hovered } = session
  const { assemblyNames, id } = model
  const connected =
    getStructuresConnectedTo(getProteinViews(session), id).length > 0
  if (connected && checkHovered(hovered)) {
    const { coord, refName } = hovered.hoverPosition
    return (
      <Highlight
        model={model}
        region={{
          start: coord - 1,
          end: coord,
          refName,
          assemblyName: assemblyNames[0]!,
        }}
      />
    )
  }
  return null
})

export default GenomeMouseoverHighlight
