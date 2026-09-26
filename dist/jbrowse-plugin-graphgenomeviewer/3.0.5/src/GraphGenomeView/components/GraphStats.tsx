import { Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import type { GraphGenomeViewModel } from '../model'

const useStyles = makeStyles()({
  stats: {
    marginLeft: 'auto',
  },
  perf: {
    color: '#888',
    fontVariantNumeric: 'tabular-nums',
  },
})

function fmtMs(ms: number | undefined) {
  return ms === undefined ? '–' : `${Math.round(ms)}ms`
}

// The perf READOUT, off by default: it sat in the toolbar of every published
// graph figure, where one machine's fetch time is a number a reader has to work
// out is not about them. `showPerf` is in the settings menu.
//
// The numbers themselves are not conditional — they ride the stats element's
// data-* attributes either way (see GraphStats), so a browser test asserting a
// timing budget never depends on a display setting, and turning the text off
// costs no coverage. They live there rather than on this element so that
// switching the text off leaves no empty node behind to carry them.
const GraphPerf = observer(function GraphPerf({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const { classes } = useStyles()
  const { lastFetchMs, lastLayoutMs, lastGeometryMs } = model
  const hasMetrics =
    lastFetchMs !== undefined ||
    lastLayoutMs !== undefined ||
    lastGeometryMs !== undefined
  return model.showPerf && hasMetrics ? (
    <Typography
      variant="caption"
      className={classes.perf}
      data-testid="graph-perf-stats"
    >
      fetch {fmtMs(lastFetchMs)} · layout {fmtMs(lastLayoutMs)} · geom{' '}
      {fmtMs(lastGeometryMs)}
    </Typography>
  ) : null
})

const GraphStats = observer(function GraphStats({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const { classes } = useStyles()
  return (
    <div
      className={classes.stats}
      data-testid="graph-stats"
      data-node-count={model.nodeCount}
      data-edge-count={model.edgeCount}
      data-path-count={model.pathCount}
      // unconditional, whatever `showPerf` is doing to the text beside them —
      // see GraphPerf
      data-fetch-ms={model.lastFetchMs ?? ''}
      data-layout-ms={model.lastLayoutMs ?? ''}
      data-geometry-ms={model.lastGeometryMs ?? ''}
      data-geometry-strokes={model.lastGeometryStrokeCount ?? ''}
    >
      <Typography variant="body2" component="span">
        {model.nodeCount} nodes, {model.edgeCount} edges
        {model.pathCount > 0 ? `, ${model.pathCount} paths` : ''}
      </Typography>{' '}
      <GraphPerf model={model} />
    </div>
  )
})

export default GraphStats
