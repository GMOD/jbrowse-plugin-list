import React from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import {
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import AlphaFoldDBSearchStatus from './AlphaFoldDBSearchStatus'
import IdentifierSelector from './IdentifierSelector'
import ProteinViewActions from './ProteinViewActions'
import TranscriptSelector from './TranscriptSelector'
import UniProtIdInput from './UniProtIdInput'
import UniProtResultsTable from './UniProtResultsTable'
import ExternalLink from '../../components/ExternalLink'
import useAlphaFoldDBSearch from '../hooks/useAlphaFoldDBSearch'

import type { AlignmentAlgorithm } from '../../ProteinView/types'
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
  selectorsRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  endRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
})

const AlphaFoldDBSearch = observer(function AlphaFoldDBSearch({
  feature,
  session,
  view,
  handleClose,
  alignmentAlgorithm,
  onAlignmentAlgorithmChange,
}: {
  feature: Feature
  session: AbstractSessionModel
  view: LinearGenomeViewModel
  handleClose: () => void
  alignmentAlgorithm: AlignmentAlgorithm
  onAlignmentAlgorithmChange: (algorithm: AlignmentAlgorithm) => void
}) {
  const { classes } = useStyles()

  const state = useAlphaFoldDBSearch({ feature, view })

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

        <UniProtIdInput
          lookupMode={state.lookupMode}
          onLookupModeChange={state.setLookupMode}
          manualUniprotId={state.manualUniprotId}
          onManualUniprotIdChange={state.setManualUniprotId}
          featureUniprotId={state.featureUniprotId}
          endContent={
            state.showIdentifierSelector ? (
              <div className={classes.endRow}>
                <IdentifierSelector
                  recognizedIds={state.recognizedIds}
                  geneName={state.geneName}
                  selectedId={state.selectedQueryId}
                  onSelectedIdChange={state.setSelectedQueryId}
                />
                <TextField
                  size="small"
                  label="Organism (NCBI taxon)"
                  helperText="Scopes the gene-name search"
                  value={state.taxonId}
                  onChange={event => {
                    state.setTaxonId(event.target.value)
                  }}
                  placeholder={String(state.effectiveTaxonId)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ width: 180 }}
                />
              </div>
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
            directly and use "Enter manually" above.
          </Typography>
        )}

        {state.isoformSequences &&
        state.selectedTranscript &&
        state.structureSequence &&
        state.uniprotId ? (
          <>
            <div className={classes.selectorsRow}>
              <TranscriptSelector
                val={state.userSelection}
                setVal={state.setUserSelection}
                structureSequence={state.structureSequence}
                feature={feature}
                isoforms={state.transcriptOptions}
                isoformSequences={state.isoformSequences}
              />
            </div>
            <AlphaFoldDBSearchStatus
              uniprotId={state.modelAccession ?? state.uniprotId}
              structureSequence={state.structureSequence}
              isoformSequences={state.isoformSequences}
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
          alignmentAlgorithm={alignmentAlgorithm}
          onAlignmentAlgorithmChange={onAlignmentAlgorithmChange}
          sequencesMatch={state.sequencesMatch}
          isLoading={state.isLoading}
          error={state.error}
        />
      </DialogActions>
    </>
  )
})

export default AlphaFoldDBSearch
