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

const sameList = (a: readonly string[], b: readonly string[]) =>
  a.join('\n') === b.join('\n')

// The cut's set, and the last one this field saw: an outside change (a
// restored session, a launch) resets the draft, while the field's own apply
// records what it set first, so it keeps its focus and draft
function useCutHaplotypes(model: LinearGraphCutModel, reset: () => void) {
  const current = model.cutHaplotypes ?? []
  const [seen, setSeen] = useState(current)
  if (!sameList(current, seen)) {
    setSeen(current)
    reset()
  }
  return (haplotypes: string[]) => {
    if (!sameList(haplotypes, current)) {
      setSeen(haplotypes)
      model.setSubgraphHaplotypes(haplotypes)
      model.recut()
    }
  }
}

const HaplotypeListField = observer(function HaplotypeListField({
  model,
}: {
  model: LinearGraphCutModel
}) {
  const [draft, setDraft] = useState(model.cutHaplotypes?.join(', ') ?? '')
  const setCut = useCutHaplotypes(model, () => {
    setDraft(model.cutHaplotypes?.join(', ') ?? '')
  })
  const apply = () => {
    setCut(parseHaplotypeList(draft))
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
// typed prefix the list lacks (HG002 for both haplotypes) is kept too, on
// Enter or when the field loses focus. The set applies when the list closes
// or, with the list closed, as it changes. Not MUI's `autoSelect`: in a
// multiple select its blur toggles the highlighted option, so a pick made by
// keyboard was dropped again on Tab.
const HaplotypePickField = observer(function HaplotypePickField({
  model,
  names,
}: {
  model: LinearGraphCutModel
  names: string[]
}) {
  const [draft, setDraft] = useState(model.cutHaplotypes ?? [])
  const draftRef = useRef(draft)
  const typed = useRef('')
  const [open, setOpen] = useState(false)
  const apply = useCutHaplotypes(model, () => {
    draftRef.current = model.cutHaplotypes ?? []
    setDraft(draftRef.current)
  })
  return (
    <Autocomplete
      multiple
      freeSolo
      disableCloseOnSelect
      options={names}
      value={draft}
      open={open}
      onOpen={() => {
        setOpen(true)
      }}
      onInputChange={(_, text) => {
        typed.current = text
      }}
      onClose={(_, reason) => {
        setOpen(false)
        const text = typed.current.trim()
        if (reason === 'blur' && text && !draftRef.current.includes(text)) {
          draftRef.current = [...draftRef.current, text]
          setDraft(draftRef.current)
        }
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

// Only a GBZ cut and a walk-indexed rGFA cut read the set
const SubgraphHaplotypesField = observer(function SubgraphHaplotypesField({
  model,
}: {
  model: LinearGraphCutModel
}) {
  const { classes } = useStyles()
  const names = model.haplotypeNames
  const adapter = model.sourceAdapter
  return adapter && cutsByHaplotype(adapter) ? (
    <div className={classes.section}>
      {names ? (
        <HaplotypePickField model={model} names={names} />
      ) : (
        <HaplotypeListField model={model} />
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
