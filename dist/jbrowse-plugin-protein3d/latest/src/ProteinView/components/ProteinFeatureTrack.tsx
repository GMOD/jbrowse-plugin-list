import React from 'react'

import { observer } from 'mobx-react'

import FeatureBar from './FeatureBar'
import { RangeBarTrack } from './RangeBar'

import type { FeatureGroup } from '../hooks/useProteinFeatureTrackData'
import type { JBrowsePluginProteinStructureModel } from '../model'

// Bars are placed as fractions of the row, which alone carries the px height:
// dragging the resize handle then restyles one row instead of re-rendering
// every bar (p53 has 1,432, and a drag cost 180ms a frame).
const ProteinFeatureTrack = observer(function ProteinFeatureTrack({
  group,
  model,
}: {
  group: FeatureGroup
  model: JBrowsePluginProteinStructureModel
}) {
  const { selectedFeatureId, trackGap } = model
  const lanes = model.expandedFeatureTypes.has(group.type) ? group.laneCount : 1
  const height = `calc(${100 / lanes}% - ${trackGap}px)`
  const tabStop = (
    group.layouts.find(l => l.feature.uniqueId === selectedFeatureId) ??
    group.layouts.toSorted((a, b) => a.alignmentStart - b.alignmentStart)[0]
  )?.feature.uniqueId
  return (
    <RangeBarTrack>
      {group.layouts.map(layout => (
        <FeatureBar
          key={layout.feature.uniqueId}
          layout={layout}
          top={`${(Math.min(layout.lane, lanes - 1) / lanes) * 100}%`}
          height={height}
          selected={selectedFeatureId === layout.feature.uniqueId}
          tabStop={tabStop === layout.feature.uniqueId}
          model={model}
        />
      ))}
    </RangeBarTrack>
  )
})

export default ProteinFeatureTrack
