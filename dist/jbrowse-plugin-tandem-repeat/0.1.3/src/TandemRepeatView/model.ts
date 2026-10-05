import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { types } from '@jbrowse/mobx-state-tree'

import type { TandemRepeat } from '../tandemRepeat'
import type { Instance } from '@jbrowse/mobx-state-tree'

// The record's alleles live in the snapshot, so a saved or shared session
// draws without the track it was launched from
export default function stateModelFactory() {
  return types.compose(
    'TandemRepeatView',
    BaseViewModel,
    types.model({
      type: types.literal('TandemRepeatView'),
      repeat: types.maybe(types.frozen<TandemRepeat>()),
    }),
  )
}

export type TandemRepeatViewModel = Instance<
  ReturnType<typeof stateModelFactory>
>
