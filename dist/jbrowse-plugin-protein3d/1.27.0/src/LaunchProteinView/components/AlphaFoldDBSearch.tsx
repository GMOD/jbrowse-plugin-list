import React from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import AlphaFoldDBSearchStatus from './AlphaFoldDBSearchStatus'
import PartialFailureNotice from './PartialFailureNotice'
import ProteinViewActions from './ProteinViewActions'
import TranscriptSelector from './TranscriptSelector'
import UniProtLookupControls from './UniProtLookupControls'
import UniProtLookupResults from './UniProtLookupResults'
import useAlphaFoldDBSearch from '../hooks/useAlphaFoldDBSearch'

import type { UniProtIdLookup } from '../hooks/useUniProtIdLookup'
import type { LaunchingGenomeView } from '../utils/genomeView'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'

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
  view: LaunchingGenomeView
  handleClose: () => void
  lookup: UniProtIdLookup
  sideBySide: boolean
  onSideBySideChange: (value: boolean) => void
}) {
  const { classes } = useStyles()

  const state = useAlphaFoldDBSearch({
    feature,
    view,
    lookup,
    preferredTranscriptId,
  })

  return (
    <>
      <DialogContent className={classes.dialogContent}>
        {state.error ? <ErrorMessage error={state.error} /> : null}
        {state.noModel ? (
          <Typography>
            AlphaFold DB has no model for {state.uniprotId}. The PDB and
            Foldseek tabs may have a structure.
          </Typography>
        ) : null}
        {state.modelsUnreachable ? (
          <Typography>
            AlphaFold DB&apos;s model list did not answer, so Launch opens the
            canonical model file for {state.uniprotId}, without comparing its
            sequence to the isoforms.
          </Typography>
        ) : null}

        <UniProtLookupControls lookup={lookup} />

        {state.loadingStatuses.map(status => (
          <LoadingEllipses key={status} variant="subtitle2" message={status} />
        ))}

        <PartialFailureNotice message={state.isoformPartialFailure} />

        <UniProtLookupResults lookup={lookup} />

        {state.ranking &&
        state.selectedTranscript &&
        (state.structureSequence || state.modelsUnreachable) &&
        state.uniprotId ? (
          <>
            <div className={classes.selectorsRow}>
              <TranscriptSelector
                val={state.userSelection}
                setVal={state.setUserSelection}
                structureSequence={state.structureSequence}
                feature={feature}
                isoforms={state.transcriptOptions}
                ranking={state.ranking}
              />
            </div>
            <AlphaFoldDBSearchStatus
              uniprotId={state.modelAccession ?? state.uniprotId}
              url={state.url}
            />
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <ProteinViewActions
          handleClose={handleClose}
          uniprotId={state.modelAccession ?? state.uniprotId}
          userSelectedProteinSequence={state.userSelectedProteinSequence}
          selectedTranscript={state.selectedTranscript}
          url={state.url}
          confidenceUrl={state.confidenceUrl}
          feature={feature}
          view={view}
          session={session}
          sideBySide={sideBySide}
          onSideBySideChange={onSideBySideChange}
          sequencesMatch={state.sequencesMatch}
          isLoading={state.isLoading}
          error={state.error}
        />
      </DialogActions>
    </>
  )
})

export default AlphaFoldDBSearch
