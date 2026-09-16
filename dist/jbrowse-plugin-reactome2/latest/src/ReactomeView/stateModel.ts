import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { types } from '@jbrowse/mobx-state-tree'

import type { Pathway } from './reactomeApi'
import type { Instance } from '@jbrowse/mobx-state-tree'

// BaseViewModel is read off the host, so the view carries whatever members the
// host's view container calls on it
const stateModel = types
  .compose(
    'ReactomeView',
    BaseViewModel,
    types.model({
      type: types.literal('ReactomeView'),
      selectedPathway: types.maybe(types.string),
      gene: types.maybe(types.string),
      message: 'No pathways are currently displayed.',
    }),
  )
  .volatile(() => ({
    pathways: undefined as Pathway[] | undefined,
  }))
  .actions(self => ({
    setMessage(message: string) {
      self.message = message
    },
    setSearchResult(gene: string, pathways: Pathway[]) {
      self.gene = gene
      self.pathways = pathways
      // the most specific pathway: DiagramJs draws a high-level one blank
      self.selectedPathway = (pathways.find(p => p.leaf) ?? pathways[0])?.stId
      self.message = pathways.length
        ? `Pathways relating to ${gene} are being displayed. Click on a pathway to display it in the Reactome diagram viewer.`
        : `No pathways could be retrieved for ${gene}.`
    },
    selectPathway({ stId, name }: Pathway) {
      self.selectedPathway = stId
      self.message = `Pathways relating to ${self.gene} are being displayed. "${name}" has been selected.`
    },
  }))

export type ReactomeViewModel = Instance<typeof stateModel>

export default stateModel
