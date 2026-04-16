import React from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import { getContainingView, getSession } from '@jbrowse/core/util'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import AlphaFoldDBSearchStatus from './AlphaFoldDBSearchStatus'
import AlphaFoldEntrySelector from './AlphaFoldEntrySelector'
import IdentifierSelector from './IdentifierSelector'
import ProteinViewActions from './ProteinViewActions'
import SequenceSearchStatus from './SequenceSearchStatus'
import TranscriptSelector from './TranscriptSelector'
import UniProtIdInput from './UniProtIdInput'
import UniProtResultsTable from './UniProtResultsTable'
import ExternalLink from '../../components/ExternalLink'
import useAlphaFoldDBSearch from '../hooks/useAlphaFoldDBSearch'

import type { AlignmentAlgorithm } from '../../ProteinView/types'
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util'
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
  selectorsRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
})

const AlphaFoldDBSearch = observer(function AlphaFoldDBSearch({
  feature,
  model,
  handleClose,
  alignmentAlgorithm,
  onAlignmentAlgorithmChange,
}: {
  feature: Feature
  model: AbstractTrackModel
  handleClose: () => void
  alignmentAlgorithm: AlignmentAlgorithm
  onAlignmentAlgorithmChange: (algorithm: AlignmentAlgorithm) => void
}) {
  const { classes } = useStyles()
  const session = getSession(model)
  const view = getContainingView(model) as LinearGenomeViewModel

  const state = useAlphaFoldDBSearch({ feature, view })

  return (
    <>
      <DialogContent className={classes.dialogContent}>
        {state.error ? <ErrorMessage error={state.error} /> : null}

        <UniProtIdInput
          lookupMode={state.lookupMode}
          onLookupModeChange={state.setLookupMode}
          manualUniprotId={state.manualUniprotId}
          onManualUniprotIdChange={state.setManualUniprotId}
          featureUniprotId={state.featureUniprotId}
          hasProteinSequence={!!state.userSelectedProteinSequence?.seq}
          sequenceSearchType={state.sequenceSearchType}
          onSequenceSearchTypeChange={state.setSequenceSearchType}
          endContent={
            state.showIdentifierSelector ? (
              <IdentifierSelector
                recognizedIds={state.recognizedIds}
                geneName={state.geneName}
                selectedId={state.selectedQueryId}
                onSelectedIdChange={state.setSelectedQueryId}
              />
            ) : null
          }
        />

        {state.loadingStatuses.map(status => (
          <LoadingEllipses key={status} variant="subtitle2" message={status} />
        ))}

        {state.showUniprotResults && (
          <>
            <Typography variant="body2" color="textSecondary">
              Searched UniProt by {state.searchDescription}
            </Typography>
            <UniProtResultsTable
              entries={state.uniprotEntries}
              selectedAccession={state.selectedTableAccession}
              onSelect={state.setSelectedUniprotId}
            />
            <Typography variant="body2" color="textSecondary">
              If you don't see the entry you're looking for, try a different
              identifier above or search{' '}
              <ExternalLink href="https://www.uniprot.org/">
                UniProt
              </ExternalLink>{' '}
              directly and use "Enter manually".
            </Typography>
          </>
        )}

        {state.showNoResults && (
          <Typography variant="body2" color="textSecondary">
            No UniProt entries found for {state.searchDescriptionOr}. Try a
            different identifier above, or search{' '}
            <ExternalLink href="https://www.uniprot.org/">UniProt</ExternalLink>{' '}
            directly and use "Enter manually" above, or use "Search sequence
            against AlphaFoldDB API" if available.
          </Typography>
        )}

        {state.showStructureSelectors && (
          <>
            <div className={classes.selectorsRow}>
              <TranscriptSelector
                val={state.userSelection ?? ''}
                setVal={state.setUserSelection}
                structureSequence={state.structureSequence}
                feature={feature}
                isoforms={state.transcriptOptions}
                isoformSequences={state.isoformSequences!}
              />
              {state.showAlphaFoldEntrySelector && (
                <AlphaFoldEntrySelector
                  predictions={state.predictions!}
                  selectedEntryIndex={state.selectedEntryIndex}
                  onSelectionChange={state.setSelectedEntryIndex}
                />
              )}
            </div>
            {state.showSequenceSearchStatus && (
              <SequenceSearchStatus
                isLoading={state.isSequenceSearchLoading}
                uniprotId={state.uniprotId}
                url={state.url}
                hasProteinSequence={!!state.userSelectedProteinSequence}
                sequenceSearchType={state.sequenceSearchType}
              />
            )}
            {state.showAlphaFoldDBSearchStatus && (
              <AlphaFoldDBSearchStatus
                uniprotId={state.uniprotId}
                selectedTranscript={state.selectedTranscript}
                structureSequence={state.structureSequence}
                isoformSequences={state.isoformSequences!}
                url={state.url}
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <ProteinViewActions
          handleClose={handleClose}
          uniprotId={state.uniprotId}
          userSelectedProteinSequence={state.userSelectedProteinSequence}
          selectedTranscript={state.selectedTranscript}
          url={state.url}
          confidenceUrl={state.confidenceUrl}
          feature={feature}
          view={view}
          session={session}
          alignmentAlgorithm={alignmentAlgorithm}
          onAlignmentAlgorithmChange={onAlignmentAlgorithmChange}
          sequencesMatch={state.sequencesMatch}
          isLoading={state.isLoading}
        />
      </DialogActions>
    </>
  )
})

export default AlphaFoldDBSearch
