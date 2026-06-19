import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { Button, Paper, Typography, makeStyles } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import AddIcon from '@material-ui/icons/Add'
import { getSession } from '@jbrowse/core/util'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(1),
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    margin: `0px 0px ${theme.spacing(1)}px 0px`,
    justifyContent: 'center',
  },
  submitContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}))

function Panel({ model }: { model: any }) {
  const classes = useStyles()
  const [browseSuccess, setBrowseSuccess] = useState(false)

  const session = getSession(model)

  const handleAddBrowse = () => {
    if (session) {
      const datenow = Date.now()
      const trackId = `icgc_browse_track-${datenow}`
      // @ts-ignore
      session.addTrackConf({
        type: 'ICGCTrack',
        trackId,
        name: `ICGC Browse ${datenow}`,
        assemblyNames: ['hg38'],
        category: ['Annotation'],
        adapter: {
          ICGCAdapterId: 'DefaultICGCAdapter',
          type: 'ICGCAdapter',
        },
        displays: [
          {
            type: 'LinearICGCDisplay',
            displayId: `icgc_browse_track_linear_${datenow}`,
          },
        ],
      })
      if (session.views.length === 0) {
        session.addView('LinearGenomeView', {})
      }
      // @ts-ignore
      session.views[0].showTrack(trackId)
      setBrowseSuccess(true)
    }
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="h6" component="h1" align="center">
          Quick-add an ICGC Browse Track
        </Typography>
        <Typography variant="body1" align="center">
          Add additional Browse tracks to your current view by clicking this
          button.
        </Typography>
        {browseSuccess ? (
          <Alert severity="success">
            The requested Browse track has been added.
          </Alert>
        ) : null}
        <Button
          color="primary"
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleAddBrowse}
        >
          Add New ICGC Browse Track
        </Button>
      </Paper>
    </div>
  )
}

export default observer(Panel)
