import React, { useState } from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import {
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { getPdbStructureUrl, isPdbId, uniprotEntryUrl } from 'p2s_mapper'
import { makeStyles } from 'tss-react/mui'

import PartialFailureNotice from './PartialFailureNotice'
import PdbResultsTable from './PdbResultsTable'
import ProteinViewActions from './ProteinViewActions'
import TranscriptSelector from './TranscriptSelector'
import UniProtLookupControls from './UniProtLookupControls'
import UniProtLookupResults from './UniProtLookupResults'
import ExternalLink from '../../components/ExternalLink'
import useDebouncedValue from '../hooks/useDebouncedValue'
import useExperimentalStructures from '../hooks/useExperimentalStructures'
import usePdbEntry from '../hooks/usePdbEntry'
import useTranscriptIsoformSelection from '../hooks/useTranscriptIsoformSelection'

import type { UniProtIdLookup } from '../hooks/useUniProtIdLookup'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const useStyles = makeStyles()({
  dialogContent: {
    width: '80em',
    '& > *': {
      marginBottom: 20,
    },
    '& > *:last-child': {
      marginBottom: 0,
    },
  },
})

// Experimental structures of the gene's protein: RCSB lists every entry it
// aligns to the UniProt accession, ranked on coverage and resolution, so a
// reader who does not know a PDB id can still reach one.
// A crystal is usually a fragment, often with partners, so the view aligns
// the transcript to it after launch rather than expecting a sequence match
// here.
const PdbSearch = observer(function PdbSearch({
  feature,
  preferredTranscriptId,
  session,
  view,
  handleClose,
  lookup,
  sideBySide,
  onSideBySideChange,
}: {
  feature: Feature
  preferredTranscriptId?: string
  session: AbstractSessionModel
  view: LinearGenomeViewModel
  handleClose: () => void
  lookup: UniProtIdLookup
  sideBySide: boolean
  onSideBySideChange: (value: boolean) => void
}) {
  const { classes } = useStyles()
  const { uniprotId, isLookupLoading, lookupError } = lookup
  const {
    entries,
    error: pdbError,
    isLoading: isPdbLoading,
  } = useExperimentalStructures(uniprotId)
  const [userPdbId, setUserPdbId] = useState<string>()

  // A typed id reaches entries the accession's listing never offers: a structure
  // of a complex filed under a partner, anything a paper names. Debounced, so
  // the three characters on the way to four are not three fetches.
  const [typedPdbId, setTypedPdbId] = useState('')
  const trimmedTypedPdbId = typedPdbId.trim()
  const debouncedTypedPdbId = useDebouncedValue(trimmedTypedPdbId, 400)
  const typedPdbIdInvalid =
    trimmedTypedPdbId !== '' && !isPdbId(trimmedTypedPdbId)

  const selectedPdbId = isPdbId(debouncedTypedPdbId)
    ? debouncedTypedPdbId.toLowerCase()
    : userPdbId && entries?.some(e => e.pdbId === userPdbId)
      ? userPdbId
      : entries?.[0]?.pdbId
  const structureUrl = selectedPdbId
    ? getPdbStructureUrl(selectedPdbId)
    : undefined

  // The chosen entry's residues, which rank the isoforms and label the picker,
  // the same annotation the AlphaFold tab shows. Their failure costs the
  // ranking rather than the launch, which reads the structure file itself.
  const {
    entry,
    error: entryError,
    isValidating: isEntryValidating,
  } = usePdbEntry(selectedPdbId)
  const structureSequences = entry?.proteinSequences

  const {
    transcripts,
    structureSequence,
    ranking,
    isLoading: isIsoformLoading,
    isRanking,
    error: isoformError,
    partialFailure: isoformPartialFailure,
    selectedTranscriptId,
    setSelectedTranscriptId,
    selectedTranscript,
    selectedIsoform,
  } = useTranscriptIsoformSelection({
    feature,
    view,
    structureSequences,
    preferredTranscriptId,
    resetKey: uniprotId,
  })

  // Until the entry's chains arrive the ranking has no structure and orders
  // the isoforms by length, so a launch that takes the ranked default waits.
  // The right-clicked isoform needs no ranking and launches at once.
  // An entry RCSB cannot describe stops holding the launch.
  const awaitsChains =
    isEntryValidating &&
    !entryError &&
    selectedTranscriptId !== preferredTranscriptId
  const isoformStatuses = [
    isIsoformLoading && 'Loading protein sequences from transcript isoforms',
    isRanking && 'Aligning isoforms to the structure',
    awaitsChains && 'Reading the chains of the entry from RCSB',
    // the selection reads the debounced id, so a launch inside the debounce
    // opened the entry selected before the typing
    trimmedTypedPdbId !== debouncedTypedPdbId && 'Reading the typed PDB ID',
  ]
  const lookupStatuses = [
    isLookupLoading && 'Looking up UniProt ID',
    isPdbLoading && 'Listing PDB entries from RCSB',
  ]
  const loadingStatuses = [...lookupStatuses, ...isoformStatuses].filter(
    (s): s is string => !!s,
  )
  const isLoading = loadingStatuses.length > 0
  const error = isLoading
    ? undefined
    : (isoformError ?? lookupError ?? pdbError)
  // A typed PDB ID exists to get around a lookup that is slow, failing or
  // wrong, so only the isoforms it is ranked against hold its launch back
  const typedIdOverrides = isPdbId(debouncedTypedPdbId)
  // A typed id that is no PDB id selects nothing, and a launch would open
  // whichever entry the table had selected instead
  const launchWaiting =
    typedPdbIdInvalid ||
    (typedIdOverrides ? isoformStatuses.some(Boolean) : isLoading)
  const launchError = typedIdOverrides
    ? launchWaiting
      ? undefined
      : isoformError
    : error
  // Loading or failed, the lookup can still hold the previous query's
  // accession, which would name the view and its 1D entry
  const launchUniprotId =
    typedIdOverrides && (isLookupLoading || lookupError) ? undefined : uniprotId

  return (
    <>
      <DialogContent className={classes.dialogContent}>
        {error ? <ErrorMessage error={error} /> : null}

        <UniProtLookupControls lookup={lookup} />

        {loadingStatuses.map(status => (
          <LoadingEllipses key={status} variant="subtitle2" message={status} />
        ))}

        <PartialFailureNotice message={isoformPartialFailure} />

        <UniProtLookupResults lookup={lookup} />

        <TextField
          size="small"
          label="PDB ID"
          placeholder="e.g. 1TUP"
          helperText={
            typedPdbIdInvalid
              ? 'A PDB ID is four characters beginning with a digit'
              : 'Overrides the selection below'
          }
          error={typedPdbIdInvalid}
          value={typedPdbId}
          onChange={event => {
            setTypedPdbId(event.target.value)
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 240 }}
        />

        {uniprotId && entries && !isPdbLoading ? (
          entries.length > 0 ? (
            <PdbResultsTable
              entries={entries}
              selectedPdbId={selectedPdbId}
              onSelect={setUserPdbId}
            />
          ) : (
            <Typography>
              RCSB lists no experimental structure for{' '}
              <ExternalLink href={uniprotEntryUrl(uniprotId)}>
                {uniprotId}
              </ExternalLink>
              . The AlphaFoldDB tab has a predicted one.
            </Typography>
          )
        ) : null}

        {ranking && selectedTranscript ? (
          <TranscriptSelector
            val={selectedTranscriptId}
            setVal={setSelectedTranscriptId}
            structureSequence={structureSequence}
            feature={feature}
            isoforms={transcripts}
            ranking={ranking}
          />
        ) : null}
      </DialogContent>
      <DialogActions>
        <ProteinViewActions
          handleClose={handleClose}
          uniprotId={launchUniprotId}
          userSelectedProteinSequence={selectedIsoform}
          selectedTranscript={selectedTranscript}
          url={structureUrl}
          pdbId={selectedPdbId}
          feature={feature}
          view={view}
          session={session}
          sideBySide={sideBySide}
          onSideBySideChange={onSideBySideChange}
          isLoading={launchWaiting}
          error={launchError}
        />
      </DialogActions>
    </>
  )
})

export default PdbSearch
