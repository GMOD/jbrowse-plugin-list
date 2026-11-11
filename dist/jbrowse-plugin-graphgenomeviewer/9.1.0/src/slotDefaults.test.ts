import { GBZ_CUT_DEFAULTS as gbzCutDefaults } from '@jbrowse/bandage-core/gbzWindow'
import { WALK_BUDGETS as walkBudgets } from '@jbrowse/graph-walks'

import { GBZ_CUT_DEFAULTS, WALK_BUDGETS } from './slotDefaults.ts'

test('walk budgets match @jbrowse/graph-walks', () => {
  expect(walkBudgets).toMatchObject(WALK_BUDGETS)
})

test('gbz cut defaults match @jbrowse/bandage-core', () => {
  expect(gbzCutDefaults).toEqual(GBZ_CUT_DEFAULTS)
})
