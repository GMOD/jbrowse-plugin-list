import React from 'react'

import { observer } from 'mobx-react'

import FeatureBar from './FeatureBar'

import type { FeatureGroup } from '../hooks/useProteinFeatureTrackData'
import type { JBrowsePluginProteinStructureModel } from '../model'

export function featureTrackHeight(
  model: JBrowsePluginProteinStructureModel,
  group: FeatureGroup,
) {
  const lanes = model.expandedFeatureTypes.has(group.type) ? group.laneCount : 1
  return lanes * (model.trackHeight + model.trackGap)
}

const ProteinFeatureTrack = observer(function ProteinFeatureTrack({
  group,
  model,
}: {
  group: FeatureGroup
  model: JBrowsePluginProteinStructureModel
}) {
  const { selectedFeatureId, trackHeight, trackGap } = model
  const expanded = model.expandedFeatureTypes.has(group.type)
  return group.layouts.map(layout => (
    <FeatureBar
      key={layout.feature.uniqueId}
      layout={layout}
      top={(expanded ? layout.lane : 0) * (trackHeight + trackGap)}
      selected={selectedFeatureId === layout.feature.uniqueId}
      model={model}
    />
  ))
})

export default ProteinFeatureTrack
