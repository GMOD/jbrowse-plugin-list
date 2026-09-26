import React from 'react'

import CloseIcon from '@mui/icons-material/Close'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import { IconButton, Tooltip } from '@mui/material'
import { observer } from 'mobx-react'

import { HIDE_BUTTON_COLOR } from '../constants'

import type { JBrowsePluginProteinStructureModel } from '../model'

const FeatureTypeLabel = observer(function FeatureTypeLabel({
  type,
  laneCount,
  model,
}: {
  type: string
  laneCount: number
  model: JBrowsePluginProteinStructureModel
}) {
  const expanded = model.expandedFeatureTypes.has(type)
  const iconSize = model.trackHeight
  return (
    <Tooltip title={type} placement="left">
      <div
        style={{
          height: '100%',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: expanded ? 'flex-start' : 'center',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <IconButton
          onClick={() => {
            model.hideFeatureType(type)
          }}
          title={`Hide ${type} track`}
          sx={{ p: 0, color: HIDE_BUTTON_COLOR }}
        >
          <CloseIcon sx={{ fontSize: iconSize }} />
        </IconButton>
        {laneCount > 1 ? (
          <IconButton
            onClick={() => {
              model.toggleFeatureTypeExpanded(type)
            }}
            title={
              expanded
                ? `Collapse ${type} track`
                : `Expand ${type} track (${laneCount} overlapping rows)`
            }
            sx={{ p: 0, color: HIDE_BUTTON_COLOR }}
          >
            {expanded ? (
              <UnfoldLessIcon sx={{ fontSize: iconSize }} />
            ) : (
              <UnfoldMoreIcon sx={{ fontSize: iconSize }} />
            )}
          </IconButton>
        ) : null}
        <span>{type}</span>
      </div>
    </Tooltip>
  )
})

export default FeatureTypeLabel
