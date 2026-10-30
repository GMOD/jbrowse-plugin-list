import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { types } from '@jbrowse/mobx-state-tree'

import { facetOf, metadataColumns } from '../sampleMetadata'

import type { Facet, SampleRow } from '../sampleMetadata'
import type { TandemRepeat } from '../tandemRepeat'
import type { MenuItem } from '@jbrowse/core/ui'
import type { Instance } from '@jbrowse/mobx-state-tree'

// The record's alleles and its samples' metadata live in the snapshot, so a
// saved or shared session draws without the track it was launched from
export default function stateModelFactory() {
  return types
    .compose(
      'TandemRepeatView',
      BaseViewModel,
      types.model({
        type: types.literal('TandemRepeatView'),
        repeat: types.maybe(types.frozen<TandemRepeat>()),
        samples: types.maybe(types.frozen<SampleRow[]>()),
        facet: types.maybe(
          types.snapshotProcessor(types.frozen<Facet | undefined>(), {
            preProcessor: (snap: unknown) => facetOf(snap),
          }),
        ),
      }),
    )
    .actions(self => ({
      setFacet(facet?: Facet) {
        self.facet = facet
      },
    }))
    .views(self => ({
      menuItems(): MenuItem[] {
        return [
          {
            label: 'Group by…',
            type: 'subMenu',
            subMenu: [
              {
                label: 'None',
                type: 'radio',
                checked: !self.facet,
                onClick: () => {
                  self.setFacet(undefined)
                },
              },
              ...metadataColumns(self.samples).map(field => ({
                label: field,
                type: 'radio' as const,
                checked: self.facet?.field === field,
                onClick: () => {
                  self.setFacet({ field })
                },
              })),
            ],
          },
        ]
      },
    }))
}

export type TandemRepeatViewModel = Instance<
  ReturnType<typeof stateModelFactory>
>
