import React, { useState } from 'react'

import { Tooltip } from '@mui/material'
import { observer } from 'mobx-react'

import { CHAR_WIDTH, HOVERED_BORDER, SELECTED_BORDER } from '../constants'
import { selectResidueRange } from '../highlightResidueRange'
import { getFeatureColor } from '../hooks/useUniProtFeatures'
import { clickProteinToGenome } from '../proteinToGenomeMapping'

import type { UniProtFeature } from '../hooks/useUniProtFeatures'
import type { JBrowsePluginProteinStructureModel } from '../model'

function getFeatureAlignmentRange(
  feature: UniProtFeature,
  structurePositionToAlignmentMap: Record<number, number> | undefined,
) {
  const startAlignmentPos = structurePositionToAlignmentMap?.[feature.start - 1]
  const endAlignmentPos = structurePositionToAlignmentMap?.[feature.end - 1]
  return startAlignmentPos !== undefined && endAlignmentPos !== undefined
    ? { start: startAlignmentPos, end: endAlignmentPos }
    : undefined
}

function getFeatureGeometry(
  feature: UniProtFeature,
  structurePositionToAlignmentMap: Record<number, number> | undefined,
) {
  const startAlnPos =
    structurePositionToAlignmentMap?.[feature.start - 1] ?? feature.start - 1
  const endAlnPos =
    structurePositionToAlignmentMap?.[feature.end - 1] ?? feature.end - 1
  return {
    left: startAlnPos * CHAR_WIDTH,
    width: Math.max((endAlnPos - startAlnPos + 1) * CHAR_WIDTH, 3),
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

  const handleMouseEnter = () => {
    setIsHovered(true)
    const range = getFeatureAlignmentRange(
      feature,
      structurePositionToAlignmentMap,
    )
    if (range) {
      model.setAlignmentHoverRange(range)
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
      if (newSelected) {
        selectResidueRange({
          structure,
          startResidue: feature.start,
          endResidue: feature.end,
          plugin: molstarPluginContext,
        }).catch((e: unknown) => {
          console.error(e)
          model.setError(e)
        })
      } else {
        molstarPluginContext.managers.interactivity.lociSelects.deselectAll()
      }
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

  const { left, width } = getFeatureGeometry(
    feature,
    structurePositionToAlignmentMap,
  )
  const color = getFeatureColor(feature.type)

  return (
    <Tooltip title={<FeatureTooltipContent feature={feature} />} followCursor>
      <div
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
