import React, { useState } from 'react'

import { Tooltip } from '@mui/material'
import { observer } from 'mobx-react'

import { setMolstarLoci } from '../applyLociInteractivity'
import { CHAR_WIDTH, HOVERED_BORDER, SELECTED_BORDER } from '../constants'
import { getFeatureColor } from '../hooks/useUniProtFeatures'
import { clickProteinToGenome } from '../proteinToGenomeMapping'

import type { UniProtFeature } from '../hooks/useUniProtFeatures'
import type { JBrowsePluginProteinStructureModel } from '../model'

/**
 * Maps a feature's structure range onto alignment columns, returning both the
 * alignment range (for hover) and pixel geometry. Returns undefined when either
 * endpoint has no alignment column, so unmappable features aren't drawn at a
 * misleading position.
 */
function getFeatureLayout(
  feature: UniProtFeature,
  structurePositionToAlignmentMap: Record<number, number> | undefined,
) {
  const start = structurePositionToAlignmentMap?.[feature.start - 1]
  const end = structurePositionToAlignmentMap?.[feature.end - 1]
  return start === undefined || end === undefined
    ? undefined
    : {
        range: { start, end },
        left: start * CHAR_WIDTH,
        width: Math.max((end - start + 1) * CHAR_WIDTH, 3),
      }
}

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
  feature,
  model,
}: {
  feature: UniProtFeature
  model: JBrowsePluginProteinStructureModel
}) {
  const [isHovered, setIsHovered] = useState(false)
  const {
    molstarPluginContext,
    selectedFeatureId,
    structurePositionToAlignmentMap,
  } = model
  const isSelected = selectedFeatureId === feature.uniqueId
  const layout = getFeatureLayout(feature, structurePositionToAlignmentMap)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (layout) {
      model.setAlignmentHoverRange(layout.range)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    model.setAlignmentHoverRange(undefined)
  }

  const handleClick = () => {
    const structure = model.molstarStructure
    const newSelected = !isSelected

    if (structure && molstarPluginContext) {
      setMolstarLoci({
        structure,
        plugin: molstarPluginContext,
        channel: 'select',
        spec: newSelected
          ? { kind: 'range', start: feature.start - 1, end: feature.end }
          : undefined,
      }).catch((e: unknown) => {
        console.error(e)
        model.setError(e)
      })
    }

    if (newSelected) {
      model.setSelectedFeatureId(feature.uniqueId)
      clickProteinToGenome({
        model,
        structureSeqPos: feature.start - 1,
        structureSeqEndPos: feature.end,
      }).catch((e: unknown) => {
        console.error(e)
        model.setError(e)
      })
    } else {
      model.setSelectedFeatureId(undefined)
      model.setClickedStructureRange(undefined)
    }
  }

  if (!layout) {
    return null
  }

  const { left, width } = layout
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
          top: 0,
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
