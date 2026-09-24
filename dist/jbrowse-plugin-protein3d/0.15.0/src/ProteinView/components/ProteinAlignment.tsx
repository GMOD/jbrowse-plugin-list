import React, { useEffect, useRef } from 'react'

import { Tooltip, Typography } from '@mui/material'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import {
  describeAlignmentQuality,
  structureAlignedSeq,
  transcriptAlignedSeq,
  uniprotEntryUrl,
} from 'p2s_mapper'
import { makeStyles } from 'tss-react/mui'

import AlignmentRuler from './AlignmentRuler'
import ChainSelect from './ChainSelect'
import HoverMarker from './HoverMarker'
import PlddtLegend from './PlddtLegend'
import ProteinAlignmentHelpButton from './ProteinAlignmentHelpButton'
import {
  ProteinFeatureTrackContent,
  ProteinFeatureTrackLabels,
} from './ProteinFeatureTrack'
import ResidueValueTrack from './ResidueValueTrack'
import SplitString, { AlignmentHighlights } from './SplitString'
import ExternalLink from '../../components/ExternalLink'
import { followHover, offScreenCenterTarget } from '../autoScroll'
import { CHAR_WIDTH, LABEL_WIDTH, ROW_HEIGHT } from '../constants'
import useProteinFeatureTrackData from '../hooks/useProteinFeatureTrackData'
import useStructureUniProt from '../hooks/useStructureUniProt'
import { hydrophobicityColor, plddtColor } from '../residueTracks'
import { errorMessage } from '../util'

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
    alignment: pairwiseAlignment,
    alignmentQuality: quality,
    showHighlight,
    showProteinTracks,
    showAllFeatureTracks,
    label,
    confidenceCells,
  } = model
  const hydrophobicityCells = showAllFeatureTracks
    ? model.hydrophobicityCells
    : []
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
  } = useStructureUniProt({
    uniprotId: model.uniprotId,
    pdbId: model.pdbId,
    uniProtMappings: model.uniProtMappings,
    uniProtMappingsError: model.uniProtMappingsError,
    mappedEntity: model.mappedEntity,
  })
  const {
    data: featureData,
    isLoading: trackLoading,
    error: trackError,
  } = useProteinFeatureTrackData(model, uniprotId, mapUniProtPosition)
  const featureLoading = uniprotLoading || trackLoading
  // Two different failures reach one gutter cell, and "Error" alone leaves the
  // reader guessing whether the structure has no UniProt entry or the entry's
  // features would not download.
  const featureError = uniprotError ?? trackError
  const featureErrorMessage = featureError
    ? `${
        uniprotError
          ? `Could not map ${label} to a UniProt entry through SIFTS`
          : `Could not load UniProt features for ${uniprotId ?? label}`
      }: ${errorMessage(featureError)}`
    : undefined

  useEffect(() => followHover(model, () => containerRef.current), [model])

  // Scroll a selection into view when it changes to an off-screen one — both
  // a declared seed on open and a later click on a distant feature bar, which
  // would otherwise select something the user can't see. Several ranges scroll
  // to their first. Keyed on the ranges so it fires once per distinct
  // selection and doesn't fight the user's own scrolling afterward.
  useEffect(
    () =>
      autorun(() => {
        const container = containerRef.current
        const ranges = model.clickAlignmentRanges
        const range = ranges[0]
        if (container) {
          if (range) {
            const key = ranges.map(r => `${r.start}-${r.end}`).join(',')
            if (key !== lastScrolledSelectionRef.current) {
              lastScrolledSelectionRef.current = key
              const target = offScreenCenterTarget({
                start: range.start * CHAR_WIDTH,
                end: (range.end + 1) * CHAR_WIDTH,
                scrollLeft: container.scrollLeft,
                clientWidth: container.clientWidth,
              })
              if (target !== undefined) {
                container.scrollLeft = target
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
          {/* Identity and coverage live in the header, which stays visible when
              this panel is hidden. What is left here is what only means
              something inside the panel. */}
          {quality ? (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ ml: 1 }}
              data-testid="alignment-quality"
            >
              {describeAlignmentQuality(quality)}
              {showHighlight ? ', green is the aligned portion' : ''}
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
          model.leaveAlignment()
        }}
      >
        <div
          style={{
            flexShrink: 0,
            minWidth: LABEL_WIDTH,
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
            ) : featureErrorMessage ? (
              <Tooltip title={featureErrorMessage}>
                <div className={classes.gutterError}>Error</div>
              </Tooltip>
            ) : featureData ? (
              <ProteinFeatureTrackLabels data={featureData} model={model} />
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
      {showProteinTracks && confidenceCells.length > 0 ? <PlddtLegend /> : null}
    </div>
  )
})

export default ProteinAlignment
