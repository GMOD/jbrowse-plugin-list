import { ElementId } from '@jbrowse/core/util/types/mst'
import PluginManager from '@jbrowse/core/PluginManager'
import { types } from 'mobx-state-tree'

export default (pluginManager: PluginManager) => {
  const Filter = types
    .model({
      id: types.identifier,
      category: types.string, // facet name, 'category'
      type: types.string, // donors, genes, or mutations
      filter: types.string,
    })
    .actions(self => ({
      setCategory(newCategory: string) {
        self.category = newCategory
        self.filter = ''
      },
      setFilter(newFilter: string) {
        self.filter = newFilter
      },
      getFilter() {
        return self.filter
      },
    }))

  const ColourBy = types.model({
    id: types.identifier,
    value: types.string,
  })
  return types
    .model('ICGCFilterWidget', {
      id: ElementId,
      type: types.literal('ICGCFilterWidget'),
      target: types.safeReference(
        pluginManager.pluggableConfigSchemaType('track'),
      ),
      filters: types.array(Filter),
      colourBy: types.map(ColourBy),
    })
    .actions(self => ({
      setTarget(newTarget: any) {
        self.target = newTarget
      },
      addFilter(id: any, category: string, type: string, filter: string) {
        self.filters.push(Filter.create({ id, category, type, filter }))
      },
      deleteFilter(id: any) {
        const pos = self.filters.findIndex(filter => filter.id === id)
        self.filters.remove(self.filters[pos])
      },
      getFiltersByType(type: string) {
        return self.filters.filter(filter => {
          return filter.type === type
        })
      },

      clearFilters() {
        // @ts-ignore
        self.filters = self.filters.filter(filter => {
          return filter.filter.length === 0
        })
      },
    }))
}
