import React, { useState } from 'react'

import { Tooltip } from '@mui/material'
import { observer } from 'mobx-react'

import { HOVERED_BORDER, SELECTED_BORDER } from '../constants'
import { oneBasedUniProtFeatureToStructureRange } from '../hooks/useProteinFeatureTrackData'
import { getFeatureColor } from '../hooks/useUniProtFeatures'
import { clickProteinToGenome } from '../proteinToGenomeMapping'

import type { FeatureLayout } from '../hooks/useProteinFeatureTrackData'
import type { UniProtFeature } from '../hooks/useUniProtFeatures'
import type { JBrowsePluginProteinStructureModel } from '../model'

function FeatureTooltipContent({ feature }: { feature: UniProtFeature }) {
  return (
    <div>
      <div>
        <strong>{feature.type}</strong>
      </div>
      <div>
        Position: {feature.start}-{feature.end}
      </div>
      {feature.description ? <div>{feature.description}</div> : null}
    </div>
  )
}

const FeatureBar = observer(function FeatureBar({
  layout,
  top,
  model,
}: {
  layout: FeatureLayout
  top: number
  model: JBrowsePluginProteinStructureModel
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { selectedFeatureId } = model
  const { feature, left, width } = layout
  const isSelected = selectedFeatureId === feature.uniqueId

  const handleMouseEnter = () => {
    setIsHovered(true)
    model.setAlignmentHoverRange({
      start: layout.alignmentStart,
      end: layout.alignmentEnd,
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    model.setAlignmentHoverRange(undefined)
  }

  // The model's `select` autorun owns the magenta molstar selection, deriving
  // it from clickedStructureRange. Setting/clearing that range here (rather than
  // also driving molstar imperatively) keeps a single source of truth: on
  // deselect the autorun correctly falls back to the whole-alignment highlight
  // when showHighlight is on, instead of blanking the selection.
  const handleClick = () => {
    if (isSelected) {
      model.setSelectedFeatureId(undefined)
      model.setClickedStructureRange(undefined)
    } else {
      const { start, end } = oneBasedUniProtFeatureToStructureRange(feature)
      model.setSelectedFeatureId(feature.uniqueId)
      clickProteinToGenome({
        model,
        structureSeqPos: start,
        structureSeqEndPos: end,
      }).catch((e: unknown) => {
        console.error(e)
        model.setError(e)
      })
    }
  }

  const color = getFeatureColor(feature.type)

  return (
    <Tooltip title={<FeatureTooltipContent feature={feature} />} followCursor>
      <div
        data-testid={`protein-feature-${feature.type}`}
        data-feature-id={feature.uniqueId}
        data-feature-start={feature.start}
        data-feature-end={feature.end}
        onClick={() => {
          handleClick()
        }}
        onMouseEnter={() => {
          handleMouseEnter()
        }}
        onMouseLeave={() => {
          handleMouseLeave()
        }}
        style={{
          position: 'absolute',
          left,
          top,
          width,
          height: model.trackHeight,
          backgroundColor: color,
          opacity: isHovered || isSelected ? 0.9 : 0.6,
          cursor: 'pointer',
          borderRadius: 2,
          border: isSelected
            ? SELECTED_BORDER
            : isHovered
              ? HOVERED_BORDER
              : 'none',
          boxSizing: 'border-box',
        }}
      />
    </Tooltip>
  )
})

export default FeatureBar
