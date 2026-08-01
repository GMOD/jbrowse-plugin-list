import React from 'react'

import { getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import Highlight from './Highlight'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

interface HoverPosition {
  coord: number
  refName: string
}

function getHoverPosition(hovered: unknown): HoverPosition | undefined {
  const pos =
    !!hovered && typeof hovered === 'object' && 'hoverPosition' in hovered
      ? hovered.hoverPosition
      : undefined
  return !!pos &&
    typeof pos === 'object' &&
    'coord' in pos &&
    typeof pos.coord === 'number' &&
    'refName' in pos &&
    typeof pos.refName === 'string'
    ? { coord: pos.coord, refName: pos.refName }
    : undefined
}

const GenomeMouseoverHighlight = observer(function GenomeMouseoverHighlight2({
  model,
}: {
  model: LinearGenomeViewModel
}) {
  const hoverPosition = getHoverPosition(getSession(model).hovered)
  return hoverPosition ? (
    <Highlight
      model={model}
      refName={hoverPosition.refName}
      start={hoverPosition.coord - 1}
      end={hoverPosition.coord}
    />
  ) : null
})

export default GenomeMouseoverHighlight
