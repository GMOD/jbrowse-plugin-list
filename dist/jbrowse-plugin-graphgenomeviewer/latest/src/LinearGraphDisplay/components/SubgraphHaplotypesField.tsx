import { useRef, useState } from 'react'

import { Autocomplete, TextField, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import { cutsByHaplotype } from '../../graphTrackConfig'

import type { LinearGraphCutModel } from '../model'

const useStyles = makeStyles()({
  section: {
    marginBottom: 24,
  },
})

function parseHaplotypeList(text: string) {
  return text.split(/[\s,]+/).filter(name => name !== '')
}

const HaplotypeListField = observer(function HaplotypeListField({
  model,
}: {
  model: LinearGraphCutModel
}) {
  const [draft, setDraft] = useState(model.cutHaplotypes?.join(', ') ?? '')
  const apply = () => {
    const parsed = parseHaplotypeList(draft)
    const unchanged =
      parsed.join('\n') === (model.cutHaplotypes ?? []).join('\n')
    if (!unchanged) {
      model.setSubgraphHaplotypes(parsed)
      model.recut()
    }
  }
  return (
    <TextField
      fullWidth
      label="Haplotypes"
      placeholder="every haplotype"
      value={draft}
      slotProps={{ htmlInput: { 'data-testid': 'graph-haplotypes-field' } }}
      onChange={e => {
        setDraft(e.target.value)
      }}
      onBlur={() => {
        apply()
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          apply()
        }
      }}
    />
  )
})

// The haplotypes a walk-indexed graph's header names, searched as typed. A
// typed prefix the list lacks (HG002 for both haplotypes) is kept too, and
// becomes a chip on blur as well as on Enter. The set applies when the list
// closes or, with the list closed, as it changes. The ref holds the draft
// because a blur's onChange and onClose land in one event, before a rerender.
const HaplotypePickField = observer(function HaplotypePickField({
  model,
  names,
}: {
  model: LinearGraphCutModel
  names: string[]
}) {
  const [draft, setDraft] = useState(model.cutHaplotypes ?? [])
  const draftRef = useRef(draft)
  const [open, setOpen] = useState(false)
  const apply = (haplotypes: string[]) => {
    if (haplotypes.join('\n') !== (model.cutHaplotypes ?? []).join('\n')) {
      model.setSubgraphHaplotypes(haplotypes)
      model.recut()
    }
  }
  return (
    <Autocomplete
      multiple
      freeSolo
      autoSelect
      disableCloseOnSelect
      options={names}
      value={draft}
      open={open}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
        apply(draftRef.current)
      }}
      onChange={(_, value) => {
        draftRef.current = value
        setDraft(value)
        if (!open) {
          apply(value)
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          label="Haplotypes"
          placeholder={draft.length === 0 ? 'every haplotype' : undefined}
          slotProps={{
            ...params.slotProps,
            htmlInput: {
              ...params.slotProps.htmlInput,
              'data-testid': 'graph-haplotypes-field',
            },
          }}
        />
      )}
    />
  )
})

// Only a GBZ cut and a walk-indexed rGFA cut read the set. The inner field is
// keyed on it so an outside change (a restored session, a launch) resets the
// draft rather than fighting it.
const SubgraphHaplotypesField = observer(function SubgraphHaplotypesField({
  model,
}: {
  model: LinearGraphCutModel
}) {
  const { classes } = useStyles()
  const names = model.haplotypeNames
  const key = model.cutHaplotypes?.join(',') ?? ''
  const adapter = model.sourceAdapter
  return adapter && cutsByHaplotype(adapter) ? (
    <div className={classes.section}>
      {names ? (
        <HaplotypePickField key={key} model={model} names={names} />
      ) : (
        <HaplotypeListField key={key} model={model} />
      )}
      <Typography variant="caption" component="div" color="text.secondary">
        {names
          ? `Which of the graph's ${names.length.toLocaleString()} haplotypes to cut, or a PanSN prefix (HG002 for both).`
          : 'Which haplotypes to cut, as lane assembly names or PanSN prefixes (HG002#1, or HG002 for both) separated by commas.'}{' '}
        Empty is every haplotype.
      </Typography>
    </div>
  ) : null
})

export default SubgraphHaplotypesField
