import React, { useState } from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import {
  Button,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import FoldseekDatabaseSelector from './FoldseekDatabaseSelector'
import FoldseekResultsTable from './FoldseekResultsTable'
import TranscriptSelector from './TranscriptSelector'
import useFoldseekSearch from '../hooks/useFoldseekSearch'
import useTranscriptIsoformSelection from '../hooks/useTranscriptIsoformSelection'
import { DEFAULT_DATABASES } from '../services/foldseekApi'
import { stripStopCodon } from '../utils/util'

import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const useStyles = makeStyles()({
  dialogContent: {
    width: '80em',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  sequenceInput: {
    fontFamily: 'monospace',
  },
  di3Section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
})

const FoldseekSearch = observer(function FoldseekSearch({
  feature,
  session,
  view,
  handleClose,
}: {
  feature: Feature
  session: AbstractSessionModel
  view: LinearGenomeViewModel
  handleClose: () => void
}) {
  const { classes } = useStyles()

  const [userEditedSequence, setUserEditedSequence] = useState<
    string | undefined
  >()
  const [selectedDatabases, setSelectedDatabases] = useState(DEFAULT_DATABASES)

  const {
    results,
    cleanedAaSequence,
    di3Sequence,
    isLoading,
    isPredicting,
    error,
    statusMessage,
    predictStructure,
    search,
    reset,
  } = useFoldseekSearch()

  const {
    transcripts,
    isoformSequences,
    isLoading: isLoadingIsoforms,
    error: isoformError,
    selectedTranscriptId: effectiveSelectedTranscriptId,
    setSelectedTranscriptId: setUserSelection,
    selectedTranscript,
    selectedIsoform: selectedIsoformData,
  } = useTranscriptIsoformSelection({ feature, view })

  const cleanedSequence = selectedIsoformData
    ? stripStopCodon(selectedIsoformData.seq)
    : ''
  const sequence = userEditedSequence ?? cleanedSequence

  const setUserSelectionWithReset = (id: string | undefined) => {
    setUserSelection(id)
    setUserEditedSequence(undefined)
  }

  const canPredict = sequence.trim().length > 0 && !isPredicting && !isLoading
  const canSearch =
    !!cleanedAaSequence &&
    !!di3Sequence &&
    selectedDatabases.length > 0 &&
    !isLoading

  const combinedError = error ?? isoformError
  const isBusy = isLoading || isPredicting

  return (
    <>
      <DialogContent className={classes.dialogContent}>
        {combinedError && !isLoadingIsoforms ? (
          <ErrorMessage error={combinedError} />
        ) : null}

        {isLoadingIsoforms ? (
          <LoadingEllipses
            variant="subtitle2"
            message="Loading transcript sequences"
          />
        ) : null}

        {isoformSequences ? (
          <>
            <TranscriptSelector
              val={effectiveSelectedTranscriptId}
              setVal={setUserSelectionWithReset}
              isoforms={transcripts}
              isoformSequences={isoformSequences}
              feature={feature}
              disabled={isBusy}
            />
            <TextField
              label="Protein sequence (amino acids)"
              multiline
              rows={4}
              value={sequence}
              onChange={e => {
                setUserEditedSequence(e.target.value)
              }}
              placeholder={`MKTVRQERLKSIVRILERSKEPVSGAQLAEEL...`}
              disabled={isBusy}
              InputProps={{
                className: classes.sequenceInput,
              }}
            />
          </>
        ) : null}

        {di3Sequence ? (
          <div className={classes.di3Section}>
            <Typography variant="subtitle2">
              3Di structural alphabet (used for searching):
            </Typography>
            <TextField
              multiline
              rows={4}
              value={di3Sequence}
              InputProps={{
                className: classes.sequenceInput,
                readOnly: true,
              }}
            />
          </div>
        ) : null}

        <FoldseekDatabaseSelector
          selected={selectedDatabases}
          onChange={setSelectedDatabases}
          disabled={isBusy}
        />

        {statusMessage ? (
          <LoadingEllipses variant="subtitle2" message={statusMessage} />
        ) : null}

        {results ? (
          <FoldseekResultsTable
            results={results}
            session={session}
            view={view}
            feature={feature}
            selectedTranscript={selectedTranscript}
            userProvidedTranscriptSequence={sequence}
            onClose={handleClose}
          />
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            handleClose()
          }}
        >
          Cancel
        </Button>
        {results ? (
          <Button
            variant="outlined"
            onClick={() => {
              reset()
            }}
          >
            New search
          </Button>
        ) : null}
        {!di3Sequence ? (
          <Button
            variant="contained"
            color="primary"
            disabled={!canPredict}
            onClick={() => {
              void predictStructure(sequence.trim())
            }}
          >
            {isPredicting ? 'Predicting...' : 'Predict 3Di structure'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            disabled={!canSearch}
            onClick={() => {
              void search(cleanedAaSequence!, di3Sequence, selectedDatabases)
            }}
          >
            {isLoading ? 'Searching...' : 'Search Foldseek'}
          </Button>
        )}
      </DialogActions>
    </>
  )
})

export default FoldseekSearch
