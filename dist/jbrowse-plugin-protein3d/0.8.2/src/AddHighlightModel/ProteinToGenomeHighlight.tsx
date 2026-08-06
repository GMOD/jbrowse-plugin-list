import React from 'react'

import { observer } from 'mobx-react'

import ProteinToGenomeHighlightInner from './ProteinToGenomeHighlightInner'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export const ProteinToGenomeClickHighlight = observer(
  function ProteinToGenomeClickHighlight({
    model,
  }: {
    model: LinearGenomeViewModel
  }) {
    return (
      <ProteinToGenomeHighlightInner
        model={model}
        field="clickGenomeHighlights"
      />
    )
  },
)

export const ProteinToGenomeHoverHighlight = observer(
  function ProteinToGenomeHoverHighlight({
    model,
  }: {
    model: LinearGenomeViewModel
  }) {
    return (
      <ProteinToGenomeHighlightInner
        model={model}
        field="hoverGenomeHighlights"
      />
    )
  },
)
