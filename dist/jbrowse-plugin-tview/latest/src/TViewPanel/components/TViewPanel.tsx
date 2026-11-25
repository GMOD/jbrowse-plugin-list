import React from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import { Button, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { MSAView } from 'react-msaview'

import type { JBrowsePluginTViewModel } from '../model'

const padded = { padding: 20 }

const TViewPanel = observer(function TViewPanel2({
  model,
}: {
  model: JBrowsePluginTViewModel
}) {
  const state = model.viewState
  return state.kind === 'alignment' ? (
    <MSAView model={model} />
  ) : (
    <div style={padded}>
      {state.kind === 'loading' ? (
        <LoadingEllipses variant="h6" message={state.message} />
      ) : state.kind === 'notice' ? (
        <Typography>{state.message}</Typography>
      ) : (
        <>
          <ErrorMessage error={state.error} />
          {state.retry ? (
            <Button
              variant="contained"
              onClick={() => {
                model.retryLoad()
              }}
            >
              Retry
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
})

export default TViewPanel
