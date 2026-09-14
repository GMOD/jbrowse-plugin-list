import React from 'react'

import { getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import Highlight from './Highlight'
import { getProteinLinkage, linkageGenomeMapping } from '../Protein1DLinkage'
import { genomeHoverToTranscriptPos } from '../ProteinView/util'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const GenomeTo1DProteinHoverHighlight = observer(
  function GenomeTo1DProteinHoverHighlight({
    model,
  }: {
    model: LinearGenomeViewModel
  }) {
    const session = getSession(model)
    const { hovered } = session
    const { assemblyNames } = model

    const assemblyName = assemblyNames[0]
    const linkage = getProteinLinkage(model)
    if (!assemblyName || !linkage) {
      return null
    }

    const proteinPos = genomeHoverToTranscriptPos(
      hovered,
      linkageGenomeMapping(linkage),
    )
    if (proteinPos === undefined) {
      return null
    }

    return (
      <Highlight
        model={model}
        region={{
          start: proteinPos,
          end: proteinPos + 1,
          refName: linkage.uniprotId,
          assemblyName: linkage.uniprotId,
        }}
      />
    )
  },
)

export default GenomeTo1DProteinHoverHighlight
