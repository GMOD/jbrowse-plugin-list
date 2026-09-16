import React from 'react'

import { TextField, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import IdentifierSelector from './IdentifierSelector'
import PartialFailureNotice from './PartialFailureNotice'
import UniProtIdInput from './UniProtIdInput'

import type { UniProtIdLookup } from '../hooks/useUniProtIdLookup'

const useStyles = makeStyles()({
  endRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
})

// The accession picker every search tab starts from: which identifier the
// search runs on, which organism scopes it, and what to do when the feature
// carries nothing to search at all. One component because the tabs share one
// lookup and drifted apart when they each rendered their own copy.
export default function UniProtLookupControls({
  lookup,
}: {
  lookup: UniProtIdLookup
}) {
  const { classes } = useStyles()
  return (
    <>
      <UniProtIdInput
        lookupMode={lookup.lookupMode}
        onLookupModeChange={lookup.setLookupMode}
        manualUniprotId={lookup.manualUniprotId}
        onManualUniprotIdChange={lookup.setManualUniprotId}
        featureUniprotId={lookup.featureUniprotId}
        hasSearchableIdentifier={lookup.hasSearchableIdentifier}
        endContent={
          lookup.showIdentifierSelector ? (
            <div className={classes.endRow}>
              <IdentifierSelector
                recognizedIds={lookup.recognizedIds}
                geneName={lookup.geneName}
                selectedId={lookup.selectedQueryId}
                onSelectedIdChange={lookup.setSelectedQueryId}
              />
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
            </div>
          ) : null
        }
      />

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

      <PartialFailureNotice message={lookup.lookupPartialFailure} />
    </>
  )
}
