import React, { useState } from 'react'

import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import { getContainingView, getSession } from '@jbrowse/core/util'
import {
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import HelpButton from './HelpButton'
import MSATable from './MSATable'
import SequenceMismatchNotice from './SequenceMismatchNotice'
import TranscriptSelector from './TranscriptSelector'
import ExternalLink from '../../components/ExternalLink'
import useIsoformProteinSequences from '../hooks/useIsoformProteinSequences'
import useLocalStructureFileSequence from '../hooks/useLocalStructureFileSequence'
import useRemoteStructureFileSequence from '../hooks/useRemoteStructureFileSequence'
import useTranscriptSelection from '../hooks/useTranscriptSelection'
import {
  getPdbStructureUrl,
  launch3DProteinView,
} from '../utils/launchViewUtils'
import {
  getGeneDisplayName,
  getId,
  getTranscriptDisplayName,
  getTranscriptFeatures,
  stripStopCodon,
} from '../utils/util'

import type { AlignmentAlgorithm } from '../../ProteinView/types'
import type { AbstractTrackModel, Feature } from '@jbrowse/core/util'
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
  const [file, setFile] = useState<File>()
  const [pdbId, setPdbId] = useState('')
  const [choice, setChoice] = useState('file')
  const [submitError, setSubmitError] = useState<unknown>()
  const [structureURL, setStructureURL] = useState('')
  const [showAllProteinSequences, setShowAllProteinSequences] = useState(false)

  const activeFile = choice === 'file' ? file : undefined
  const activeURL = choice === 'file' ? '' : structureURL

  const options = getTranscriptFeatures(feature)
  const view = getContainingView(model) as LGV
  const { isoformSequences, error: isoformError } = useIsoformProteinSequences({
    feature,
    view,
  })
  const { sequences: localSequences, error: localFileError } =
    useLocalStructureFileSequence({ file: activeFile })
  const { sequences: remoteSequences, error: remoteFileError } =
    useRemoteStructureFileSequence({ url: activeURL })

  const structureName =
    activeFile?.name ?? activeURL.slice(activeURL.lastIndexOf('/') + 1)
  const structureSequences = activeFile ? localSequences : remoteSequences
  const structureSequence = structureSequences?.[0]

  const { userSelection, setUserSelection } = useTranscriptSelection({
    options,
    isoformSequences,
    structureSequence,
  })
  const selectedTranscript = options.find(val => getId(val) === userSelection)
  const protein = userSelection ? isoformSequences?.[userSelection] : undefined

  const error = isoformError ?? submitError ?? localFileError ?? remoteFileError

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
      if (!url && !structureData) {
        return
      }
      launch3DProteinView({
        session,
        view,
        feature,
        selectedTranscript,
        url,
        data: structureData,
        userProvidedTranscriptSequence: protein.seq,
        alignmentAlgorithm,
        displayName: `Protein view ${getGeneDisplayName(feature)} - ${getTranscriptDisplayName(selectedTranscript)}`,
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

        <div style={{ display: 'flex', margin: 30 }}>
          <Typography>
            Open your structure file <HelpButton />
          </Typography>

          <FormControl component="fieldset">
            <RadioGroup
              value={choice}
              onChange={event => {
                setChoice(event.target.value)
              }}
            >
              <FormControlLabel value="url" control={<Radio />} label="URL" />
              <FormControlLabel value="file" control={<Radio />} label="File" />
              <FormControlLabel
                value="pdb"
                control={<Radio />}
                label="PDB ID"
              />
            </RadioGroup>
          </FormControl>
          {choice === 'url' ? (
            <div>
              <Typography>
                Open a PDB/mmCIF/etc. file from remote URL
              </Typography>
              <TextField
                label="URL"
                value={structureURL}
                onChange={event => {
                  setStructureURL(event.target.value)
                }}
              />
            </div>
          ) : null}
          {choice === 'file' ? (
            <div style={{ paddingTop: 20 }}>
              <Typography>
                Open a PDB/mmCIF/etc. file from your local drive
              </Typography>
              <Button variant="outlined" component="label">
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={({ target }) => {
                    const file = target.files?.[0]
                    if (file) {
                      setFile(file)
                    }
                  }}
                />
              </Button>
            </div>
          ) : null}
          {choice === 'pdb' ? (
            <TextField
              value={pdbId}
              onChange={event => {
                const s = event.target.value
                setPdbId(s)
                setStructureURL(getPdbStructureUrl(s))
              }}
              label="PDB ID"
            />
          ) : null}
        </div>
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
                <div style={{ margin: 10 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setShowAllProteinSequences(!showAllProteinSequences)
                    }}
                  >
                    {showAllProteinSequences
                      ? 'Hide all isoform protein sequences'
                      : 'Show all isoform protein sequences'}
                  </Button>

                  {showAllProteinSequences ? (
                    <MSATable
                      structureSequence={structureSequence}
                      structureName={structureName}
                      isoformSequences={isoformSequences}
                    />
                  ) : null}
                </div>
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
