import React from 'react'

import { observer } from 'mobx-react'

import { CHAR_WIDTH } from '../constants'
import FeatureBar from './FeatureBar'
import FeatureTypeLabel from './FeatureTypeLabel'
import HoverMarker from './HoverMarker'
import useAlignmentColumnHover from '../hooks/useAlignmentColumnHover'

import type {
  FeatureGroup,
  FeatureTrackData,
} from '../hooks/useProteinFeatureTrackData'
import type { JBrowsePluginProteinStructureModel } from '../model'

const FeatureTypeTrackContent = observer(function FeatureTypeTrackContent({
  group,
  model,
  sequenceLength,
  expanded,
}: {
  group: FeatureGroup
  model: JBrowsePluginProteinStructureModel
  sequenceLength: number
  expanded: boolean
}) {
  const lanes = expanded ? group.laneCount : 1
  const laneUnit = model.trackHeight + model.trackGap
  return (
    <div
      style={{
        position: 'relative',
        height: lanes * model.trackHeight + (lanes - 1) * model.trackGap,
        width: sequenceLength * CHAR_WIDTH,
        marginBottom: model.trackGap,
      }}
    >
      {group.layouts.map(layout => (
        <FeatureBar
          key={layout.feature.uniqueId}
          layout={layout}
          top={(expanded ? layout.lane : 0) * laneUnit}
          model={model}
        />
      ))}
    </div>
  )
})

export const ProteinFeatureTrackLabels = observer(
  function ProteinFeatureTrackLabels({
    data,
    labelWidth,
    model,
  }: {
    data: FeatureTrackData
    labelWidth: number
    model: JBrowsePluginProteinStructureModel
  }) {
    return (
      <>
        {data.visibleGroups.map(group => (
          <FeatureTypeLabel
            key={group.type}
            type={group.type}
            laneCount={group.laneCount}
            expanded={model.expandedFeatureTypes.has(group.type)}
            labelWidth={labelWidth}
            model={model}
          />
        ))}
      </>
    )
  },
)

export const ProteinFeatureTrackContent = observer(
  function ProteinFeatureTrackContent({
    data,
    model,
  }: {
    data: FeatureTrackData
    model: JBrowsePluginProteinStructureModel
  }) {
    const hoverHandlers = useAlignmentColumnHover(model, data.sequenceLength)
    return (
      <div style={{ position: 'relative' }} {...hoverHandlers}>
        {data.visibleGroups.map(group => (
          <FeatureTypeTrackContent
            key={group.type}
            group={group}
            model={model}
            sequenceLength={data.sequenceLength}
            expanded={model.expandedFeatureTypes.has(group.type)}
          />
        ))}
        <HoverMarker model={model} />
      </div>
    )
  },
)
