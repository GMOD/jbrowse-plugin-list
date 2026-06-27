import React from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { IconButton, Tooltip } from '@mui/material'
import { observer } from 'mobx-react'

import { HIDE_BUTTON_COLOR } from '../constants'

import type { JBrowsePluginProteinStructureModel } from '../model'

const FeatureTypeLabel = observer(function FeatureTypeLabel({
  type,
  labelWidth,
  model,
}: {
  type: string
  labelWidth: number
  model: JBrowsePluginProteinStructureModel
}) {
  return (
    <Tooltip title={type} placement="left">
      <div
        style={{
          height: model.trackHeight + model.trackGap,
          width: labelWidth - 4,
          fontSize: 9,
          fontFamily: 'monospace',
          textAlign: 'right',
          paddingRight: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <IconButton
          onClick={e => {
            e.stopPropagation()
            model.hideFeatureType(type)
          }}
          title={`Hide ${type} track`}
          sx={{ p: 0, color: HIDE_BUTTON_COLOR }}
        >
          <CloseIcon sx={{ fontSize: model.trackHeight }} />
        </IconButton>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {type}
        </span>
      </div>
    </Tooltip>
  )
})

export default FeatureTypeLabel
