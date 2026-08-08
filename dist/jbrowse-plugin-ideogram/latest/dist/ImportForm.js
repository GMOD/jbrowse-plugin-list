import React, { Suspense, useState } from 'react';
import { AssemblySelector, FileSelector } from '@jbrowse/core/ui';
import { getSession } from '@jbrowse/core/util';
import HelpIcon from '@mui/icons-material/Help';
import { Button, Checkbox, Container, Divider, FormControlLabel, Grid, IconButton, MenuItem, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { v4 as uuidv4 } from 'uuid';
import HelpDialog from './HelpDialog';
import { populateAnnotations, regions } from './util';
const useStyles = makeStyles()(theme => ({
    importFormContainer: {
        padding: theme.spacing(2),
    },
    button: {
        margin: theme.spacing(2),
    },
    importFormEntry: {
        minWidth: 180,
    },
    closeButton: {
        position: 'absolute',
        right: '4px',
        top: '4px',
    },
}));
const RegionSelector = observer(({ onChange, selected, }) => {
    const { classes } = useStyles();
    const error = regions.length ? '' : 'No configured regions';
    return (React.createElement(TextField, { select: true, label: "Region", variant: "outlined", margin: "normal", helperText: error || 'Select a region to view', value: error ? '' : selected, inputProps: { 'data-testid': 'region-selector' }, onChange: event => { onChange(event.target.value); }, error: !!error, disabled: !!error, className: classes.importFormEntry }, regions.map(name => {
        return (React.createElement(MenuItem, { key: name, value: name }, name));
    })));
});
/**
 * Most layout and logic retrieved from the '@jbrowse/plugin/linear-genome-view/../ImportForm.tsx' component and modified for
 * the purposes of this component
 */
const ImportForm = observer(({ model }) => {
    var _a;
    const { classes } = useStyles();
    const session = getSession(model);
    const { assemblyNames } = session;
    const [selectedAsm, setSelectedAsm] = useState((_a = assemblyNames[0]) !== null && _a !== void 0 ? _a : '');
    const [selectedRegion, setSelectedRegion] = useState(regions[0]);
    const [checked, setChecked] = useState(model.withReactome);
    const [isHelpDialogDisplayed, setHelpDialogDisplayed] = useState(false);
    async function handleOpen(assembly, region) {
        model.setAssembly(assembly);
        model.setRegion(region);
        model.setOrientation('horizontal');
        model.setAllRegions(false);
        model.setShowImportForm(false);
        model.setIdeogramId(uuidv4());
        await populateAnnotations(model);
        model.setShowLoading(false);
    }
    async function handleOpenAllRegions(assembly) {
        model.setAllRegions(true);
        model.setAssembly(assembly);
        model.setIdeogramId(uuidv4());
        await populateAnnotations(model);
        model.setShowImportForm(false);
        model.setShowLoading(false);
    }
    const handleReactomeAnalysis = (event) => {
        setChecked(event === null || event === void 0 ? void 0 : event.target.checked);
        model.setWithReactome(event === null || event === void 0 ? void 0 : event.target.checked);
    };
    return (React.createElement("div", null,
        React.createElement(Container, { className: classes.importFormContainer },
            React.createElement(Grid, { container: true, spacing: 1, justifyContent: "center", alignItems: "center" },
                React.createElement(Grid, null,
                    React.createElement(AssemblySelector, { onChange: val => {
                            setSelectedAsm(val);
                        }, session: session, selected: selectedAsm })),
                React.createElement(Grid, null,
                    React.createElement(RegionSelector, { onChange: val => {
                            setSelectedRegion(val);
                        }, selected: selectedRegion })),
                React.createElement(Grid, null,
                    React.createElement(Button, { type: "submit", disabled: !selectedRegion, className: classes.button, onClick: () => {
                            if (selectedRegion) {
                                void handleOpen(selectedAsm, selectedRegion);
                            }
                        }, variant: "contained", color: "primary" }, "Open"),
                    React.createElement(Button, { disabled: !selectedRegion, className: classes.button, onClick: () => {
                            void handleOpenAllRegions(selectedAsm);
                        }, variant: "contained", color: "secondary" }, "Show all regions in assembly")))),
        React.createElement(Divider, null),
        React.createElement(Container, { className: classes.importFormContainer },
            React.createElement(Grid, { container: true, spacing: 1, justifyContent: "center", alignItems: "center", direction: "column" },
                React.createElement(Typography, { variant: "body2" },
                    React.createElement("b", null, "Optional:"),
                    " provide a .tsv file of gene annotations for the ideogram.",
                    React.createElement(IconButton, { onClick: () => { setHelpDialogDisplayed(true); } },
                        React.createElement(HelpIcon, null))),
                React.createElement(Grid, null,
                    React.createElement(FileSelector, { name: "Annotations file", location: model.annotationsLocation, setLocation: loc => model.setAnnotationsLocation(loc) })),
                React.createElement(Grid, null,
                    React.createElement(FormControlLabel, { label: "Analyze annotations with Reactome", control: React.createElement(Checkbox, { checked: checked, color: "primary", onChange: handleReactomeAnalysis }) })))),
        isHelpDialogDisplayed ? (React.createElement(Suspense, { fallback: React.createElement("div", null) },
            React.createElement(HelpDialog, { handleClose: () => { setHelpDialogDisplayed(false); } }))) : null));
});
export default ImportForm;
//# sourceMappingURL=ImportForm.js.map