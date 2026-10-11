import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import type { LinearGraphCutModel } from '../model'

const useStyles = makeStyles()({
  section: {
    marginBottom: 24,
  },
  formControl: {
    minWidth: 200,
  },
})

// Only an rGFA cut reads hops; a GBZ cut widens by its adapter's bp `context`.
// Hops past the region's own segments, each costing a tabix query per
// off-reference segment already reached. One is the default: at none a single
// detour draws as two unrelated stubs, which is a wrong picture of the graph
// rather than a cheaper one. Two exists for a graph whose alleles have alleles
// (HPRC's amylase window keeps growing at 2, the E. coli paa locus does not), and
// it stops there because a frontier is still not a bubble decomposition. Cut an
// exact slice with gfatools when that is what is wanted.
const SUBGRAPH_CONTEXTS = [
  { value: 0, label: 'None' },
  { value: 1, label: '1 hop' },
  { value: 2, label: '2 hops' },
]

const SubgraphContextSelect = observer(function SubgraphContextSelect({
  model,
}: {
  model: LinearGraphCutModel
}) {
  const { classes } = useStyles()
  return model.adapterConfig.type === 'RgfaTabixAdapter' ? (
    <div className={classes.section}>
      <FormControl className={classes.formControl}>
        <InputLabel>Graph context</InputLabel>
        <Select
          value={model.subgraphContext}
          label="Graph context"
          data-testid="graph-context-select"
          onChange={e => {
            model.setSubgraphContext(e.target.value)
            void model.cut()
          }}
        >
          {SUBGRAPH_CONTEXTS.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary">
        How far the cut follows links out of the region, one hop by default. A
        detour that leaves the reference before the window and rejoins after it
        is indexed under its own sequence, so at none its middle is missing and
        the one bubble draws as two unrelated stubs. Each hop costs a query per
        off-reference segment already reached. No effect on an index in
        gfa-to-tabix&apos;s default anchored layout, which files each bubble
        whole under its reference interval.
      </Typography>
    </div>
  ) : null
})

export default SubgraphContextSelect
