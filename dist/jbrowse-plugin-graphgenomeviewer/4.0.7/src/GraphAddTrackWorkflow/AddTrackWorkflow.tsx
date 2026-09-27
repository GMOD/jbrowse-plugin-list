import { useState } from 'react'

import { AssemblySelector, ErrorMessage, FileSelector } from '@jbrowse/core/ui'
import { addTrackFromWidget, getSession, makeTrackId } from '@jbrowse/core/util'
import { makeStyles } from '@jbrowse/core/util/tss-react'
import { getRoot } from '@jbrowse/mobx-state-tree'
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material'
import { observer } from 'mobx-react'

import {
  GRAPH_FILE_FIELDS,
  GRAPH_FILE_LABELS,
  buildTrackConfig,
} from './buildTrackConfig'

import type { GraphFileChoice } from './buildTrackConfig'
import type {
  AbstractRootModel,
  AddTrackWorkflowModel,
  FileLocation,
} from '@jbrowse/core/util'

const useStyles = makeStyles()(theme => ({
  paper: {
    margin: theme.spacing(),
    padding: theme.spacing(),
  },
  field: {
    marginTop: theme.spacing(2),
  },
  submit: {
    marginTop: 25,
    marginBottom: 100,
    display: 'block',
  },
}))

const CHOICES: GraphFileChoice[] = [
  'RgfaTabixAdapter',
  'MinigraphBubbleAdapter',
]

const GraphAddTrackWidget = observer(function GraphAddTrackWidget({
  model,
}: {
  model: AddTrackWorkflowModel
}) {
  const { classes } = useStyles()
  const session = getSession(model)
  const rootModel = getRoot<AbstractRootModel>(model)
  const [choice, setChoice] = useState<GraphFileChoice>('RgfaTabixAdapter')
  const [loc, setLoc] = useState<FileLocation>()
  const [indexLoc, setIndexLoc] = useState<FileLocation>()
  const [sample, setSample] = useState('')
  const [trackName, setTrackName] = useState('Pangenome graph')
  const [error, setError] = useState<unknown>()

  function handleSubmit() {
    if (!loc || !model.assembly) {
      return
    }
    try {
      setError(undefined)
      const name = trackName.trim()
      addTrackFromWidget({
        model,
        session,
        conf: buildTrackConfig({
          choice,
          loc,
          indexLoc,
          assembly: model.assembly,
          sample,
          trackId: makeTrackId({ name }),
          name,
        }),
      })
    } catch (e) {
      setError(e)
    }
  }

  return (
    <Paper className={classes.paper}>
      {error ? <ErrorMessage error={error} /> : null}
      <FormControl>
        <FormLabel>File type</FormLabel>
        <RadioGroup
          value={choice}
          onChange={event => {
            setChoice(event.target.value as GraphFileChoice)
          }}
        >
          {CHOICES.map(option => (
            <FormControlLabel
              key={option}
              value={option}
              control={<Radio />}
              label={GRAPH_FILE_LABELS[option]}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <FileSelector
        location={loc}
        name={GRAPH_FILE_FIELDS[choice]}
        rootModel={rootModel}
        setLocation={setLoc}
      />
      <FileSelector
        location={indexLoc}
        name="Path to tabix index (optional; the sibling .tbi is assumed, a .csi is recognised by name)"
        rootModel={rootModel}
        setLocation={setIndexLoc}
      />
      <TextField
        className={classes.field}
        value={sample}
        onChange={event => {
          setSample(event.target.value)
        }}
        label="Sample name in the graph"
        slotProps={{ htmlInput: { 'data-testid': 'graph-sample-input' } }}
        helperText="Optional. The PanSN prefix the graph gives this assembly, e.g. GRCh38 for HPRC's GRCh38#0#chr1; leave blank when the graph's stable names are bare"
        placeholder="GRCh38"
        fullWidth
      />
      <TextField
        className={classes.field}
        value={trackName}
        helperText="Track name"
        slotProps={{ htmlInput: { 'data-testid': 'graph-track-name-input' } }}
        onChange={event => {
          setTrackName(event.target.value)
        }}
      />
      <AssemblySelector
        session={session}
        helperText="Select assembly to add track to"
        selected={model.assembly}
        onChange={arg => {
          model.setAssembly(arg)
        }}
        fullWidth
      />
      <Button
        variant="contained"
        className={classes.submit}
        disabled={!loc || !trackName.trim() || !model.assembly}
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Paper>
  )
})

export default GraphAddTrackWidget
