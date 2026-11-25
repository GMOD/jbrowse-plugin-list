import React, { useState } from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import ExternalLink from '../../components/ExternalLink'
import useDebouncedValue from '../hooks/useDebouncedValue'
import { useSafeLaunch } from '../hooks/useSafeLaunch'
import useStructureLaunch from '../hooks/useStructureLaunch'
import { launch3DProteinView } from '../utils/launchViewUtils'
import {
  LARGE_STRUCTURE_TEXT,
  formatFileSize,
} from '../utils/readStructureFile'
import IsoformMatchNotice from './IsoformMatchNotice'
import NoticeLine from './NoticeLine'
import StructureSourcePicker from './StructureSourcePicker'
import TranscriptSelector from './TranscriptSelector'
import UncodedTranscriptNotice from './UncodedTranscriptNotice'

import type { LaunchStructure } from '../hooks/useStructureLaunch'
import type { LaunchingGenomeView } from '../utils/genomeView'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'

const useStyles = makeStyles()(theme => ({
  dialogContent: {
    marginTop: theme.spacing(6),
    width: '80em',
  },
}))

const HelpText = observer(function HelpText() {
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
})

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
  view: LaunchingGenomeView
  handleClose: () => void
}) {
  const { classes } = useStyles()
  const [file, setFile] = useState<File>()
  const [choice, setChoice] = useState('file')
  const [structureURL, setStructureURL] = useState('')
  const { runLaunch, launchError, launching } = useSafeLaunch(handleClose)

  const activeFile = choice === 'file' ? file : undefined
  const activeURL = choice === 'file' ? '' : structureURL
  // Only the sequence read is debounced: typing a url is a fast-changing value
  // behind a download and a molstar parse. The launch reads the field itself,
  // so clicking inside the window opens what the user typed rather than the
  // url as it stood 600 ms ago.
  const debouncedURL = useDebouncedValue(activeURL, 600)
  const structure: LaunchStructure | undefined = activeFile
    ? {
        key: `file:${activeFile.name}:${activeFile.size}:${activeFile.lastModified}`,
        kind: 'file',
        file: activeFile,
      }
    : debouncedURL
      ? { key: `url:${debouncedURL}`, kind: 'url', url: debouncedURL }
      : undefined
  const launch = useStructureLaunch({
    structures: structure ? [structure] : [],
    feature,
    view,
    preferredTranscriptId,
  })
  const {
    selectedTranscript,
    selectedIsoform: protein,
    ranking,
    structureSequence,
  } = launch

  const error = launchError ?? launch.error
  // the right-clicked isoform launches without waiting for the url typed last
  const typing =
    activeURL !== debouncedURL &&
    launch.selectedTranscriptId !== preferredTranscriptId
  const canLaunch =
    !!(activeURL || activeFile) &&
    !!protein &&
    !!selectedTranscript &&
    !launch.isLoading &&
    !typing &&
    !launch.failed &&
    (!activeFile || launch.fileTextLength !== undefined) &&
    !launching
  const textSize = launch.fileTextLength ?? activeFile?.size ?? 0

  const handleLaunch = runLaunch(async () => {
    if (protein && selectedTranscript) {
      await launch3DProteinView({
        session,
        view,
        feature,
        selectedTranscript,
        sources: [
          {
            url: activeURL ? activeURL : undefined,
            data: activeFile ? await launch.readFileText?.() : undefined,
            fileName: activeFile?.name,
          },
        ],
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
          file={file}
          setFile={setFile}
        />
        <div style={{ margin: 20 }}>
          <NoticeLine
            message={
              activeFile && textSize > LARGE_STRUCTURE_TEXT
                ? `The session stores this file's ${formatFileSize(textSize)} of text, so it reopens without the file but saves and shares slowly; a URL keeps it small`
                : undefined
            }
          />
          {launch.loadingStatuses.map(status => (
            <LoadingEllipses
              key={status}
              variant="subtitle2"
              message={status}
            />
          ))}
          <NoticeLine
            message={launch.partialFailure}
            onRetry={launch.retryIsoforms}
            retrying={launch.isoformsRetrying}
          />
          {ranking ? (
            <>
              <UncodedTranscriptNotice
                feature={feature}
                preferredTranscriptId={preferredTranscriptId}
                selectedTranscript={selectedTranscript}
              />
              <TranscriptSelector
                val={launch.selectedTranscriptId}
                setVal={launch.setSelectedTranscriptId}
                structureSequence={structureSequence}
                isoforms={launch.transcripts}
                isoformSequences={launch.isoformSequences}
                feature={feature}
                ranking={ranking}
              />
            </>
          ) : null}
        </div>
      </DialogContent>
      <DialogActions>
        <IsoformMatchNotice
          ranking={ranking}
          selectedTranscript={selectedTranscript}
          structureSequence={structureSequence}
          feature={feature}
        />
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
