import React from 'react'

import { getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import Highlight from './Highlight'
import { protein1DViewRegistry } from '../Protein1DViewRegistry'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

interface HoveredState {
  hoverPosition: {
    coord: number
    refName: string
  }
}

function checkHoveredPosition(hovered: unknown): hovered is HoveredState {
  return (
    !!hovered &&
    typeof hovered === 'object' &&
    'hoverPosition' in hovered &&
    !!hovered.hoverPosition &&
    typeof hovered.hoverPosition === 'object' &&
    'coord' in hovered.hoverPosition &&
    'refName' in hovered.hoverPosition
  )
}

const Protein1DToGenomeHoverHighlight = observer(
  function Protein1DToGenomeHoverHighlight({
    model,
  }: {
    model: LinearGenomeViewModel
  }) {
    const session = getSession(model)
    const { hovered } = session
    const { assemblyNames, id: viewId } = model

    if (!checkHoveredPosition(hovered)) {
      return null
    }

    const { coord, refName } = hovered.hoverPosition
    const protein1DInfo = protein1DViewRegistry.getByUniprotId(refName, session)

    if (protein1DInfo?.connectedViewId !== viewId) {
      return null
    }

    const assemblyName = assemblyNames[0]
    if (!assemblyName) {
      return null
    }

    const genomeHighlight =
      protein1DViewRegistry.getGenomeHighlightForProteinPosition(
        refName,
        coord - 1,
        session,
      )

    if (!genomeHighlight) {
      return null
    }

    return (
      <Highlight
        model={model}
        start={genomeHighlight.start}
        end={genomeHighlight.end}
        refName={genomeHighlight.refName}
        assemblyName={assemblyName}
      />
    )
  },
)

export default Protein1DToGenomeHoverHighlight
