import React from 'react'

import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { getDbIdLabel } from 'p2s_mapper'
import { makeStyles } from 'tss-react/mui'

import ExternalLink from '../../components/ExternalLink'
import { isLookupMode } from '../hooks/useUniProtIdLookup'
import { UNIPROT_ACCESSION_HINT } from '../utils/uniprotAccession'
import NoticeLine from './NoticeLine'

import type { UniProtIdLookup } from '../hooks/useUniProtIdLookup'

const useStyles = makeStyles()({
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-start',
  },
})

/** How the UniProt entry is chosen: the feature's own accession, a search
 * over its identifiers scoped to an organism, or an accession typed by hand */
const UniProtLookupControls = observer(function UniProtLookupControls({
  lookup,
}: {
  lookup: UniProtIdLookup
}) {
  const { classes } = useStyles()
  const { lookupMode, featureUniprotId, geneName } = lookup
  return (
    <>
      <div className={classes.row}>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={lookupMode}
            onChange={event => {
              if (isLookupMode(event.target.value)) {
                lookup.setLookupMode(event.target.value)
              }
            }}
          >
            {featureUniprotId ? (
              <FormControlLabel
                value="feature"
                control={<Radio />}
                label={`From feature (${featureUniprotId})`}
              />
            ) : null}
            {lookup.hasSearchableIdentifier ? (
              <FormControlLabel
                value="auto"
                control={<Radio />}
                label="Look up from the feature's identifiers"
              />
            ) : null}
            <FormControlLabel
              value="manual"
              control={<Radio />}
              label="Enter manually"
            />
          </RadioGroup>
        </FormControl>
        {lookup.showIdentifierSelector ? (
          <>
            <FormControl size="small">
              <InputLabel>Query UniProt by</InputLabel>
              <Select
                value={lookup.selectedQueryId}
                label="Query UniProt by"
                onChange={event => {
                  lookup.setSelectedQueryId(event.target.value)
                }}
              >
                <MenuItem value="auto">Auto (try all)</MenuItem>
                {lookup.recognizedIds.map(id => (
                  <MenuItem key={id} value={id}>
                    {getDbIdLabel(id)}
                  </MenuItem>
                ))}
                {geneName ? (
                  <MenuItem value={`gene:${geneName}`}>
                    {geneName} (gene name)
                  </MenuItem>
                ) : null}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="NCBI taxon id"
              error={lookup.taxonIdError}
              helperText={
                lookup.taxonIdError
                  ? 'Not a taxon id; searching every species'
                  : 'Narrows the gene-name search to one species'
              }
              value={lookup.taxonId}
              onChange={event => {
                lookup.setTaxonId(event.target.value)
              }}
              placeholder="e.g. 9606"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 180 }}
            />
          </>
        ) : null}
      </div>

      {lookupMode === 'manual' ? (
        <div>
          <TextField
            autoFocus
            label="UniProt accession"
            variant="outlined"
            placeholder="e.g. P68871"
            size="small"
            value={lookup.manualUniprotId}
            error={lookup.manualUniprotIdInvalid}
            helperText={
              lookup.manualUniprotIdInvalid ? UNIPROT_ACCESSION_HINT : undefined
            }
            onChange={event => {
              lookup.setManualUniprotId(event.target.value)
            }}
          />
        </div>
      ) : null}

      {lookupMode === 'manual' && !lookup.manualUniprotId ? (
        <Typography variant="body2" color="textSecondary">
          Search{' '}
          <ExternalLink href="https://www.uniprot.org/">UniProt</ExternalLink>
          {' or '}
          <ExternalLink href="https://alphafold.ebi.ac.uk/">
            AlphaFoldDB
          </ExternalLink>
        </Typography>
      ) : null}

      {lookup.showIdentifierSelector ? (
        <Typography variant="body2" color="textSecondary">
          {lookup.organismDescription}
        </Typography>
      ) : null}

      {lookup.nothingToSearch ? (
        <Typography variant="body2" color="textSecondary">
          This feature carries no Ensembl, RefSeq, CCDS or HGNC identifier and
          no gene name; enter a UniProt accession
        </Typography>
      ) : null}

      <NoticeLine
        message={lookup.lookupPartialFailure}
        onRetry={lookup.retryLookup}
        retrying={lookup.lookupRetrying}
      />
    </>
  )
})

export default UniProtLookupControls
