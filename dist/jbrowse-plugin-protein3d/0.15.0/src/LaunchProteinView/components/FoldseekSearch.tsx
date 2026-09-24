import React, { useState } from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import {
  Button,
  DialogActions,
  DialogContent,
  Link,
  TextField,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { stripAllStopCodons } from 'p2s_mapper'
import { makeStyles } from 'tss-react/mui'

import FoldseekDatabaseSelector from './FoldseekDatabaseSelector'
import FoldseekResultsTable from './FoldseekResultsTable'
import PartialFailureNotice from './PartialFailureNotice'
import TranscriptSelector from './TranscriptSelector'
import useFoldseekSearch from '../hooks/useFoldseekSearch'
import useTranscriptIsoformSelection from '../hooks/useTranscriptIsoformSelection'
import {
  DEFAULT_DATABASES,
  foldseekLengthProblem,
} from '../services/foldseekApi'

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
    alignItems: 'flex-start',
  },
})

const FoldseekSearch = observer(function FoldseekSearch({
  feature,
  preferredTranscriptId,
  session,
  view,
  handleClose,
}: {
  feature: Feature
  preferredTranscriptId?: string
  session: AbstractSessionModel
  view: LinearGenomeViewModel
  handleClose: () => void
}) {
  const { classes } = useStyles()

  const [userEditedSequence, setUserEditedSequence] = useState<
    string | undefined
  >()
  const [selectedDatabases, setSelectedDatabases] = useState(DEFAULT_DATABASES)
  const [show3Di, setShow3Di] = useState(false)

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
    cancel,
    reset,
  } = useFoldseekSearch()

  const {
    transcripts,
    isoformSequences,
    isLoading: isLoadingIsoforms,
    error: isoformError,
    partialFailure: isoformPartialFailure,
    selectedTranscriptId: effectiveSelectedTranscriptId,
    setSelectedTranscriptId: setUserSelection,
    selectedTranscript,
    selectedIsoform: selectedIsoformData,
  } = useTranscriptIsoformSelection({
    feature,
    view,
    preferredTranscriptId,
  })

  const cleanedSequence = selectedIsoformData
    ? stripAllStopCodons(selectedIsoformData.seq)
    : ''
  const sequence = userEditedSequence ?? cleanedSequence

  // Any change to the input sequence makes an existing 3Di prediction (and any
  // results derived from it) stale, so it goes back to being predicted on the
  // next search rather than a search running against the old residues.
  const invalidatePrediction = () => {
    if (di3Sequence !== undefined || results !== undefined) {
      reset()
    }
  }

  const setUserSelectionWithReset = (id: string | undefined) => {
    setUserSelection(id)
    setUserEditedSequence(undefined)
    invalidatePrediction()
  }

  const isBusy = isLoading || isPredicting
  const lengthProblem = foldseekLengthProblem(sequence)
  const canSearch =
    sequence.trim().length > 0 &&
    !lengthProblem &&
    selectedDatabases.length > 0 &&
    !isBusy

  // One button: predicting the 3Di alphabet is a step of the search, not a
  // decision, and making the user click twice only invited a stale prediction.
  const runSearch = async () => {
    const predicted =
      cleanedAaSequence && di3Sequence
        ? { aaSequence: cleanedAaSequence, di3Sequence }
        : await predictStructure(sequence.trim())
    if (predicted) {
      await search(
        predicted.aaSequence,
        predicted.di3Sequence,
        selectedDatabases,
      )
    }
  }

  const combinedError = error ?? isoformError

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

        <PartialFailureNotice message={isoformPartialFailure} />

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
                invalidatePrediction()
              }}
              placeholder={`MKTVRQERLKSIVRILERSKEPVSGAQLAEEL...`}
              disabled={isBusy}
              error={!!lengthProblem}
              helperText={lengthProblem}
              slotProps={{
                input: { className: classes.sequenceInput },
              }}
            />
          </>
        ) : null}

        {di3Sequence ? (
          <div className={classes.di3Section}>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => {
                setShow3Di(!show3Di)
              }}
            >
              {show3Di ? 'Hide 3Di' : 'Show 3Di'}
            </Link>
            {show3Di ? (
              <TextField
                label="3Di structural alphabet (what the search runs on)"
                multiline
                rows={4}
                fullWidth
                value={di3Sequence}
                slotProps={{
                  input: { className: classes.sequenceInput, readOnly: true },
                }}
              />
            ) : null}
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
            userProvidedTranscriptSequence={selectedIsoformData?.seq}
            onClose={handleClose}
          />
        ) : null}

        <Typography variant="body2" color="textSecondary">
          Searching sends the protein sequence above to the foldseek.com
          servers, which predict its 3Di alphabet and run the structure search.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            handleClose()
          }}
        >
          Close
        </Button>
        {isBusy ? (
          <Button
            variant="outlined"
            onClick={() => {
              cancel()
            }}
          >
            Cancel search
          </Button>
        ) : null}
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
        <Button
          variant="contained"
          color="primary"
          disabled={!canSearch}
          onClick={() => {
            void runSearch()
          }}
        >
          {isPredicting
            ? 'Predicting 3Di...'
            : isLoading
              ? 'Searching...'
              : 'Search Foldseek'}
        </Button>
      </DialogActions>
    </>
  )
})

export default FoldseekSearch
