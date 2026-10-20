import React from 'react'

import { observer } from 'mobx-react'

import GenomeMouseoverHighlight from './GenomeMouseoverHighlight'
import GenomeTo1DProteinHoverHighlight from './GenomeTo1DProteinHoverHighlight'
import Protein1DToGenomeHoverHighlight from './Protein1DToGenomeHoverHighlight'
import ProteinToGenomeHighlight from './ProteinToGenomeHighlight'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const HighlightComponents = observer(function Highlight({
  model,
}: {
  model: LinearGenomeViewModel
}) {
  return (
    <>
      <ProteinToGenomeHighlight model={model} field="clickGenomeHighlights" />
      <ProteinToGenomeHighlight model={model} field="hoverGenomeHighlights" />
      <Protein1DToGenomeHoverHighlight model={model} />
      <GenomeTo1DProteinHoverHighlight model={model} />
      <GenomeMouseoverHighlight model={model} />
    </>
  )
})

export default HighlightComponents
