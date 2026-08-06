import React from 'react'

import { SimpleFeature, getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import Highlight from './Highlight'
import { protein1DViewRegistry } from '../Protein1DViewRegistry'
import { genomeHoverToTranscriptPos } from '../ProteinView/util'
import { genomeToTranscriptSeqMapping } from '../mappings'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

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

    const feature = new SimpleFeature(protein1DInfo.feature)
    const proteinPos = genomeHoverToTranscriptPos(
      hovered,
      genomeToTranscriptSeqMapping(feature),
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
          refName: protein1DInfo.uniprotId,
          assemblyName: protein1DInfo.uniprotId,
        }}
      />
    )
  },
)

export default GenomeTo1DProteinHoverHighlight
