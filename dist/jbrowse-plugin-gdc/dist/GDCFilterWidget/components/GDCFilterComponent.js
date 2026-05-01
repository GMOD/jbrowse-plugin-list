import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FilterList from './Filters';
import HighlightFeature from './ColourFeatures';
import TrackType from './TrackType';
import { ssmFacets, geneFacets, caseFacets } from './Utility';
import { Alert, Typography, Tooltip, Paper, Grid, Box, Tabs, Tab, IconButton, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import UndoIcon from '@mui/icons-material/Undo';
import { observer } from 'mobx-react';
const useStyles = makeStyles()(theme => ({
    root: {
        margin: theme.spacing(1),
    },
    paper: {
        padding: theme.spacing(2),
    },
    tabRoot: {
        width: '33%',
        minWidth: '100px',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 150,
    },
    filterCard: {
        margin: theme.spacing(1),
    },
    text: {
        display: 'flex',
        alignItems: 'center',
    },
}));
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (React.createElement("div", { role: "tabpanel", hidden: value !== index, id: `simple-tabpanel-${index}`, "aria-labelledby": `simple-tab-${index}`, ...other }, value === index && React.createElement(Box, { style: { padding: 3 } }, children)));
}
/**
 * Creates the form for interacting with the track filters
 */
const GDCQueryBuilder = observer(({ schema }) => {
    const [isValidGDCFilter, setIsValidGDCFilter] = useState(true);
    const [isValidColourBy, setIsValidColourBy] = useState(true);
    const [validationMessage, setFilterValidationMessage] = useState('');
    const [colourValidationMessage, setColourValidationMessage] = useState('');
    const [value, setValue] = useState(0);
    schema.clearFilters();
    useEffect(() => {
        try {
            const filters = JSON.parse(schema.target.adapter.filters.value);
            if (filters.content && filters.content.length > 0) {
                for (const filter of filters.content) {
                    let type;
                    if (filter.content.field.startsWith('cases.')) {
                        type = 'case';
                    }
                    else if (filter.content.field.startsWith('ssms.')) {
                        type = 'ssm';
                    }
                    else if (filter.content.field.startsWith('genes.')) {
                        type = 'gene';
                    }
                    else {
                        setIsValidGDCFilter(false);
                        setFilterValidationMessage(`The filter ${filter.content.field} is missing a type prefix and is invalid. Any changes on this panel will overwrite invalid filters.`);
                    }
                    if (type) {
                        const name = filter.content.field.replace(`${type}s.`, '');
                        schema.addFilter(uuidv4(), name, type, filter.content.value.join(','));
                    }
                }
            }
        }
        catch (error) {
            setIsValidGDCFilter(false);
            setFilterValidationMessage('The current filters are not in the expected format. Any changes on this panel will overwrite invalid filters.');
        }
    }, [schema, value, schema.target.adapter.featureType.value]);
    useEffect(() => {
        try {
            const colourBy = JSON.parse(schema.target.adapter.colourBy.value);
            const expectedAttributes = [
                'name',
                'type',
                'attributeName',
                'values',
                'description',
            ];
            let matchingKeys = true;
            expectedAttributes.forEach(key => {
                if (!(key in colourBy)) {
                    matchingKeys = false;
                }
            });
            if (matchingKeys || Object.keys(colourBy).length === 0) {
                schema.setColourBy(colourBy);
            }
            else {
                setIsValidColourBy(false);
                setColourValidationMessage('The current colour by option is not in the expected format. Any changes on this panel will overwrite the invalid selection.');
            }
        }
        catch (error) {
            setIsValidColourBy(false);
            setColourValidationMessage('The current colour by option is not in the expected format. Any changes on this panel will overwrite the invalid selection.');
        }
    }, [schema]);
    const { classes } = useStyles();
    return (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        !isValidGDCFilter && React.createElement(Alert, { severity: "info" }, validationMessage),
        React.createElement(TrackType, { schema: schema }),
        React.createElement(Paper, { className: classes.paper },
            React.createElement(Grid, { container: true, style: { gap: '4px' } },
                React.createElement(Typography, { variant: "h6" }, "Filters"),
                React.createElement(Tooltip, { title: "Clear all filters", "aria-label": "clear all filters", onClick: () => {
                        schema.clearFilters();
                        schema.target.adapter.filters.set('{}');
                    } },
                    React.createElement(IconButton, { size: "small", color: "primary", "data-testid": "clear_all_filters_icon_button" },
                        React.createElement(UndoIcon, null)))),
            React.createElement(Box, null,
                React.createElement(Tabs, { value: value, onChange: (_, val) => {
                        setValue(val);
                    }, "aria-label": "filtering tabs" },
                    React.createElement(Tab, { classes: { root: classes.tabRoot }, label: "Cases" }),
                    React.createElement(Tab, { classes: { root: classes.tabRoot }, label: "Genes" }),
                    React.createElement(Tab, { classes: { root: classes.tabRoot }, label: "Mutations" }))),
            React.createElement(TabPanel, { value: value, index: 0 },
                React.createElement(FilterList, { schema: schema, type: "case", facets: caseFacets })),
            React.createElement(TabPanel, { value: value, index: 1 },
                React.createElement(FilterList, { schema: schema, type: "gene", facets: geneFacets })),
            React.createElement(TabPanel, { value: value, index: 2 },
                React.createElement(FilterList, { schema: schema, type: "ssm", facets: ssmFacets }))),
        !isValidColourBy && (React.createElement(Alert, { severity: "info" }, colourValidationMessage)),
        schema.target.adapter.featureType.value === 'mutation' && (React.createElement(HighlightFeature, { schema: schema, type: "mutation" })),
        schema.target.adapter.featureType.value === 'gene' && (React.createElement(HighlightFeature, { schema: schema, type: "gene" }))));
});
const ConfigurationEditor = observer(({ model }) => {
    const { classes } = useStyles();
    return (React.createElement("div", { className: classes.root, "data-testid": "configEditor" }, !model.target ? ('no target set') : (React.createElement(GDCQueryBuilder, { schema: model, key: "configEditor" }))));
});
export default ConfigurationEditor;
//# sourceMappingURL=GDCFilterComponent.js.map