import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()({
    block: {
        display: 'block',
    },
});
export default function Checkbox2({ checked, disabled, label, onChange, }) {
    const { classes } = useStyles();
    return (React.createElement(FormControlLabel, { disabled: disabled, className: classes.block, control: React.createElement(Checkbox, { checked: checked, onChange: onChange }), label: label }));
}
//# sourceMappingURL=Checkbox2.js.map