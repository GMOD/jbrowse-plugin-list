import { types } from 'mobx-state-tree'

const stateModel = types
  .model({
    type: types.literal('ReactomeView'),
    displayName: types.maybe(types.string),
    selectedPathway: types.maybe(types.string),
    gene: types.maybe(types.string),
    message: 'No pathways are currently displayed.',
  })
  .volatile(() => ({
    pathways: undefined as unknown as object,
  }))
  .actions((self) => ({
    // unused but required by your view
    setWidth() {},
    setDisplayName(str: string) {
      self.displayName = str
    },
    setPathways(pathways: any) {
      self.pathways = pathways
    },
    setSelectedPathway(str: string) {
      self.selectedPathway = str
    },
    setGene(str: string) {
      self.gene = str
    },
    setMessage(str: string) {
      self.message = str
    },
  }))

export default stateModel
