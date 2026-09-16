import React from 'react'

import CloseIcon from '@mui/icons-material/Close'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { observer } from 'mobx-react'
import {
  LOW_IDENTITY_OVER_SHORTER,
  SHORT_ALIGNMENT_IDENTITY,
  SHORT_ALIGNMENT_RESIDUES,
  describeCoveredRange,
  describeTranscriptCoverage,
  isLowSimilarity,
} from 'p2s_mapper'

import type {
  JBrowsePluginProteinStructureModel,
  JBrowsePluginProteinViewModel,
} from '../model'

const LOW_SIMILARITY_EXPLANATION = `Under ${Math.round(
  LOW_IDENTITY_OVER_SHORTER * 100,
)}% of the shorter sequence is identical (${Math.round(
  SHORT_ALIGNMENT_IDENTITY * 100,
)}% for an alignment of fewer than ${SHORT_ALIGNMENT_RESIDUES} residues): an alignment this weak is what two unrelated proteins produce, so the positions it maps may be unrelated. Check the mapped chain, the transcript isoform, or import a curated alignment.`

const StructureRow = observer(function StructureRow({
  model,
  structure,
}: {
  model: JBrowsePluginProteinViewModel
  structure: JBrowsePluginProteinStructureModel
}) {
  const { label, alignmentQuality: quality, statusMessage } = structure
  const coveredRange = quality ? describeCoveredRange(quality) : undefined
  return (
    // data-label rather than data-structure: that one names the alignment
    // panel, and a selector matching both finds whichever the DOM has first
    <div
      data-testid="structure-row"
      data-label={label}
      style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 24 }}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
        {label}
      </Typography>
      {statusMessage ? (
        <Typography
          variant="caption"
          color="error"
          data-testid="structure-status"
        >
          {statusMessage}
        </Typography>
      ) : null}
      {quality ? (
        <Typography
          variant="caption"
          color="textSecondary"
          data-testid="header-alignment-quality"
        >
          {describeTranscriptCoverage(quality)}
          {coveredRange ? `, ${coveredRange}` : ''}
        </Typography>
      ) : null}
      <div style={{ flex: 1 }} />
      {quality && isLowSimilarity(quality) ? (
        <Tooltip title={LOW_SIMILARITY_EXPLANATION}>
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label="low similarity"
            data-testid="header-low-similarity"
          />
        </Tooltip>
      ) : null}
      <Tooltip title={`Remove ${label}`}>
        <IconButton
          size="small"
          aria-label={`Remove ${label}`}
          onClick={() => {
            model.removeStructure(structure)
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  )
})

/**
 * One line per structure, in the header the reader always sees. The identity
 * and coverage readout used to live only inside the pairwise panel, which the
 * same reader can hide — so how much of the transcript a structure speaks for,
 * and whether the mapping is chance, were one click away from invisible.
 */
const HeaderStructureRows = observer(function HeaderStructureRows({
  model,
}: {
  model: JBrowsePluginProteinViewModel
}) {
  return (
    <div>
      {model.structures.map((structure, idx) => (
        <StructureRow key={idx} model={model} structure={structure} />
      ))}
    </div>
  )
})

export default HeaderStructureRows
