import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, } from '@mui/material';
import { parsePairwise } from 'clustal-js';
import { observer } from 'mobx-react';
const ManualAlignmentDialog = observer(function ManualAlignmentDialog({ model, }) {
    const [alignment, setAlignment] = useState('');
    const [parseError, setParseError] = useState();
    const { showManualAlignmentDialog, structures } = model;
    const handleClose = () => {
        setAlignment('');
        setParseError(undefined);
        model.setShowManualAlignmentDialog(false);
    };
    const handleApply = () => {
        if (!alignment.trim()) {
            return;
        }
        try {
            const parsed = parsePairwise(alignment.trim());
            const structure = structures[0];
            if (structure) {
                structure.setAlignment(parsed);
            }
            handleClose();
        }
        catch (e) {
            setParseError(`Failed to parse alignment: ${e}`);
        }
    };
    if (!showManualAlignmentDialog) {
        return null;
    }
    return (React.createElement(Dialog, { open: true, onClose: handleClose, maxWidth: "md", fullWidth: true },
        React.createElement(DialogTitle, null, "Import Manual Alignment"),
        React.createElement(DialogContent, null,
            React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Paste a pre-computed alignment in Clustal format. The first sequence should be the transcript and the second should be the structure."),
            React.createElement(TextField, { multiline: true, rows: 12, fullWidth: true, placeholder: `Example:
a  MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG
   |||||||||||||||||||||||||||||||||||||
b  MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG`, value: alignment, onChange: e => {
                    setAlignment(e.target.value);
                    setParseError(undefined);
                }, InputProps: {
                    sx: { fontFamily: 'monospace', fontSize: 12 },
                } }),
            parseError ? (React.createElement(Typography, { color: "error", variant: "body2", sx: { mt: 1 } }, parseError)) : null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: handleClose }, "Cancel"),
            React.createElement(Button, { onClick: handleApply, variant: "contained", color: "primary", disabled: !alignment.trim() }, "Apply Alignment"))));
});
export default ManualAlignmentDialog;
//# sourceMappingURL=ManualAlignmentDialog.js.map