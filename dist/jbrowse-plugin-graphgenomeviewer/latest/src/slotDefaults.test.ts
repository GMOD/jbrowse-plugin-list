import { WALK_BUDGETS as walkBudgets } from '@gmod/gfa-tabix'
import { GBZ_CUT_DEFAULTS as gbzCutDefaults } from '@jbrowse/bandage-core/gbzWindow'

import { GBZ_CUT_DEFAULTS, WALK_BUDGETS } from './slotDefaults.ts'

test('walk budgets match @gmod/gfa-tabix', () => {
  expect(walkBudgets).toMatchObject(WALK_BUDGETS)
})

test('gbz cut defaults match @jbrowse/bandage-core', () => {
  expect(gbzCutDefaults).toEqual(GBZ_CUT_DEFAULTS)
})
