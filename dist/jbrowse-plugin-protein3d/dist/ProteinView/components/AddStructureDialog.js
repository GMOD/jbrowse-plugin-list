import React, { useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { getAlphaFoldStructureUrl, getPdbStructureUrl, } from '../../LaunchProteinView/utils/launchViewUtils';
const AddStructureDialog = observer(function AddStructureDialog({ model, }) {
    const [file, setFile] = useState();
    const [pdbId, setPdbId] = useState('');
    const [uniprotId, setUniprotId] = useState('');
    const [choice, setChoice] = useState('pdb');
    const [structureURL, setStructureURL] = useState('');
    const [error, setError] = useState();
    const { showAddStructureDialog } = model;
    const handleClose = () => {
        setFile(undefined);
        setPdbId('');
        setUniprotId('');
        setStructureURL('');
        setError(undefined);
        model.setShowAddStructureDialog(false);
    };
    const handleAdd = async () => {
        try {
            let url = structureURL;
            let data;
            if (choice === 'pdb' && pdbId) {
                url = getPdbStructureUrl(pdbId);
            }
            if (choice === 'uniprot' && uniprotId) {
                url = getAlphaFoldStructureUrl(uniprotId.toUpperCase());
            }
            if (choice === 'file' && file) {
                data = await file.text();
            }
            if (url || data) {
                await model.addStructureAndSuperpose({ url: url || undefined, data });
                handleClose();
            }
        }
        catch (e) {
            console.error(e);
            setError(e);
        }
    };
    if (!showAddStructureDialog) {
        return null;
    }
    const canAdd = (choice === 'url' && structureURL !== '') ||
        (choice === 'file' && file !== undefined) ||
        (choice === 'pdb' && pdbId !== '') ||
        (choice === 'uniprot' && uniprotId !== '');
    return (React.createElement(Dialog, { open: true, onClose: handleClose, maxWidth: "sm", fullWidth: true },
        React.createElement(DialogTitle, null, "Add Structure"),
        React.createElement(DialogContent, null,
            error ? React.createElement(ErrorMessage, { error: error }) : null,
            React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Add another structure to superpose on the existing structure(s)."),
            React.createElement(FormControl, { component: "fieldset", sx: { mb: 2 } },
                React.createElement(RadioGroup, { value: choice, onChange: event => {
                        setChoice(event.target.value);
                    } },
                    React.createElement(FormControlLabel, { value: "pdb", control: React.createElement(Radio, null), label: "PDB ID" }),
                    React.createElement(FormControlLabel, { value: "uniprot", control: React.createElement(Radio, null), label: "UniProt ID (AlphaFold)" }),
                    React.createElement(FormControlLabel, { value: "url", control: React.createElement(Radio, null), label: "URL" }),
                    React.createElement(FormControlLabel, { value: "file", control: React.createElement(Radio, null), label: "File" }))),
            choice === 'pdb' ? (React.createElement(TextField, { fullWidth: true, value: pdbId, onChange: event => {
                    setPdbId(event.target.value.toUpperCase());
                }, label: "PDB ID (e.g. 1CRN)", placeholder: "Enter PDB ID", sx: { mb: 2 } })) : null,
            choice === 'uniprot' ? (React.createElement(TextField, { fullWidth: true, value: uniprotId, onChange: event => {
                    setUniprotId(event.target.value.toUpperCase());
                }, label: "UniProt ID (e.g. P04637)", placeholder: "Enter UniProt ID", helperText: "Will fetch the AlphaFold v6 predicted structure", sx: { mb: 2 } })) : null,
            choice === 'url' ? (React.createElement(TextField, { fullWidth: true, label: "Structure URL", value: structureURL, onChange: event => {
                    setStructureURL(event.target.value);
                }, placeholder: "https://files.rcsb.org/download/1CRN.cif", sx: { mb: 2 } })) : null,
            choice === 'file' ? (React.createElement("div", { style: { marginBottom: 16 } },
                React.createElement(Button, { variant: "outlined", component: "label" },
                    file ? file.name : 'Choose File',
                    React.createElement("input", { type: "file", hidden: true, accept: ".pdb,.cif,.mmcif,.ent", onChange: ({ target }) => {
                            const f = target.files?.[0];
                            if (f) {
                                setFile(f);
                            }
                        } })),
                file ? (React.createElement(Typography, { variant: "body2", sx: { mt: 1 } },
                    "Selected: ",
                    file.name)) : null)) : null,
            React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 } }, "Tip: Structures will be automatically superposed using TM-align. For manual control, use the Mol* controls (\uD83D\uDD27 wrench icon).")),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: handleClose }, "Cancel"),
            React.createElement(Button, { onClick: () => {
                    handleAdd().catch((e) => {
                        console.error(e);
                    });
                }, variant: "contained", color: "primary", disabled: !canAdd }, "Add Structure"))));
});
export default AddStructureDialog;
//# sourceMappingURL=AddStructureDialog.js.map