import React, { useState } from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import IsoformSequencesToggle from './IsoformSequencesToggle'
import SequenceMismatchNotice from './SequenceMismatchNotice'
import StructureSourcePicker from './StructureSourcePicker'
import TranscriptSelector from './TranscriptSelector'
import ExternalLink from '../../components/ExternalLink'
import useStructureFileSequence from '../hooks/useStructureFileSequence'
import useTranscriptIsoformSelection from '../hooks/useTranscriptIsoformSelection'
import { launch3DProteinView } from '../utils/launchViewUtils'
import { stripStopCodon } from '../utils/util'

import type { AlignmentAlgorithm } from '../../ProteinView/types'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const useStyles = makeStyles()(theme => ({
  dialogContent: {
    marginTop: theme.spacing(6),
    width: '80em',
  },
  textAreaFont: {
    fontFamily: 'Courier New',
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
  session,
  view,
  handleClose,
  alignmentAlgorithm,
  onAlignmentAlgorithmChange,
}: {
  feature: Feature
  session: AbstractSessionModel
  view: LGV
  handleClose: () => void
  alignmentAlgorithm: AlignmentAlgorithm
  onAlignmentAlgorithmChange: (algorithm: AlignmentAlgorithm) => void
}) {
  const { classes } = useStyles()
  const [file, setFile] = useState<File>()
  const [pdbId, setPdbId] = useState('')
  const [choice, setChoice] = useState('file')
  const [submitError, setSubmitError] = useState<unknown>()
  const [structureURL, setStructureURL] = useState('')

  const activeFile = choice === 'file' ? file : undefined
  const activeURL = choice === 'file' ? '' : structureURL

  const { sequences: structureSequences, error: fileError } =
    useStructureFileSequence({ file: activeFile, url: activeURL })

  const structureName =
    activeFile?.name ?? activeURL.slice(activeURL.lastIndexOf('/') + 1)
  const structureSequence = structureSequences?.[0]

  const {
    transcripts: options,
    isoformSequences,
    selectedTranscriptId: userSelection,
    setSelectedTranscriptId: setUserSelection,
    selectedTranscript,
    selectedIsoform: protein,
    error: isoformError,
  } = useTranscriptIsoformSelection({ feature, view, structureSequence })

  const error = isoformError ?? submitError ?? fileError

  const canLaunch =
    !!(activeURL || activeFile) && !!protein && !!selectedTranscript
  const sequencesDiffer =
    !!protein?.seq &&
    !!structureSequence &&
    stripStopCodon(protein.seq) !== structureSequence

  const handleLaunch = async () => {
    if (!protein || !selectedTranscript) {
      return
    }
    try {
      const structureData = activeFile ? await activeFile.text() : undefined
      const url = activeURL ? activeURL : undefined
      launch3DProteinView({
        session,
        view,
        feature,
        selectedTranscript,
        url,
        data: structureData,
        userProvidedTranscriptSequence: protein.seq,
        alignmentAlgorithm,
      })
      handleClose()
    } catch (e) {
      console.error(e)
      setSubmitError(e)
    }
  }

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
          pdbId={pdbId}
          setPdbId={setPdbId}
        />
        <div style={{ margin: 20 }}>
          {isoformSequences ? (
            structureSequence ? (
              <>
                <TranscriptSelector
                  val={userSelection}
                  setVal={setUserSelection}
                  structureSequence={structureSequence}
                  isoforms={options}
                  feature={feature}
                  isoformSequences={isoformSequences}
                />
                <IsoformSequencesToggle
                  structureSequence={structureSequence}
                  structureName={structureName}
                  isoformSequences={isoformSequences}
                />
              </>
            ) : null
          ) : (
            <LoadingEllipses title="Loading protein sequences" variant="h6" />
          )}
        </div>
      </DialogContent>
      <DialogActions>
        {sequencesDiffer ? (
          <SequenceMismatchNotice
            alignmentAlgorithm={alignmentAlgorithm}
            onAlignmentAlgorithmChange={onAlignmentAlgorithmChange}
          />
        ) : null}
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
            void handleLaunch()
          }}
        >
          Launch 3-D protein structure view
        </Button>
      </DialogActions>
    </>
  )
})

export default UserProvidedStructure
