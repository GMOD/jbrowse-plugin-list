import React, { useEffect, useRef } from 'react'

import { Tooltip, Typography } from '@mui/material'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'

import { largeJumpScrollTarget, offScreenCenterTarget } from '../autoScroll'
import { CHAR_WIDTH, LABEL_WIDTH, ROW_HEIGHT } from '../constants'
import ProteinAlignmentHelpButton from './ProteinAlignmentHelpButton'
import {
  ProteinFeatureTrackContent,
  ProteinFeatureTrackLabels,
} from './ProteinFeatureTrack'
import ResidueValueTrack from './ResidueValueTrack'
import SplitString, { AlignmentHighlights } from './SplitString'
import useProteinFeatureTrackData from '../hooks/useProteinFeatureTrackData'
import { hydrophobicityColor, plddtColor } from '../residueTracks'

import type { JBrowsePluginProteinStructureModel } from '../model'

function GutterLabel({
  label,
  title,
  height,
}: {
  label: string
  title: string
  height: number
}) {
  return (
    <Tooltip title={title} placement="left">
      <div
        style={{
          height,
          fontSize: 9,
          fontFamily: 'monospace',
          textAlign: 'right',
          paddingRight: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </Tooltip>
  )
}

const ProteinAlignment = observer(function ProteinAlignment({
  model,
}: {
  model: JBrowsePluginProteinStructureModel
}) {
  const {
    pairwiseAlignment,
    showHighlight,
    showProteinTracks,
    uniprotId,
    confidenceCells,
    hydrophobicityCells,
  } = model
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrolledSelectionRef = useRef<string | undefined>(undefined)
  const {
    data: featureData,
    isLoading: featureLoading,
    error: featureError,
  } = useProteinFeatureTrackData(model, uniprotId)

  // Recenter only on a large jump — when the hovered column lands well outside
  // the viewport (e.g. hovering a distant residue in the 3D structure). A column
  // that has merely edged just off-screen during a continuous hover sweep is
  // left alone, so the panel doesn't feel like it's constantly re-centering.
  useEffect(
    () =>
      autorun(() => {
        const container = containerRef.current
        if (
          model.autoScrollAlignment &&
          !model.isMouseInAlignment &&
          model.alignmentHoverPos !== undefined &&
          container
        ) {
          const target = largeJumpScrollTarget({
            x: model.alignmentHoverPos * CHAR_WIDTH,
            scrollLeft: container.scrollLeft,
            clientWidth: container.clientWidth,
          })
          if (target !== undefined) {
            container.scrollTo({ left: target, behavior: 'smooth' })
          }
        }
      }),
    [model],
  )

  // Scroll a selection into view when it changes to an off-screen range — both
  // the declarative `initialSelection` on open and a later click on a distant
  // feature bar, which would otherwise select something the user can't see.
  // Keyed on the range so it fires once per distinct selection and doesn't fight
  // the user's own scrolling afterward.
  useEffect(
    () =>
      autorun(() => {
        const container = containerRef.current
        const range = model.clickAlignmentRange
        if (container) {
          if (range) {
            const key = `${range.start}-${range.end}`
            if (key !== lastScrolledSelectionRef.current) {
              lastScrolledSelectionRef.current = key
              const target = offScreenCenterTarget({
                start: range.start * CHAR_WIDTH,
                end: (range.end + 1) * CHAR_WIDTH,
                scrollLeft: container.scrollLeft,
                clientWidth: container.clientWidth,
              })
              if (target !== undefined) {
                container.scrollTo({ left: target, behavior: 'smooth' })
              }
            }
          } else {
            lastScrolledSelectionRef.current = undefined
          }
        }
      }),
    [model],
  )

  if (!pairwiseAlignment) {
    return <div>No pairwiseAlignment</div>
  }

  const a0 = pairwiseAlignment.alns[0].seq
  const a1 = pairwiseAlignment.alns[1].seq
  const con = pairwiseAlignment.consensus

  return (
    <div>
      <ProteinAlignmentHelpButton model={model} />

      <Typography>
        Alignment of the protein structure file&apos;s sequence with the
        selected transcript&apos;s sequence.{' '}
        {showHighlight ? 'Green is the aligned portion' : null}
      </Typography>
      <div
        style={{
          display: 'flex',
          fontSize: 9,
          fontFamily: 'monospace',
          cursor: 'pointer',
          margin: 8,
          paddingBottom: 8,
        }}
        onMouseEnter={() => {
          model.setIsMouseInAlignment(true)
        }}
        onMouseLeave={() => {
          model.setIsMouseInAlignment(false)
          model.setHoveredPosition(undefined)
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: LABEL_WIDTH,
            textAlign: 'right',
            paddingRight: 4,
          }}
        >
          <div style={{ height: ROW_HEIGHT }}>
            <Tooltip title="This is the sequence of the protein from the reference genome transcript">
              <span>GENOME</span>
            </Tooltip>
          </div>
          <div style={{ height: ROW_HEIGHT }}>&nbsp;</div>
          <div style={{ height: ROW_HEIGHT }}>
            <Tooltip title="This is the sequence of the protein from the structure file">
              <span>STRUCT</span>
            </Tooltip>
          </div>
          {showProteinTracks ? (
            featureLoading ? (
              <div style={{ height: ROW_HEIGHT, fontSize: 8, color: '#666' }}>
                Loading...
              </div>
            ) : featureError ? (
              <Tooltip
                title={
                  featureError instanceof Error
                    ? featureError.message
                    : 'Error loading features'
                }
              >
                <div style={{ height: ROW_HEIGHT, fontSize: 8, color: 'red' }}>
                  Error
                </div>
              </Tooltip>
            ) : featureData ? (
              <ProteinFeatureTrackLabels
                data={featureData}
                labelWidth={LABEL_WIDTH}
                model={model}
              />
            ) : null
          ) : null}
          {showProteinTracks && confidenceCells.length > 0 ? (
            <GutterLabel
              label="pLDDT"
              title="AlphaFold per-residue confidence (pLDDT)"
              height={model.trackHeight + model.trackGap}
            />
          ) : null}
          {showProteinTracks && hydrophobicityCells.length > 0 ? (
            <GutterLabel
              label="hydro"
              title="Kyte-Doolittle hydrophobicity (orange hydrophobic, blue hydrophilic)"
              height={model.trackHeight + model.trackGap}
            />
          ) : null}
        </div>
        <div
          ref={containerRef}
          style={{
            overflow: 'auto',
            whiteSpace: 'nowrap',
            flex: 1,
            paddingBottom: 10,
            backgroundColor: 'white',
          }}
        >
          <div style={{ position: 'relative' }}>
            <AlignmentHighlights
              model={model}
              strLength={a0.length}
              height={ROW_HEIGHT * 3}
            />
            <div style={{ height: ROW_HEIGHT }}>
              <SplitString model={model} str={a0} />
            </div>
            <div style={{ height: ROW_HEIGHT }}>
              <SplitString model={model} str={con} />
            </div>
            <div style={{ height: ROW_HEIGHT }}>
              <SplitString model={model} str={a1} />
            </div>
          </div>
          {showProteinTracks && featureData ? (
            <ProteinFeatureTrackContent data={featureData} model={model} />
          ) : null}
          {showProteinTracks && confidenceCells.length > 0 ? (
            <ResidueValueTrack
              cells={confidenceCells}
              colorFor={plddtColor}
              formatValue={v => `pLDDT ${v.toFixed(0)}`}
              sequenceLength={a0.length}
              model={model}
            />
          ) : null}
          {showProteinTracks && hydrophobicityCells.length > 0 ? (
            <ResidueValueTrack
              cells={hydrophobicityCells}
              colorFor={hydrophobicityColor}
              formatValue={v => `Kyte-Doolittle ${v.toFixed(1)}`}
              sequenceLength={a0.length}
              model={model}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
})

export default ProteinAlignment
