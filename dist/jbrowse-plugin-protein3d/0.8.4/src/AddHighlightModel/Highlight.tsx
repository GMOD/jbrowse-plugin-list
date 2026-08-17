import React from 'react'

import { observer } from 'mobx-react'

import { getHighlightCoords, useStyles } from './util'

import type { HighlightRegion } from './util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const Highlight = observer(function Highlight({
  region,
  model,
}: {
  model: LinearGenomeViewModel
  region: HighlightRegion
}) {
  const { cx, classes } = useStyles()
  const coords = getHighlightCoords(model, region)
  return coords ? (
    <div
      className={cx(
        classes.highlight,
        coords.width <= 3 ? classes.thinborder : undefined,
      )}
      style={{ left: coords.left, width: coords.width }}
    />
  ) : null
})

export default Highlight
