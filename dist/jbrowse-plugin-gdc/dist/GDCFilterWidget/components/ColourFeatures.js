import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { Typography, MenuItem, FormControl, Select, Table, TableBody, TableCell, TableHead, TableRow, Paper, FormHelperText, InputLabel, Chip, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { mutationHighlightFeatures, geneHighlightFeatures } from './Utility';
const useStyles = makeStyles()(theme => ({
    root: {
        padding: theme.spacing(1, 3, 1, 1),
        background: theme.palette.background.default,
        overflowX: 'hidden',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 150,
    },
    text: {
        display: 'flex',
        alignItems: 'center',
    },
    paper: {
        padding: theme.spacing(2),
    },
}));
/**
 * Render a highlight/colour by element for colouring features
 */
const HighlightFeature = observer(({ schema, type }) => {
    var _a, _b, _c, _d;
    const { classes } = useStyles();
    const [colourBy, setColourBy] = useState(Object.keys(schema.getColourBy()).length !== 0
        ? JSON.parse(schema.getColourBy())
        : '');
    const highlightFeatures = type === 'mutation' ? mutationHighlightFeatures : geneHighlightFeatures;
    return (React.createElement(React.Fragment, null,
        React.createElement(Paper, { className: classes.paper },
            React.createElement(Typography, { variant: "h6" }, "Colour Features"),
            React.createElement(FormControl, { size: "small" },
                React.createElement(InputLabel, null, "Attribute"),
                React.createElement(Select, { labelId: "track-type-select-label", id: "track-type-select", value: colourBy, onChange: event => {
                        const hlBy = event.target.value;
                        setColourBy(hlBy);
                        let colourFunction = '';
                        if (hlBy.type === 'threshold') {
                            colourFunction = `jexl:get(feature,'${hlBy.attributeName}') >= ${hlBy.values[0].threshold} ? '${hlBy.values[0].colour1}' : '${hlBy.values[0].colour2}'`;
                        }
                        else if (hlBy.type === 'category') {
                            colourFunction = `jexl:switch(feature,'${JSON.stringify(hlBy)}')`;
                        }
                        else if (hlBy.type === 'boolean') {
                            colourFunction = `jexl:cancer(feature,'${hlBy.attributeName}')`;
                        }
                        else if (hlBy.type === 'percentage') {
                            colourFunction = `jexl:rgb(feature,'${hlBy.attributeName}')`;
                        }
                        else {
                            colourFunction = `jexl:cast('goldenrod')`;
                        }
                        // Set to function
                        schema.target.displays[0].renderer.color1.set(colourFunction);
                        // Set to colour array element
                        schema.setColourBy(JSON.stringify(hlBy));
                        schema.target.adapter.colourBy.set(JSON.stringify(hlBy));
                    }, renderValue: selected => selected.name }, highlightFeatures.map(element => (React.createElement(MenuItem, { value: element.name, key: element.name }, element.name)))),
                React.createElement(FormHelperText, null, "Select how to colour features on the track based on feature attributes.")),
            (colourBy === null || colourBy === void 0 ? void 0 : colourBy.values) && (React.createElement("div", null,
                React.createElement(Typography, { variant: "subtitle2", className: classes.text }, colourBy.symbol),
                colourBy.values && colourBy.type === 'category' && (React.createElement(Table, null,
                    React.createElement(TableHead, null,
                        React.createElement(TableRow, null,
                            React.createElement(TableCell, null, "Value"),
                            React.createElement(TableCell, null, "Corresponding colour"))),
                    React.createElement(TableBody, null, (_a = colourBy.values) === null || _a === void 0 ? void 0 : _a.map((value) => (React.createElement(TableRow, { key: value.name },
                        React.createElement(TableCell, null, value.name !== '' ? value.name : 'n/a'),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour, style: {
                                    backgroundColor: value.colour,
                                    color: 'white',
                                } })))))))),
                colourBy.values && colourBy.type === 'threshold' && (React.createElement(Table, null,
                    React.createElement(TableHead, null,
                        React.createElement(TableRow, null,
                            React.createElement(TableCell, null, "Value"),
                            React.createElement(TableCell, null, "Threshold"),
                            React.createElement(TableCell, null, "Below"),
                            React.createElement(TableCell, null, "Equal or Above"))),
                    React.createElement(TableBody, null, (_b = colourBy.values) === null || _b === void 0 ? void 0 : _b.map((value) => (React.createElement(TableRow, { key: value.name },
                        React.createElement(TableCell, null, value.name !== '' ? value.name : 'n/a'),
                        React.createElement(TableCell, null, value.threshold),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour2, style: {
                                    backgroundColor: value.colour2,
                                    color: 'white',
                                } })),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour1, style: {
                                    backgroundColor: value.colour1,
                                    color: 'white',
                                } })))))))),
                colourBy.values && colourBy.type === 'boolean' && (React.createElement(Table, null,
                    React.createElement(TableHead, null,
                        React.createElement(TableRow, null,
                            React.createElement(TableCell, null, "Value"),
                            React.createElement(TableCell, null, "True"),
                            React.createElement(TableCell, null, "False"))),
                    React.createElement(TableBody, null, (_c = colourBy.values) === null || _c === void 0 ? void 0 : _c.map((value) => (React.createElement(TableRow, { key: value.name },
                        React.createElement(TableCell, null, value.name !== '' ? value.name : 'n/a'),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour1, style: {
                                    backgroundColor: value.colour1,
                                    color: 'white',
                                } })),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour2, style: {
                                    backgroundColor: value.colour2,
                                    color: 'white',
                                } })))))))),
                colourBy.values && colourBy.type === 'percentage' && (React.createElement(Table, null,
                    React.createElement(TableHead, null,
                        React.createElement(TableRow, null,
                            React.createElement(TableCell, null, "Value"),
                            React.createElement(TableCell, null, "Low"),
                            React.createElement(TableCell, null, "High"))),
                    React.createElement(TableBody, null, (_d = colourBy.values) === null || _d === void 0 ? void 0 : _d.map((value) => (React.createElement(TableRow, { key: value.name },
                        React.createElement(TableCell, null, value.name !== '' ? value.name : 'n/a'),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour1, style: {
                                    backgroundColor: value.colour1,
                                    color: 'white',
                                } })),
                        React.createElement(TableCell, null,
                            React.createElement(Chip, { label: value.colour2, style: {
                                    backgroundColor: value.colour2,
                                    color: 'white',
                                } })))))))))))));
});
export default HighlightFeature;
//# sourceMappingURL=ColourFeatures.js.map