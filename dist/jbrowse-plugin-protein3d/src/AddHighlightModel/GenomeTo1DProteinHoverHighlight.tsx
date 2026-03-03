import React from 'react'

import { SimpleFeature, getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import Highlight from './Highlight'
import { protein1DViewRegistry } from '../Protein1DViewRegistry'
import { genomeToTranscriptSeqMapping } from '../mappings'

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

const GenomeTo1DProteinHoverHighlight = observer(
  function GenomeTo1DProteinHoverHighlight({
    model,
  }: {
    model: LinearGenomeViewModel
  }) {
    const session = getSession(model)
    const { hovered } = session
    const { assemblyNames, id: viewId } = model

    const assemblyName = assemblyNames[0]
    if (!assemblyName) {
      return null
    }

    const protein1DInfo = protein1DViewRegistry.get(viewId)
    if (!protein1DInfo) {
      return null
    }

    if (!checkHoveredPosition(hovered)) {
      return null
    }

    const { coord } = hovered.hoverPosition

    const feature = new SimpleFeature(protein1DInfo.feature)
    const mapping = genomeToTranscriptSeqMapping(feature)
    const { g2p } = mapping
    const proteinPos = g2p[coord - 1]
    if (proteinPos === undefined) {
      return null
    }

    return (
      <Highlight
        model={model}
        start={proteinPos}
        end={proteinPos + 1}
        refName={protein1DInfo.uniprotId}
        assemblyName={protein1DInfo.uniprotId}
      />
    )
  },
)

export default GenomeTo1DProteinHoverHighlight
