import React from 'react'

import { observer } from 'mobx-react'

import { useStyles } from './util'

import type { HighlightKind, HighlightRegion } from './util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const Highlight = observer(function Highlight({
  region,
  model,
  kind,
}: {
  model: Pick<LinearGenomeViewModel, 'getHighlightCoords'>
  region: HighlightRegion
  kind: HighlightKind
}) {
  const { cx, classes } = useStyles()
  const coords = model.getHighlightCoords(region)
  const thin = coords && coords.width <= 3
  return coords ? (
    <div
      data-highlight={kind}
      className={cx(
        classes.highlight,
        classes[kind],
        thin
          ? kind === 'selection'
            ? classes.selectionThin
            : classes.hoverThin
          : undefined,
      )}
      style={{ left: coords.left, width: coords.width }}
    />
  ) : null
})

export default Highlight
