import React from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import { Button, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { MSAView } from 'react-msaview'

import type { JBrowsePluginTViewModel } from '../model'
import type { MsaViewModel } from 'react-msaview'

const padded = { padding: 20 }

const TViewPanel = observer(function TViewPanel2({
  model,
}: {
  model: JBrowsePluginTViewModel
}) {
  const state = model.viewState
  return state.kind === 'alignment' ? (
    // react-msaview types its model prop with type: 'MsaView' baked in, but a
    // JBrowse view model's `type` must equal its registered view type name.
    // That literal is the only difference, and the MSA renderer never reads it.
    <MSAView model={model as unknown as MsaViewModel} />
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
