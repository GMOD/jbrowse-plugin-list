import React, { useState } from 'react';
import { Dialog, ErrorMessage } from '@jbrowse/core/ui';
import { getSession } from '@jbrowse/core/util';
import { Button, DialogActions, DialogContent, FormControl, InputLabel, MenuItem, Select, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { getProteinViews } from '../structureConnection';
const useStyles = makeStyles()(theme => ({
    formControl: {
        marginBottom: theme.spacing(2),
    },
}));
const ConnectStructureDialog = observer(function ConnectStructureDialog({ model, handleClose, }) {
    const { classes } = useStyles();
    const session = getSession(model);
    const [selectedViewId, setSelectedViewId] = useState('');
    const [selectedStructureIdx, setSelectedStructureIdx] = useState(0);
    const [selectedMsaRow, setSelectedMsaRow] = useState(model.querySeqName);
    const [error, setError] = useState();
    const proteinViews = getProteinViews(session.views);
    const selectedView = proteinViews.find(v => v.id === selectedViewId);
    const structures = selectedView?.structures ?? [];
    const msaRowNames = model.rows.map(r => r[0]);
    const handleConnect = () => {
        if (!selectedViewId) {
            setError('Please select a protein view');
            return;
        }
        try {
            model.connectToStructure(selectedViewId, selectedStructureIdx, selectedMsaRow);
            handleClose();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    };
    return (React.createElement(Dialog, { maxWidth: "sm", title: "Connect to Protein Structure", open: true, onClose: handleClose },
        React.createElement(DialogContent, null, proteinViews.length === 0 ? (React.createElement(Typography, { color: "textSecondary" }, "No protein views are currently open. Please open a protein structure view first.")) : (React.createElement(React.Fragment, null,
            React.createElement(FormControl, { fullWidth: true, className: classes.formControl },
                React.createElement(InputLabel, null, "Protein View"),
                React.createElement(Select, { value: selectedViewId, label: "Protein View", onChange: e => {
                        setSelectedViewId(e.target.value);
                        setSelectedStructureIdx(0);
                    } }, proteinViews.map(view => (React.createElement(MenuItem, { key: view.id, value: view.id }, view.displayName ?? `ProteinView ${view.id}`))))),
            structures.length > 1 ? (React.createElement(FormControl, { fullWidth: true, className: classes.formControl },
                React.createElement(InputLabel, null, "Structure"),
                React.createElement(Select, { value: selectedStructureIdx, label: "Structure", onChange: e => {
                        setSelectedStructureIdx(e.target.value);
                    } }, structures.map((structure, idx) => (React.createElement(MenuItem, { key: idx, value: idx }, structure.url ?? `Structure ${idx + 1}`)))))) : null,
            React.createElement(FormControl, { fullWidth: true, className: classes.formControl },
                React.createElement(InputLabel, null, "MSA Row"),
                React.createElement(Select, { value: selectedMsaRow, label: "MSA Row", onChange: e => {
                        setSelectedMsaRow(e.target.value);
                    } }, msaRowNames.map(name => (React.createElement(MenuItem, { key: name, value: name }, name))))),
            error ? React.createElement(ErrorMessage, { error: error }) : null))),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: handleClose }, "Cancel"),
            React.createElement(Button, { onClick: handleConnect, variant: "contained", disabled: proteinViews.length === 0 || !selectedViewId }, "Connect"))));
});
export default ConnectStructureDialog;
//# sourceMappingURL=ConnectStructureDialog.js.map