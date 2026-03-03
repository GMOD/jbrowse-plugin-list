import React, { lazy } from 'react'

import { getSession } from '@jbrowse/core/util'
import Help from '@mui/icons-material/Help'
import { IconButton } from '@mui/material'

import { JBrowsePluginProteinStructureModel } from '../model'

// icons

const ProteinAlignmentHelpDialog = lazy(
  () => import('./ProteinAlignmentHelpDialog'),
)

export default function ProteinAlignmentHelpButton({
  model,
}: {
  model: JBrowsePluginProteinStructureModel
}) {
  return (
    <IconButton
      style={{ float: 'right' }}
      onClick={() => {
        getSession(model).queueDialog(handleClose => [
          ProteinAlignmentHelpDialog,
          { handleClose },
        ])
      }}
    >
      <Help />
    </IconButton>
  )
}
