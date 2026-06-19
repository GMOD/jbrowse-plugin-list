import React from 'react';
import { observer } from 'mobx-react';
import { Typography, MenuItem, FormControl, FormHelperText, Select, Paper, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    paper: {
        padding: theme.spacing(2),
    },
}));
/**
 * A component for changing the track type
 */
export default observer((schema) => {
    const { classes } = useStyles();
    const [trackType, setTrackType] = React.useState(schema.schema.target.adapter.featureType.value);
    return (React.createElement("div", { className: classes.root },
        React.createElement(Paper, { className: classes.paper },
            React.createElement(Typography, { variant: "h6" }, "Track Type"),
            React.createElement(FormControl, { size: "small" },
                React.createElement(Select, { labelId: "track-type-select-label", id: "track-type-select", value: trackType, onChange: event => {
                        setTrackType(event.target.value);
                        schema.schema.target.adapter.featureType.set(event.target.value);
                        // Set to function
                        schema.schema.target.displays[0].renderer.color1.set(`jexl:cast('goldenrod')`);
                        // Set to colour array element
                        schema.schema.setColourBy('{}');
                        schema.schema.target.adapter.colourBy.set('{}');
                    } },
                    React.createElement(MenuItem, { value: "mutation" }, "Mutation"),
                    React.createElement(MenuItem, { value: "gene" }, "Gene")),
                React.createElement(FormHelperText, null, "Select what to retrieve from the GDC with your selected filters.")))));
});
//# sourceMappingURL=TrackType.js.map