import { useState } from 'react'

import { TextField, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

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

// Only a GBZ cut reads the set. The inner field is keyed on it so an outside
// change (a restored session, a launch) resets the draft rather than fighting
// it.
const SubgraphHaplotypesField = observer(function SubgraphHaplotypesField({
  model,
}: {
  model: LinearGraphCutModel
}) {
  const { classes } = useStyles()
  return model.adapterConfig.type === 'GbzBaseSyntenyAdapter' ? (
    <div className={classes.section}>
      <HaplotypeListField
        key={model.chosenHaplotypes?.join(',') ?? ''}
        model={model}
      />
      <Typography variant="caption" color="text.secondary">
        The haplotypes the cut is for, as lane assembly names or PanSN prefixes
        (HG002#1, or HG002 for both), separated by commas. The cut keeps their
        walks and the nodes those walks visit, with the reference. Empty is
        every haplotype.
      </Typography>
    </div>
  ) : null
})

export default SubgraphHaplotypesField
