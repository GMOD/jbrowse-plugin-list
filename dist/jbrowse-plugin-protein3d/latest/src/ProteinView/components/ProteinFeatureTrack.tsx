import React from 'react'

import { observer } from 'mobx-react'

import { CHAR_WIDTH } from '../constants'
import FeatureBar from './FeatureBar'
import FeatureTypeLabel from './FeatureTypeLabel'
import HoverMarker from './HoverMarker'

import type { FeatureTrackData } from '../hooks/useProteinFeatureTrackData'
import type { UniProtFeature } from '../hooks/useUniProtFeatures'
import type { JBrowsePluginProteinStructureModel } from '../model'

function getVisibleTypes(
  featureTypes: string[],
  hiddenFeatureTypes: Set<string>,
) {
  return featureTypes.filter(type => !hiddenFeatureTypes.has(type))
}

const FeatureTypeTrackContent = observer(function FeatureTypeTrackContent({
  features,
  model,
  sequenceLength,
}: {
  features: UniProtFeature[]
  model: JBrowsePluginProteinStructureModel
  sequenceLength: number
}) {
  return (
    <div
      style={{
        position: 'relative',
        height: model.trackHeight,
        width: sequenceLength * CHAR_WIDTH,
        marginBottom: model.trackGap,
      }}
    >
      {features.map(feature => (
        <FeatureBar key={feature.uniqueId} feature={feature} model={model} />
      ))}
      <HoverMarker model={model} />
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
    const { hiddenFeatureTypes } = model
    const visibleTypes = getVisibleTypes(data.featureTypes, hiddenFeatureTypes)
    return (
      <>
        {visibleTypes.map(type => (
          <FeatureTypeLabel
            key={type}
            type={type}
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
    const { hiddenFeatureTypes } = model
    const visibleTypes = getVisibleTypes(data.featureTypes, hiddenFeatureTypes)

    return (
      <div
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const alignmentPos = Math.floor(x / CHAR_WIDTH)
          if (alignmentPos >= 0 && alignmentPos < data.sequenceLength) {
            model.hoverAlignmentPosition(alignmentPos)
          }
        }}
        onMouseLeave={() => {
          model.setHoveredPosition(undefined)
        }}
      >
        {visibleTypes.map(type => (
          <FeatureTypeTrackContent
            key={type}
            features={data.groupedFeatures[type]!}
            model={model}
            sequenceLength={data.sequenceLength}
          />
        ))}
      </div>
    )
  },
)
