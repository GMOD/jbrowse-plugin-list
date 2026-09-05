import React, { useEffect, useRef } from 'react'

import { Tooltip, Typography } from '@mui/material'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import AlignmentRuler from './AlignmentRuler'
import ChainSelect from './ChainSelect'
import HoverMarker from './HoverMarker'
import ProteinAlignmentHelpButton from './ProteinAlignmentHelpButton'
import {
  ProteinFeatureTrackContent,
  ProteinFeatureTrackLabels,
} from './ProteinFeatureTrack'
import ResidueValueTrack from './ResidueValueTrack'
import SplitString, { AlignmentHighlights } from './SplitString'
import { uniprotEntryUrl } from '../../LaunchProteinView/utils/structureUrls'
import ExternalLink from '../../components/ExternalLink'
import { structureAlignedSeq, transcriptAlignedSeq } from '../../mappings'
import { largeJumpScrollTarget, offScreenCenterTarget } from '../autoScroll'
import { CHAR_WIDTH, LABEL_WIDTH, ROW_HEIGHT } from '../constants'
import useProteinFeatureTrackData from '../hooks/useProteinFeatureTrackData'
import useStructureUniProt from '../hooks/useStructureUniProt'
import { hydrophobicityColor, plddtColor } from '../residueTracks'

import type { JBrowsePluginProteinStructureModel } from '../model'

// The alignment is drawn on its own panel rather than the page background, so
// it needs the theme's paper color explicitly — hardcoding white left the
// residue letters (theme text color) invisible under the dark theme.
const useStyles = makeStyles()(theme => ({
  scroll: {
    overflow: 'auto',
    whiteSpace: 'nowrap',
    flex: 1,
    paddingBottom: 10,
    backgroundColor: theme.palette.background.paper,
  },
  gutterStatus: {
    height: ROW_HEIGHT,
    fontSize: 8,
    color: theme.palette.text.secondary,
  },
  gutterError: {
    height: ROW_HEIGHT,
    fontSize: 8,
    color: theme.palette.error.main,
  },
}))

// Which UniProt entry the feature tracks came from. For an AlphaFold model that
// is in the filename, but for a PDB entry it is resolved via SIFTS and is
// otherwise invisible — leaving no way to tell which protein got annotated.
function UniProtProvenance({
  uniprotId,
  uniprotName,
}: {
  uniprotId: string | undefined
  uniprotName: string | undefined
}) {
  return uniprotId ? (
    <Typography variant="caption" color="textSecondary" component="div">
      Feature tracks from UniProt{' '}
      <ExternalLink href={uniprotEntryUrl(uniprotId)}>
        {uniprotName ? `${uniprotId} (${uniprotName})` : uniprotId}
      </ExternalLink>
    </Typography>
  ) : null
}

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
    url,
    label,
    confidenceCells,
    hydrophobicityCells,
  } = model
  const mappedEntityId = model.mappedEntity?.entityId
  const { classes } = useStyles()
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrolledSelectionRef = useRef<string | undefined>(undefined)
  // AlphaFold models carry their accession in the URL; PDB entries need a SIFTS
  // lookup, which also supplies the UniProt->structure residue offset.
  const {
    uniprotId,
    uniprotName,
    mapUniProtPosition,
    isLoading: uniprotLoading,
    error: uniprotError,
  } = useStructureUniProt({ url, mappedEntityId })
  const {
    data: featureData,
    isLoading: trackLoading,
    error: trackError,
  } = useProteinFeatureTrackData(model, uniprotId, mapUniProtPosition)
  const featureLoading = uniprotLoading || trackLoading
  const featureError = uniprotError ?? trackError

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

  const a0 = transcriptAlignedSeq(pairwiseAlignment)
  const a1 = structureAlignedSeq(pairwiseAlignment)
  const con = pairwiseAlignment.consensus

  return (
    <div data-testid="protein-alignment-panel" data-structure={label}>
      {/* A header row rather than a float: a floated picker narrowed the whole
          alignment below it, since a flex container will not overlap a float,
          so a panel with a chain picker lost 200px of sequence to it. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Names the structure this panel aligns, since several panels stack
            over one canvas and nothing else tells 1TUP's from 1YCR's. What the
            rows mean is in the help dialog. */}
        <Typography variant="subtitle2">
          {label}
          {showHighlight ? (
            <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
              green is the aligned portion
            </Typography>
          ) : null}
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <ChainSelect model={model} />
          <ProteinAlignmentHelpButton model={model} />
        </div>
      </div>
      {showProteinTracks ? (
        <UniProtProvenance uniprotId={uniprotId} uniprotName={uniprotName} />
      ) : null}
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
          <GutterLabel
            label="residue"
            title="Residue numbers as the structure's authors assigned them, the numbering papers and the 3D view's hover label use"
            height={ROW_HEIGHT}
          />
          {showProteinTracks ? (
            featureLoading ? (
              <div className={classes.gutterStatus}>Loading...</div>
            ) : featureError ? (
              <Tooltip
                title={
                  featureError instanceof Error
                    ? featureError.message
                    : 'Error loading features'
                }
              >
                <div className={classes.gutterError}>Error</div>
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
        <div ref={containerRef} className={classes.scroll}>
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
          <AlignmentRuler model={model} columns={a0.length} />
          {/* One relative parent for every track, so the hover marker spans all
              of them — nested inside the feature tracks it stopped short of the
              pLDDT/hydrophobicity rows, and vanished entirely when a structure
              had no UniProt features. */}
          {showProteinTracks ? (
            <div style={{ position: 'relative' }}>
              {featureData ? (
                <ProteinFeatureTrackContent data={featureData} model={model} />
              ) : null}
              {confidenceCells.length > 0 ? (
                <ResidueValueTrack
                  cells={confidenceCells}
                  colorFor={plddtColor}
                  formatValue={v => `pLDDT ${v.toFixed(0)}`}
                  sequenceLength={a0.length}
                  model={model}
                />
              ) : null}
              {hydrophobicityCells.length > 0 ? (
                <ResidueValueTrack
                  cells={hydrophobicityCells}
                  colorFor={hydrophobicityColor}
                  formatValue={v => `Kyte-Doolittle ${v.toFixed(1)}`}
                  sequenceLength={a0.length}
                  model={model}
                />
              ) : null}
              <HoverMarker model={model} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
})

export default ProteinAlignment
