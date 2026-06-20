import { ElementId } from '@jbrowse/core/util/types/mst';
import { types } from '@jbrowse/mobx-state-tree';
const Filter = types
    .model({
    id: types.identifier,
    category: types.string,
    type: types.string,
    filter: types.string,
})
    .actions(self => ({
    setCategory(newCategory) {
        self.category = newCategory;
        self.filter = '';
    },
    setFilter(newFilter) {
        self.filter = newFilter;
    },
}));
const ColourBy = types.model({
    id: types.identifier,
    value: types.string,
});
export default function f(jbrowse) {
    return types
        .model('GDCFilterWidget', {
        id: ElementId,
        type: types.literal('GDCFilterWidget'),
        target: types.safeReference(jbrowse.pluggableConfigSchemaType('track')),
        filters: types.array(Filter),
        colourBy: types.map(ColourBy),
    })
        .actions(self => ({
        setTarget(newTarget) {
            self.target = newTarget;
        },
        addFilter(id, category, type, filter) {
            self.filters.push(Filter.create({ id, category, type, filter }));
        },
        deleteFilter(id) {
            const pos = self.filters.findIndex(filter => filter.id === id);
            const item = self.filters[pos];
            if (item !== undefined) {
                self.filters.remove(item);
            }
        },
        getFiltersByType(type) {
            return self.filters.filter(filter => filter.type === type);
        },
        clearFilters() {
            // Keep filters that have been added but not set
            self.filters.replace(self.filters.filter(f => f.filter.length === 0));
        },
        setColourBy(newColourBy) {
            self.colourBy.set('0', newColourBy);
        },
        getColourBy() {
            var _a;
            return (_a = self.colourBy.get('0')) !== null && _a !== void 0 ? _a : {};
        },
    }));
}
//# sourceMappingURL=model.js.map