import React, { lazy } from 'react'

import { getSession } from '@jbrowse/core/util'
import Help from '@mui/icons-material/Help'
import { IconButton, Tooltip } from '@mui/material'

import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'

const ProteinAlignmentHelpDialog = lazy(
  () => import('./ProteinAlignmentHelpDialog'),
)

export default function ProteinAlignmentHelpButton({
  model,
}: {
  model: IAnyStateTreeNode
}) {
  return (
    <Tooltip title="What the alignment panel shows">
      <IconButton
        size="small"
        onClick={() => {
          getSession(model).queueDialog(handleClose => [
            ProteinAlignmentHelpDialog,
            { handleClose },
          ])
        }}
      >
        <Help fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}
