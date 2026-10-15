import { Typography } from '@mui/material'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'

import LabelledSelect from '../../GraphGenomeView/components/LabelledSelect'
import { walkIndexed } from '../../graphTrackConfig'

import type { LinearGraphCutModel } from '../model'

const useStyles = makeStyles()({
  section: {
    marginBottom: 24,
  },
})

// Only an rGFA cut from segment rows reads hops: a GBZ cut widens by its
// adapter's bp `context`, and a walk-indexed cut follows its walks.
// Hops past the region's own segments, each costing a tabix query per
// off-reference segment already reached. One is the default: at none a single
// detour draws as two unrelated stubs, which is a wrong picture of the graph
// rather than a cheaper one. Two exists for a graph whose alleles have alleles
// (HPRC's amylase window keeps growing at 2, the E. coli paa locus does not), and
// it stops there because a frontier is still not a bubble decomposition. Cut an
// exact slice with gfatools when that is what is wanted.
const SUBGRAPH_CONTEXTS = [
  { value: '0', label: 'None' },
  { value: '1', label: '1 hop' },
  { value: '2', label: '2 hops' },
]

const SubgraphContextSelect = observer(function SubgraphContextSelect({
  model,
}: {
  model: LinearGraphCutModel
}) {
  const { classes } = useStyles()
  const adapter = model.sourceAdapter
  return adapter?.type === 'RgfaTabixAdapter' && !walkIndexed(adapter) ? (
    <div className={classes.section}>
      <LabelledSelect
        label="Graph context"
        sx={{ minWidth: 200 }}
        value={String(model.subgraphContext)}
        options={SUBGRAPH_CONTEXTS}
        testId="graph-context-select"
        onChange={hops => {
          model.setSubgraphContext(Number(hops))
          model.recut()
        }}
      />
      <Typography variant="caption" component="div" color="text.secondary">
        How far the cut follows links out of the region. At none, a detour that
        leaves the window draws as two stubs. No effect on gfa-to-tabix&apos;s
        default anchored index.
      </Typography>
    </div>
  ) : null
})

export default SubgraphContextSelect
