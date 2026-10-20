import { getSession } from '@jbrowse/core/util'
import { isAlive, types } from '@jbrowse/mobx-state-tree'
import { makeCoordinateMapper } from 'p2s_mapper'

import { linkageGenomeMapping, resolveLinkageAlignment } from './linkage'
import { sessionLinkageHost } from './sessionLinkageHost'

import type { Protein1DLinkage } from './linkage'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { PluggableElementType } from '@jbrowse/core/pluggableElementTypes'
import type ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import type { IAnyModelType, IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'
import type { PairwiseAlignment } from 'p2s_mapper'

export type { Protein1DLinkage } from './linkage'
export {
  findProteinLinkedViews,
  genomeHighlightsForUniProtPosition,
  getProteinLinkage,
  hovered1DProteinPosition,
} from './linkage'

function isLinearGenomeView(elt: { name: string }): elt is ViewType {
  return elt.name === 'LinearGenomeView'
}

type Linked = IAnyStateTreeNode & {
  proteinLinkage?: Protein1DLinkage
  proteinLinkageAlignment?: PairwiseAlignment
}

/**
 * Gives every LinearGenomeView an optional `proteinLinkage` property, set on
 * the 1D protein-annotation view when it is launched from a transcript. Living
 * on the view means it is serialized with the session and dies with the view.
 * The transcript's genome mapping is a computed beside it, so the hover
 * bridges asking on every mouse move build it once. Its alignment to the
 * UniProt entry is worked out each time the view attaches and never saved.
 */
export function withProteinLinkage(stateModel: IAnyModelType) {
  return stateModel
    .props({
      proteinLinkage: types.maybe(types.frozen<Protein1DLinkage>()),
    })
    .volatile(() => ({
      proteinLinkageAlignment: undefined as PairwiseAlignment | undefined,
    }))
    .views((self: Linked) => ({
      get proteinLinkageMapping() {
        return self.proteinLinkage
          ? linkageGenomeMapping(self.proteinLinkage)
          : undefined
      },
      get proteinLinkageCoordinates() {
        return self.proteinLinkageAlignment
          ? makeCoordinateMapper(self.proteinLinkageAlignment)
          : undefined
      },
    }))
    .actions((self: Linked) => ({
      setProteinLinkageAlignment(alignment?: PairwiseAlignment) {
        self.proteinLinkageAlignment = alignment
      },
    }))
    .actions(
      (
        self: Linked & {
          setProteinLinkageAlignment: (alignment?: PairwiseAlignment) => void
        },
      ) => ({
        afterAttach() {
          const linkage = self.proteinLinkage
          if (linkage) {
            const session = getSession(self)
            const unlinked = (why: string) => {
              session.notify(
                `The protein view of ${linkage.uniprotId} is not linked to the genome: ${why}`,
                'warning',
              )
            }
            resolveLinkageAlignment(sessionLinkageHost(session, linkage)).then(
              result => {
                if (isAlive(self)) {
                  if ('alignment' in result) {
                    self.setProteinLinkageAlignment(result.alignment)
                  } else {
                    unlinked(result.problem)
                  }
                }
              },
              (e: unknown) => {
                if (isAlive(self)) {
                  console.error(e)
                  unlinked(`${e}`)
                }
              },
            )
          }
        },
      }),
    )
}

export default function Protein1DLinkageF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-extendPluggableElement',
    (elt: PluggableElementType) => {
      if (isLinearGenomeView(elt)) {
        elt.extendStateModel(withProteinLinkage)
      }
      return elt
    },
  )
}
