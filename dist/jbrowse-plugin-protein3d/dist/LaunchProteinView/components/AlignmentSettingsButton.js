import React, { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup, Tab, Tabs, TextField, Typography, } from '@mui/material';
import { parsePairwise } from 'clustal-js';
import { ALIGNMENT_ALGORITHMS, } from '../../ProteinView/types';
export default function AlignmentSettingsButton({ value, onChange, onManualAlignment, }) {
    const [open, setOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [tempAlgorithm, setTempAlgorithm] = useState(value);
    const [manualAlignment, setManualAlignment] = useState('');
    const [parseError, setParseError] = useState();
    const handleOpen = () => {
        setTempAlgorithm(value);
        setManualAlignment('');
        setParseError(undefined);
        setTabValue(0);
        setOpen(true);
    };
    const handleSave = () => {
        if (tabValue === 0) {
            onChange(tempAlgorithm);
        }
        else if (tabValue === 1 && manualAlignment.trim() && onManualAlignment) {
            try {
                const parsed = parsePairwise(manualAlignment.trim());
                onManualAlignment(parsed);
            }
            catch (e) {
                setParseError(`Failed to parse alignment: ${e}`);
                return;
            }
        }
        setOpen(false);
    };
    const handleCancel = () => {
        setTempAlgorithm(value);
        setManualAlignment('');
        setParseError(undefined);
        setOpen(false);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(IconButton, { onClick: handleOpen, size: "small", title: "Alignment settings" },
            React.createElement(SettingsIcon, null)),
        React.createElement(Dialog, { open: open, onClose: handleCancel, maxWidth: "sm", fullWidth: true },
            React.createElement(DialogTitle, null, "Alignment Settings"),
            React.createElement(DialogContent, null,
                React.createElement(Tabs, { value: tabValue, onChange: (_, val) => {
                        setTabValue(val);
                    }, sx: { mb: 2 } },
                    React.createElement(Tab, { label: "Automatic" }),
                    React.createElement(Tab, { label: "Manual", disabled: !onManualAlignment })),
                tabValue === 0 ? (React.createElement(React.Fragment, null,
                    React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Choose the algorithm for aligning transcript sequences to protein structures."),
                    React.createElement(FormControl, { component: "fieldset" },
                        React.createElement(FormLabel, { component: "legend" }, "Algorithm"),
                        React.createElement(RadioGroup, { value: tempAlgorithm, onChange: event => {
                                setTempAlgorithm(event.target.value);
                            } },
                            React.createElement(FormControlLabel, { value: ALIGNMENT_ALGORITHMS.SMITH_WATERMAN, control: React.createElement(Radio, null), label: "Smith-Waterman (local alignment)" }),
                            React.createElement(Typography, { variant: "caption", color: "text.secondary", sx: { ml: 4, mt: -1, mb: 1 } }, "Finds best matching region. Recommended for most use cases."),
                            React.createElement(FormControlLabel, { value: ALIGNMENT_ALGORITHMS.NEEDLEMAN_WUNSCH, control: React.createElement(Radio, null), label: "Needleman-Wunsch (global alignment)" }),
                            React.createElement(Typography, { variant: "caption", color: "text.secondary", sx: { ml: 4, mt: -1, mb: 1 } }, "End-to-end alignment. Use when sequences should align completely."))))) : (React.createElement(React.Fragment, null,
                    React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Paste a pre-computed alignment in Clustal format. The first sequence should be the transcript and the second should be the structure."),
                    React.createElement(TextField, { multiline: true, rows: 10, fullWidth: true, placeholder: `Example:
a  MKAAYLSMFGKEDHKPFGD
   |||||||||||||||||||
b  MKAAYLSMFGKEDHKPFGD`, value: manualAlignment, onChange: e => {
                            setManualAlignment(e.target.value);
                            setParseError(undefined);
                        }, sx: { fontFamily: 'monospace', fontSize: 12 } }),
                    parseError ? (React.createElement(Typography, { color: "error", variant: "body2", sx: { mt: 1 } }, parseError)) : null))),
            React.createElement(DialogActions, null,
                React.createElement(Button, { onClick: handleCancel }, "Cancel"),
                React.createElement(Button, { onClick: handleSave, variant: "contained", color: "primary", disabled: tabValue === 1 && !manualAlignment.trim() }, tabValue === 0 ? 'Save' : 'Apply Alignment')))));
}
//# sourceMappingURL=AlignmentSettingsButton.js.map