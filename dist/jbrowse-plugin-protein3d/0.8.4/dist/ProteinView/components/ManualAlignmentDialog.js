import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, } from '@mui/material';
import { parsePairwise } from 'clustal-js';
import { observer } from 'mobx-react';
import { pairwiseAlignmentProblem } from '../../mappings';
const ManualAlignmentDialog = observer(function ManualAlignmentDialog({ model, }) {
    const [alignment, setAlignment] = useState('');
    const [parseError, setParseError] = useState();
    const { showManualAlignmentDialog, primaryStructure } = model;
    const handleClose = () => {
        setAlignment('');
        setParseError(undefined);
        model.setShowManualAlignmentDialog(false);
    };
    const handleApply = () => {
        if (alignment.trim()) {
            try {
                const parsed = parsePairwise(alignment.trim());
                // Rejected here rather than committed: every coordinate map is built
                // from these two rows by the `coordinateMapper` getter, which throws on
                // a bad pair during render — outside this catch, taking the whole view
                // down instead of reporting a bad paste. Same predicate the map builder
                // asserts on, so what the dialog accepts is exactly what it can use.
                const problem = pairwiseAlignmentProblem(parsed);
                if (!primaryStructure) {
                    setParseError('No structure loaded to apply alignment to');
                }
                else if (problem) {
                    setParseError(problem);
                }
                else {
                    primaryStructure.setAlignment(parsed);
                    handleClose();
                }
            }
            catch (e) {
                setParseError(`Failed to parse alignment: ${e}`);
            }
        }
    };
    if (!showManualAlignmentDialog) {
        return null;
    }
    return (React.createElement(Dialog, { open: true, onClose: handleClose, maxWidth: "md", fullWidth: true },
        React.createElement(DialogTitle, null, "Import manual alignment"),
        React.createElement(DialogContent, null,
            React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Paste a pre-computed alignment in Clustal format. The first sequence should be the transcript and the second should be the structure."),
            React.createElement(TextField, { multiline: true, rows: 12, fullWidth: true, placeholder: `Example:
transcript  MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG
            |||||||||||||||||||||||||||||||||||||
structure   MKAAYLSMFGKEDHKPFGDDEVELFRAVPGLKLKIAG`, value: alignment, onChange: e => {
                    setAlignment(e.target.value);
                    setParseError(undefined);
                }, slotProps: {
                    htmlInput: { style: { fontFamily: 'monospace', fontSize: 12 } },
                } }),
            parseError ? (React.createElement(Typography, { color: "error", variant: "body2", sx: { mt: 1 } }, parseError)) : null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: () => {
                    handleClose();
                } }, "Cancel"),
            React.createElement(Button, { onClick: () => {
                    handleApply();
                }, variant: "contained", color: "primary", disabled: !alignment.trim() }, "Apply alignment"))));
});
export default ManualAlignmentDialog;
