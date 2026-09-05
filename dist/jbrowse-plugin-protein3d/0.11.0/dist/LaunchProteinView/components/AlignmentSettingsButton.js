import React, { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup, Typography, } from '@mui/material';
import { ALIGNMENT_ALGORITHMS } from '../../ProteinView/types';
function AlgorithmOption({ value, label, description, }) {
    return (React.createElement(React.Fragment, null,
        React.createElement(FormControlLabel, { value: value, control: React.createElement(Radio, null), label: label }),
        React.createElement(Typography, { variant: "caption", color: "text.secondary", sx: { ml: 4, mt: -1, mb: 1 } }, description)));
}
export default function AlignmentSettingsButton({ value, onChange, }) {
    const [open, setOpen] = useState(false);
    const [tempAlgorithm, setTempAlgorithm] = useState(value);
    const handleOpen = () => {
        setTempAlgorithm(value);
        setOpen(true);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(IconButton, { onClick: handleOpen, size: "small", title: "Alignment settings" },
            React.createElement(SettingsIcon, null)),
        React.createElement(Dialog, { open: open, onClose: () => {
                setOpen(false);
            }, maxWidth: "sm", fullWidth: true },
            React.createElement(DialogTitle, null, "Alignment settings"),
            React.createElement(DialogContent, null,
                React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } }, "Choose the algorithm for aligning transcript sequences to protein structures. A hand-made alignment can be imported from the protein view's menu once it is open."),
                React.createElement(FormControl, { component: "fieldset" },
                    React.createElement(FormLabel, { component: "legend" }, "Algorithm"),
                    React.createElement(RadioGroup, { value: tempAlgorithm, onChange: event => {
                            setTempAlgorithm(event.target.value);
                        } },
                        React.createElement(AlgorithmOption, { value: ALIGNMENT_ALGORITHMS.SMITH_WATERMAN, label: "Smith-Waterman (local alignment)", description: "Finds best matching region. Recommended for most use cases." }),
                        React.createElement(AlgorithmOption, { value: ALIGNMENT_ALGORITHMS.NEEDLEMAN_WUNSCH, label: "Needleman-Wunsch (global alignment)", description: "End-to-end alignment. Use when sequences should align completely." })))),
            React.createElement(DialogActions, null,
                React.createElement(Button, { onClick: () => {
                        setOpen(false);
                    } }, "Cancel"),
                React.createElement(Button, { onClick: () => {
                        onChange(tempAlgorithm);
                        setOpen(false);
                    }, variant: "contained", color: "primary" }, "Save")))));
}
