import React from 'react'

import { observer } from 'mobx-react'

import GenomeMouseoverHighlight from './GenomeMouseoverHighlight'
import GenomeTo1DProteinHoverHighlight from './GenomeTo1DProteinHoverHighlight'
import Protein1DToGenomeHoverHighlight from './Protein1DToGenomeHoverHighlight'
import ProteinToGenomeClickHighlight from './ProteinToGenomeClickHighlight'
import ProteinToGenomeHoverHighlight from './ProteinToGenomeHoverHighlight'
import ProteinToMsaHoverSync from './ProteinToMsaHoverSync'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const HighlightComponents = observer(function Highlight({
  model,
}: {
  model: LinearGenomeViewModel
}) {
  return (
    <>
      <ProteinToGenomeClickHighlight model={model} />
      <ProteinToGenomeHoverHighlight model={model} />
      <Protein1DToGenomeHoverHighlight model={model} />
      <GenomeTo1DProteinHoverHighlight model={model} />
      <GenomeMouseoverHighlight model={model} />
      <ProteinToMsaHoverSync model={model} />
    </>
  )
})

export default HighlightComponents
