import React, { useState } from 'react'

import { Tooltip } from '@mui/material'
import { observer } from 'mobx-react'

import { HOVERED_BORDER, SELECTED_BORDER } from '../constants'
import { getFeatureColor } from '../hooks/useUniProtFeatures'
import { clickProteinToGenome } from '../proteinToGenomeMapping'

import type { FeatureLayout } from '../hooks/useProteinFeatureTrackData'
import type { UniProtFeature } from '../hooks/useUniProtFeatures'
import type { JBrowsePluginProteinStructureModel } from '../model'

// UniProt numbers a feature on the full-length protein. For a crystal fragment
// the ruler under the bar counts the authors' way, so name both when they
// differ rather than leave the reader to reconcile two numberings.
function FeatureTooltipContent({
  feature,
  layout,
  model,
}: {
  feature: UniProtFeature
  layout: FeatureLayout
  model: JBrowsePluginProteinStructureModel
}) {
  const first = model.residueNumber(layout.structureStart)
  const last = model.residueNumber(layout.structureEnd - 1)
  const differs = first !== feature.start || last !== feature.end
  return (
    <div>
      <div>
        <strong>{feature.type}</strong>
      </div>
      <div>
        UniProt position: {feature.start}-{feature.end}
      </div>
      {differs ? (
        <div>
          Structure residue: {first}-{last}
        </div>
      ) : null}
      {feature.description ? <div>{feature.description}</div> : null}
    </div>
  )
}

// `selected` comes from the track rather than each bar reading the model's
// selection itself, so a click re-renders the two bars it changes instead of
// every bar of every track (p53 has 1,363 natural variants).
const FeatureBar = observer(function FeatureBar({
  layout,
  top,
  selected,
  model,
}: {
  layout: FeatureLayout
  top: number
  selected: boolean
  model: JBrowsePluginProteinStructureModel
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { feature, alignmentStart, alignmentEnd } = layout
  const { columnWidth, trackHeight } = model

  return (
    <Tooltip
      title={
        <FeatureTooltipContent
          feature={feature}
          layout={layout}
          model={model}
        />
      }
      followCursor
    >
      <div
        data-testid={`protein-feature-${feature.type}`}
        data-feature-id={feature.uniqueId}
        data-feature-start={feature.start}
        data-feature-end={feature.end}
        onClick={() => {
          if (selected) {
            model.setSelectedFeatureId(undefined)
            model.setClickedStructureRanges([])
          } else {
            model.setSelectedFeatureId(feature.uniqueId)
            clickProteinToGenome({
              model,
              structureSeqPos: layout.structureStart,
              structureSeqEndPos: layout.structureEnd,
            }).catch((e: unknown) => {
              console.error(e)
              model.setError(e)
            })
          }
        }}
        onMouseEnter={() => {
          setIsHovered(true)
          model.setAlignmentHoverRange({
            start: alignmentStart,
            end: alignmentEnd,
          })
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          model.setAlignmentHoverRange(undefined)
        }}
        style={{
          position: 'absolute',
          left: alignmentStart * columnWidth,
          top,
          width: (alignmentEnd - alignmentStart + 1) * columnWidth,
          height: trackHeight,
          backgroundColor: getFeatureColor(feature.type),
          opacity: isHovered || selected ? 0.9 : 0.6,
          cursor: 'pointer',
          borderRadius: 2,
          border: selected
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
