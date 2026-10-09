import { useState } from 'react'

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

export function parseHaplotypeList(text: string) {
  const names = text
    .split(/[\s,]+/)
    .map(name => name.trim())
    .filter(name => name !== '')
  return names.length === 0 ? undefined : names
}

const HaplotypeListField = observer(function HaplotypeListField({
  model,
}: {
  model: LinearGraphCutModel
}) {
  const [draft, setDraft] = useState(model.chosenHaplotypes?.join(', ') ?? '')
  const apply = () => {
    const parsed = parseHaplotypeList(draft) ?? []
    const unchanged =
      parsed.join('\n') === (model.chosenHaplotypes ?? []).join('\n')
    if (!unchanged) {
      model.setSubgraphHaplotypes(parsed)
      void model.cut()
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
// typed prefix the list lacks (HG002 for both haplotypes) is kept too. The
// set applies when the list closes or, with the list closed, as it changes.
const HaplotypePickField = observer(function HaplotypePickField({
  model,
  names,
}: {
  model: LinearGraphCutModel
  names: string[]
}) {
  const [draft, setDraft] = useState(model.chosenHaplotypes ?? [])
  const [open, setOpen] = useState(false)
  const apply = (haplotypes: string[]) => {
    if (haplotypes.join('\n') !== (model.chosenHaplotypes ?? []).join('\n')) {
      model.setSubgraphHaplotypes(haplotypes)
      void model.cut()
    }
  }
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
      onClose={() => {
        setOpen(false)
        apply(draft)
      }}
      onChange={(_, value) => {
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
  const key = model.chosenHaplotypes?.join(',') ?? ''
  return cutsByHaplotype(model.adapterConfig) ? (
    <div className={classes.section}>
      {names ? (
        <HaplotypePickField key={key} model={model} names={names} />
      ) : (
        <HaplotypeListField key={key} model={model} />
      )}
      <Typography variant="caption" color="text.secondary">
        {names
          ? `The haplotypes the cut is for, of the graph's ${names.length.toLocaleString()}, or a PanSN prefix typed and entered (HG002 for both of its haplotypes).`
          : 'The haplotypes the cut is for, as lane assembly names or PanSN prefixes (HG002#1, or HG002 for both), separated by commas.'}{' '}
        The cut keeps their walks and the nodes those walks visit, with the
        reference. Empty is every haplotype.
      </Typography>
    </div>
  ) : null
})

export default SubgraphHaplotypesField
