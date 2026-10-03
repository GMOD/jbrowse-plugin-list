import { getSession } from '@jbrowse/core/util'
import { alpha } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { graphViewHighlights } from './graphViewHighlights'

import type { HighlightRegion } from './graphViewHighlights'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const useStyles = makeStyles()(theme => ({
  highlight: {
    height: '100%',
    position: 'absolute',
    background: alpha(theme.palette.primary.main, 0.25),
    borderLeft: `2px solid ${theme.palette.primary.main}`,
    borderRight: `2px solid ${theme.palette.primary.main}`,
    pointerEvents: 'none',
    zIndex: 10,
  },
}))

// One band over the linear view for a hovered graph node. `getHighlightCoords`
// is the LGV's own projection — it canonicalizes the refName and floors the
// width to 3 px, so a pure insertion (a zero-length reference span) still shows
// as a mark rather than vanishing.
const Highlight = observer(function Highlight({
  model,
  region,
}: {
  model: LinearGenomeViewModel
  region: HighlightRegion
}) {
  const { classes } = useStyles()
  const coords = model.getHighlightCoords(region)
  return coords ? (
    <div
      data-testid="graph-node-highlight"
      className={classes.highlight}
      style={{ left: coords.left, width: coords.width }}
    />
  ) : null
})

const GraphNodeHighlight = observer(function GraphNodeHighlight({
  model,
}: {
  model: LinearGenomeViewModel
}) {
  const { views } = getSession(model)
  return (
    <>
      {graphViewHighlights([...views], model.id, model.assemblyNames).map(
        ({ key, region }) => (
          <Highlight key={`graph-hover-${key}`} model={model} region={region} />
        ),
      )}
    </>
  )
})

export default GraphNodeHighlight
