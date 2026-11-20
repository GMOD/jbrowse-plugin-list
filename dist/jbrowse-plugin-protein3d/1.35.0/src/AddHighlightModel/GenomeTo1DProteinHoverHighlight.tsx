import React from 'react'

import { getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import Highlight from './Highlight'
import {
  getProteinLinkage,
  hovered1DProteinPosition,
} from '../Protein1DLinkage'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// Marks, on a 1D protein-annotation view, the residue under a genome hover.
const GenomeTo1DProteinHoverHighlight = observer(
  function GenomeTo1DProteinHoverHighlight({
    model,
  }: {
    model: LinearGenomeViewModel
  }) {
    const linkage = getProteinLinkage(model)
    const proteinPos = hovered1DProteinPosition(getSession(model), model)
    if (!linkage || proteinPos === undefined) {
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
