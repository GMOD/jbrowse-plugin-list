import React, { useEffect, useMemo, useState } from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import { getContainingView, getSession } from '@jbrowse/core/util'
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
import useIsoformProteinSequences from '../hooks/useIsoformProteinSequences'
import {
  DEFAULT_DATABASES,
  type FoldseekDatabaseId,
} from '../services/foldseekApi'
import { getTranscriptFeatures } from '../utils/util'

import type { AbstractTrackModel, Feature } from '@jbrowse/core/util'
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
  model,
  handleClose,
}: {
  feature: Feature
  model: AbstractTrackModel
  handleClose: () => void
}) {
  const { classes } = useStyles()
  const session = getSession(model)
  const view = getContainingView(model) as LinearGenomeViewModel

  const [sequence, setSequence] = useState('')
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string>('')
  const [selectedDatabases, setSelectedDatabases] =
    useState<FoldseekDatabaseId[]>(DEFAULT_DATABASES)

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

  const transcripts = useMemo(() => getTranscriptFeatures(feature), [feature])

  const {
    isoformSequences,
    isLoading: isLoadingIsoforms,
    error: isoformError,
  } = useIsoformProteinSequences({ feature, view })

  const selectedTranscript = transcripts.find(
    t => t.id() === selectedTranscriptId,
  )
  const selectedIsoformData = isoformSequences?.[selectedTranscriptId]

  useEffect(() => {
    if (isoformSequences && !selectedTranscriptId) {
      const sortedTranscripts = [...transcripts].sort((a, b) => {
        const seqA = isoformSequences[a.id()]?.seq
        const seqB = isoformSequences[b.id()]?.seq
        return (seqB?.length ?? 0) - (seqA?.length ?? 0)
      })
      const firstWithSeq = sortedTranscripts.find(
        t => isoformSequences[t.id()]?.seq,
      )
      if (firstWithSeq) {
        setSelectedTranscriptId(firstWithSeq.id())
      }
    }
  }, [isoformSequences, selectedTranscriptId, transcripts])

  useEffect(() => {
    if (selectedIsoformData?.seq) {
      // Strip stop codons from displayed sequence
      setSequence(selectedIsoformData.seq.replace(/\*/g, ''))
    }
  }, [selectedIsoformData])

  const handlePredict = async () => {
    if (sequence.trim()) {
      await predictStructure(sequence.trim())
    }
  }

  const handleSearch = () => {
    if (cleanedAaSequence && di3Sequence && selectedDatabases.length > 0) {
      search(cleanedAaSequence, di3Sequence, selectedDatabases).catch(
        (e: unknown) => {
          console.error(e)
        },
      )
    }
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
              val={selectedTranscriptId}
              setVal={setSelectedTranscriptId}
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
                setSequence(e.target.value)
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
        <Button variant="contained" color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        {results ? (
          <Button variant="outlined" onClick={reset}>
            New search
          </Button>
        ) : null}
        {!di3Sequence ? (
          <Button
            variant="contained"
            color="primary"
            disabled={!canPredict}
            onClick={() => {
              handlePredict().catch((e: unknown) => {
                console.error(e)
              })
            }}
          >
            {isPredicting ? 'Predicting...' : 'Predict 3Di structure'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            disabled={!canSearch}
            onClick={handleSearch}
          >
            {isLoading ? 'Searching...' : 'Search Foldseek'}
          </Button>
        )}
      </DialogActions>
    </>
  )
})

export default FoldseekSearch
