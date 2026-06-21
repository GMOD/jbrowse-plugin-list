import React from 'react'

import { Tooltip } from '@mui/material'
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
        <span
          onClick={e => {
            e.stopPropagation()
            model.hideFeatureType(type)
          }}
          style={{
            cursor: 'pointer',
            color: HIDE_BUTTON_COLOR,
            fontWeight: 'bold',
            fontSize: 8,
            lineHeight: 1,
          }}
          title={`Hide ${type} track`}
        >
          x
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {type}
        </span>
      </div>
    </Tooltip>
  )
})

export default FeatureTypeLabel
