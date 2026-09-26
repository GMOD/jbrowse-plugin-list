import { ErrorBanner, LoadingEllipses } from '@jbrowse/core/ui'
import { Button, LinearProgress, Paper, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import type { GraphGenomeViewModel } from '../model'

const useStyles = makeStyles()({
  paper: {
    padding: 16,
    margin: 8,
    maxWidth: 560,
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
})

// What a view with no graph on screen shows while its load runs, and after a
// load of a source it can retry was canceled or failed.
const GraphLoadStatus = observer(function GraphLoadStatus({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const { classes } = useStyles()
  if (model.isLoading) {
    return (
      <Paper className={classes.paper} data-testid="graph-genome-loading">
        <div className={classes.row}>
          <LoadingEllipses variant="h6" message={model.statusMessage} />
          <Button
            size="small"
            data-testid="graph-genome-cancel"
            onClick={() => {
              model.cancelLoad()
            }}
          >
            Cancel
          </Button>
        </div>
        <LinearProgress variant="indeterminate" />
      </Paper>
    )
  }
  if (model.error) {
    return (
      <Paper className={classes.paper}>
        <ErrorBanner
          error={model.error}
          onReset={() => {
            model.retryLoad()
          }}
        />
      </Paper>
    )
  }
  return (
    <Paper className={classes.paper} data-testid="graph-genome-load-canceled">
      <div className={classes.row}>
        <Typography variant="h6">Loading canceled</Typography>
        <Button
          variant="contained"
          size="small"
          data-testid="graph-genome-retry"
          onClick={() => {
            model.retryLoad()
          }}
        >
          Retry
        </Button>
      </div>
    </Paper>
  )
})

export default GraphLoadStatus
