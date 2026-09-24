import React, { useState } from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { observer } from 'mobx-react'
import { stripStopCodon } from 'p2s_mapper'
import { makeStyles } from 'tss-react/mui'

import PartialFailureNotice from './PartialFailureNotice'
import SequenceMismatchNotice from './SequenceMismatchNotice'
import StructureSourcePicker from './StructureSourcePicker'
import TranscriptSelector from './TranscriptSelector'
import ExternalLink from '../../components/ExternalLink'
import useDebouncedValue from '../hooks/useDebouncedValue'
import { useSafeLaunch } from '../hooks/useSafeLaunch'
import useStructureFileSequence from '../hooks/useStructureFileSequence'
import useTranscriptIsoformSelection from '../hooks/useTranscriptIsoformSelection'
import { launch3DProteinView } from '../utils/launchViewUtils'
import { readStructureFile } from '../utils/readStructureFile'

import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const useStyles = makeStyles()(theme => ({
  dialogContent: {
    marginTop: theme.spacing(6),
    width: '80em',
  },
}))

type LGV = LinearGenomeViewModel

function HelpText() {
  return (
    <div style={{ marginBottom: 20 }}>
      Manually supply a protein structure (PDB, mmCIF, etc) for a given
      transcript. You can open the file from the result of running, for example,{' '}
      <ExternalLink href="https://github.com/sokrypton/ColabFold">
        ColabFold
      </ExternalLink>
      . This plugin will align the protein sequence calculated from the genome
      to the protein sequence embedded in the structure file which allows for
      slight differences in these two representations.
    </div>
  )
}

const UserProvidedStructure = observer(function UserProvidedStructure({
  feature,
  preferredTranscriptId,
  session,
  view,
  handleClose,
}: {
  feature: Feature
  preferredTranscriptId?: string
  session: AbstractSessionModel
  view: LGV
  handleClose: () => void
}) {
  const { classes } = useStyles()
  const [file, setFile] = useState<File>()
  const [choice, setChoice] = useState('file')
  const [structureURL, setStructureURL] = useState('')
  const { runLaunch, launchError } = useSafeLaunch(handleClose)

  const activeFile = choice === 'file' ? file : undefined
  const activeURL = choice === 'file' ? '' : structureURL
  // Only the sequence read is debounced: typing a url is a fast-changing value
  // behind a download and a molstar parse. The launch reads the field itself,
  // so clicking inside the window opens what the user typed rather than the
  // url as it stood 600 ms ago.
  const debouncedURL = useDebouncedValue(activeURL, 600)

  const {
    sequences: structureSequences,
    isLoading: isStructureLoading,
    error: fileError,
  } = useStructureFileSequence({ file: activeFile, url: debouncedURL })

  const {
    transcripts: options,
    isoformSequences,
    // the chain the isoforms are compared against — not blindly chain 0, which
    // mismatched every heteromer the view itself went on to map correctly
    structureSequence,
    selectedTranscriptId: userSelection,
    setSelectedTranscriptId: setUserSelection,
    selectedTranscript,
    selectedIsoform: protein,
    error: isoformError,
    partialFailure: isoformPartialFailure,
  } = useTranscriptIsoformSelection({
    feature,
    view,
    structureSequences,
    preferredTranscriptId,
  })

  const error = isoformError ?? launchError ?? fileError

  const canLaunch =
    !!(activeURL || activeFile) && !!protein && !!selectedTranscript
  const sequencesDiffer =
    !!protein?.seq &&
    !!structureSequence &&
    stripStopCodon(protein.seq) !== structureSequence

  const handleLaunch = runLaunch(async () => {
    if (protein && selectedTranscript) {
      const structureData = activeFile
        ? await readStructureFile(activeFile)
        : undefined
      launch3DProteinView({
        session,
        view,
        feature,
        selectedTranscript,
        url: activeURL ? activeURL : undefined,
        data: structureData,
        userProvidedTranscriptSequence: protein.seq,
      })
    }
  })

  return (
    <>
      <DialogContent className={classes.dialogContent}>
        {error ? <ErrorMessage error={error} /> : null}
        <HelpText />

        <StructureSourcePicker
          choice={choice}
          setChoice={setChoice}
          structureURL={structureURL}
          setStructureURL={setStructureURL}
          setFile={setFile}
        />
        <div style={{ margin: 20 }}>
          {isStructureLoading ? (
            <LoadingEllipses
              variant="subtitle2"
              message="Reading residues from the structure"
            />
          ) : null}
          <PartialFailureNotice message={isoformPartialFailure} />
          {isoformSequences ? (
            structureSequence ? (
              <TranscriptSelector
                val={userSelection}
                setVal={setUserSelection}
                structureSequence={structureSequence}
                isoforms={options}
                feature={feature}
                isoformSequences={isoformSequences}
              />
            ) : null
          ) : (
            <LoadingEllipses title="Loading protein sequences" variant="h6" />
          )}
        </div>
      </DialogContent>
      <DialogActions>
        {sequencesDiffer ? <SequenceMismatchNotice /> : null}
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            handleClose()
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!canLaunch}
          onClick={() => {
            handleLaunch()
          }}
        >
          Launch 3D protein structure view
        </Button>
      </DialogActions>
    </>
  )
})

export default UserProvidedStructure
