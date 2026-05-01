import { v4 as uuidv4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import { MenuItem, FormControl, Button, Select, Input, Checkbox, ListItemText, IconButton, List, ListItem, Tooltip, } from '@mui/material';
/**
 * An element representing an individual filter with a category and set of
 * applied values
 */
const Filter = observer((props) => {
    const { schema, filterModel, facets } = props;
    const [categoryValue, setCategoryValue] = useState(filterModel.category
        ? facets.find((f) => f.name === filterModel.category)
        : facets[0]);
    const [filterValue, setFilterValue] = useState(filterModel.filter ? filterModel.filter.split(',') : []);
    /**
     * Converts filter model objects to a GDC filter query and updates the track
     * @param {*} filters Array of filter model objects
     * @param {*} target Track target
     */
    function updateTrack(filters, target) {
        var _a;
        let gdcFilters = {
            op: 'and',
            content: [],
        };
        if (filters.length > 0) {
            for (const filter of filters) {
                if (filter.filter !== '') {
                    (_a = gdcFilters.content) === null || _a === void 0 ? void 0 : _a.push({
                        op: 'in',
                        content: {
                            field: `${filter.type}s.${filter.category}`,
                            value: filter.filter.split(','),
                        },
                    });
                }
            }
        }
        else {
            gdcFilters = {};
        }
        target.adapter.filters.set(JSON.stringify(gdcFilters));
    }
    const handleFilterDelete = () => {
        schema.deleteFilter(filterModel.id);
        updateTrack(schema.filters, schema.target);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(List, null,
            React.createElement(ListItem, { style: { gap: '4px' } },
                React.createElement(FormControl, { fullWidth: true, size: "small" },
                    React.createElement(Select, { labelId: "category-select-label", id: "category-select", value: categoryValue, onChange: event => {
                            setCategoryValue(event.target.value);
                            setFilterValue([]);
                            filterModel.setCategory(event.target.value.name);
                        }, label: "Category" }, facets.map((filterOption) => (React.createElement(MenuItem, { value: filterOption, key: filterOption.name }, filterOption.prettyName))))),
                React.createElement(FormControl, { fullWidth: true, size: "small" },
                    React.createElement(Select, { labelId: "demo-mutiple-checkbox-label", id: "demo-mutiple-checkbox", multiple: true, value: filterValue, onChange: event => {
                            setFilterValue(event.target.value);
                            filterModel.setFilter(event.target.value.join(','));
                            updateTrack(schema.filters, schema.target);
                        }, input: React.createElement(Input, null), displayEmpty: true, renderValue: selected => {
                            if (selected.length === 0) {
                                return React.createElement("em", null, "Filters");
                            }
                            return selected.join(', ');
                        } },
                        React.createElement(MenuItem, { disabled: true, value: "" },
                            React.createElement("em", null, "Filters")),
                        categoryValue.values.map((name) => (React.createElement(MenuItem, { key: name, value: name },
                            React.createElement(Checkbox, { checked: filterValue.includes(name) }),
                            React.createElement(ListItemText, { primary: name })))))),
                React.createElement(Tooltip, { title: "Remove filter", "aria-label": "remove", placement: "bottom" },
                    React.createElement(IconButton, { "aria-label": "remove filter", onClick: handleFilterDelete },
                        React.createElement(ClearIcon, null)))))));
});
/**
 * A collection of filters along with a button to add new filters
 */
const FilterList = observer(({ schema, type, facets }) => {
    const initialFilterSelection = facets[0].name;
    const handleClick = () => {
        schema.addFilter(uuidv4(), initialFilterSelection, type, '');
    };
    return (React.createElement(React.Fragment, null,
        schema.filters.map((filterModel) => {
            if (filterModel.type === type) {
                return (React.createElement(Filter, { schema: schema, filterModel, key: filterModel.id, facets: facets }));
            }
            return null;
        }),
        React.createElement(Button, { variant: "outlined", onClick: handleClick, startIcon: React.createElement(AddIcon, null) }, "Add Filter")));
});
export default FilterList;
//# sourceMappingURL=Filters.js.map