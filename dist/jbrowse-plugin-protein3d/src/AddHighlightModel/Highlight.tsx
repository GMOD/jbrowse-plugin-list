import React from 'react'

import { getSession } from '@jbrowse/core/util'
import { observer } from 'mobx-react'

import { useStyles } from './util'

import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const Highlight = observer(function Highlight({
  assemblyName,
  start,
  end,
  refName,
  model,
}: {
  model: LinearGenomeViewModel
  assemblyName: string
  start: number
  end: number
  refName: string
}) {
  const { cx, classes } = useStyles()
  const { assemblyManager } = getSession(model)
  const { offsetPx } = model
  const assembly = assemblyManager.get(assemblyName)
  const ref = assembly?.getCanonicalRefName(refName) ?? refName
  const s = model.bpToPx({ refName: ref, coord: start })
  const e = model.bpToPx({ refName: ref, coord: end })
  if (s && e) {
    const width = Math.max(Math.abs(e.offsetPx - s.offsetPx), 3)
    const left = Math.min(s.offsetPx, e.offsetPx) - offsetPx
    return (
      <div
        className={cx(
          classes.highlight,
          width <= 3 ? classes.thinborder : undefined,
        )}
        style={{ left, width }}
      />
    )
  } else {
    return null
  }
})

export default Highlight
