import React, { useState } from 'react'

import { ErrorMessage } from '@jbrowse/core/ui'
import { Chip, Link, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { uniprotEntryUrl } from 'p2s_mapper'
import { makeStyles } from 'tss-react/mui'

import UniProtLookupControls from './UniProtLookupControls'
import UniProtLookupResults from './UniProtLookupResults'
import ExternalLink from '../../components/ExternalLink'
import { unambiguousEntry } from '../resolveGeneLaunch'

import type { UniProtIdLookup } from '../hooks/useUniProtIdLookup'

const useStyles = makeStyles()(theme => ({
  bar: {
    flex: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '4px 12px',
    padding: '8px 24px',
    background:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
  },
  accession: {
    fontFamily: 'monospace',
    fontWeight: 600,
  },
  reviewed: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontSize: '0.7rem',
    height: 20,
  },
  unreviewed: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    fontSize: '0.7rem',
    height: 20,
  },
  // its own scroll, so the structure list keeps a few rows beneath it
  panel: {
    flex: 'none',
    maxHeight: '40vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '4px 24px 12px',
    background:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
  },
}))

/**
 * Whether the lookup has settled on an entry nobody needs to check: the
 * feature names one, or the search found a single one or a single reviewed
 * one. Anything else opens the chooser by itself.
 */
function needsChoice(lookup: UniProtIdLookup) {
  return lookup.isAutoMode
    ? !lookup.isLookupLoading &&
        (!!lookup.lookupError || !unambiguousEntry(lookup.uniprotEntries))
    : !lookup.uniprotId
}

const Provenance = observer(function Provenance({
  lookup,
}: {
  lookup: UniProtIdLookup
}) {
  const count = lookup.uniprotEntries.length
  return (
    <Typography variant="body2" color="textSecondary">
      {lookup.lookupMode === 'feature'
        ? "named by the feature's own UniProt attribute"
        : lookup.lookupMode === 'manual'
          ? 'entered by hand'
          : count === 1
            ? `the one UniProt match for ${lookup.searchDescription}`
            : `picked from ${count} UniProt matches for ${lookup.searchDescription}`}
    </Typography>
  )
})

/**
 * The UniProt entry every structure below belongs to, in one line. The lookup
 * almost always settles it alone, so its controls open only on request, or by
 * themselves when it did not.
 */
const UniProtSummaryBar = observer(function UniProtSummaryBar({
  lookup,
}: {
  lookup: UniProtIdLookup
}) {
  const { classes } = useStyles()
  const [userOpen, setUserOpen] = useState<boolean>()
  const open = userOpen ?? needsChoice(lookup)
  const { uniprotId } = lookup
  const entry = lookup.uniprotEntries.find(e => e.accession === uniprotId)
  return (
    <>
      <div className={classes.bar} data-testid="uniprot-summary">
        {uniprotId ? (
          <>
            <Typography variant="body2">
              Protein{' '}
              <ExternalLink
                href={uniprotEntryUrl(uniprotId)}
                className={classes.accession}
              >
                {uniprotId}
              </ExternalLink>
              {[entry?.proteinName, entry?.organismName]
                .filter(Boolean)
                .map(s => ` · ${s}`)
                .join('')}
            </Typography>
            {entry ? (
              <Chip
                label={entry.isReviewed ? 'Reviewed' : 'Unreviewed'}
                size="small"
                className={
                  entry.isReviewed ? classes.reviewed : classes.unreviewed
                }
              />
            ) : null}
            <Provenance lookup={lookup} />
          </>
        ) : (
          <Typography variant="body2">
            {lookup.isLookupLoading
              ? `Looking up the UniProt entry for ${lookup.searchDescription}…`
              : lookup.lookupMode === 'auto'
                ? `No single UniProt entry for ${lookup.searchDescriptionOr}`
                : 'Enter a UniProt accession to list its structures'}
          </Typography>
        )}
        <Link
          component="button"
          variant="body2"
          data-testid="uniprot-change"
          aria-expanded={open}
          onClick={() => {
            setUserOpen(!open)
          }}
        >
          {open ? 'Done' : 'Change'}
        </Link>
      </div>
      {open ? (
        <div className={classes.panel} data-testid="uniprot-chooser">
          {lookup.lookupError ? (
            <ErrorMessage error={lookup.lookupError} />
          ) : null}
          <UniProtLookupControls lookup={lookup} />
          <UniProtLookupResults lookup={lookup} />
        </div>
      ) : null}
    </>
  )
})

export default UniProtSummaryBar
