import { useState } from 'react'

import { TextField, Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import type { GraphGenomeViewModel } from '../model'

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
  model: GraphGenomeViewModel
}) {
  const [draft, setDraft] = useState(model.subgraphHaplotypes?.join(', ') ?? '')
  const apply = () => {
    const parsed = parseHaplotypeList(draft)
    const unchanged =
      parsed?.join('\n') === model.subgraphHaplotypes?.join('\n')
    if (!unchanged) {
      model.setSubgraphHaplotypes(parsed)
      void model.reloadSubgraph()
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

// Only a graph cut from a track has a set to choose; a file holds whatever
// walks it holds. The inner field is keyed on the model's set so an outside
// change (a restored session, a launch) resets the draft rather than fighting
// it.
const SubgraphHaplotypesField = observer(function SubgraphHaplotypesField({
  model,
}: {
  model: GraphGenomeViewModel
}) {
  const { classes } = useStyles()
  return model.loadedTrackId ? (
    <div className={classes.section}>
      <HaplotypeListField
        key={model.subgraphHaplotypes?.join(',') ?? ''}
        model={model}
      />
      <Typography variant="caption" color="text.secondary">
        The haplotypes the cut is for, as lane assembly names or PanSN prefixes
        (HG002#1, or HG002 for both), separated by commas. The cut keeps their
        walks and the nodes those walks visit, with the reference. Empty is
        every haplotype. Only a gbz-base track reads this.
      </Typography>
    </div>
  ) : null
})

export default SubgraphHaplotypesField
