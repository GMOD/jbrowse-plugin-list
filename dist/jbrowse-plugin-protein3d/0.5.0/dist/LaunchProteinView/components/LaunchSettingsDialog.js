import React, { useState } from 'react';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, Typography, } from '@mui/material';
import { getLaunchSideBySide, setLaunchSideBySide } from '../utils/sideBySide';
// Small, self-contained launch settings (NOT the global preferences dialog):
// just the options that affect how this protein view opens.
export default function LaunchSettingsDialog({ open, onClose, }) {
    const [sideBySide, setSideBySide] = useState(() => getLaunchSideBySide());
    return (React.createElement(Dialog, { open: open, onClose: () => {
            onClose();
        } },
        React.createElement(DialogTitle, null, "Launch settings"),
        React.createElement(DialogContent, null,
            React.createElement(FormGroup, null,
                React.createElement(FormControlLabel, { control: React.createElement(Checkbox, { checked: sideBySide }), label: "Open protein view side-by-side with the genome view", onChange: (_, checked) => {
                        setSideBySide(checked);
                        setLaunchSideBySide(checked);
                    } })),
            React.createElement(Typography, { variant: "body2", color: "text.secondary" }, "When enabled, launching a protein view places it to the right of the connected genome view in a split layout instead of stacking it below.")),
        React.createElement(DialogActions, null,
            React.createElement(Button, { variant: "contained", onClick: () => {
                    onClose();
                } }, "Close"))));
}
