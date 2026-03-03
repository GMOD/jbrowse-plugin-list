import React from 'react';
import { Button, Checkbox, FormControlLabel, FormGroup, Typography, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { FOLDSEEK_DATABASES, } from '../services/foldseekApi';
const useStyles = makeStyles()({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    buttons: {
        display: 'flex',
        gap: 4,
    },
    checkboxGroup: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 0,
    },
});
export default function FoldseekDatabaseSelector({ selected, onChange, disabled, }) {
    const { classes } = useStyles();
    const handleToggle = (dbId) => {
        if (selected.includes(dbId)) {
            onChange(selected.filter(id => id !== dbId));
        }
        else {
            onChange([...selected, dbId]);
        }
    };
    const selectAll = () => {
        onChange(FOLDSEEK_DATABASES.map(db => db.id));
    };
    const deselectAll = () => {
        onChange([]);
    };
    return (React.createElement("div", { className: classes.root },
        React.createElement("div", { className: classes.header },
            React.createElement(Typography, { variant: "subtitle2" }, "Databases to search:"),
            React.createElement("div", { className: classes.buttons },
                React.createElement(Button, { size: "small", onClick: selectAll, disabled: disabled }, "Select all"),
                React.createElement(Button, { size: "small", onClick: deselectAll, disabled: disabled }, "Clear"))),
        React.createElement(FormGroup, { className: classes.checkboxGroup }, FOLDSEEK_DATABASES.map(db => (React.createElement(FormControlLabel, { key: db.id, control: React.createElement(Checkbox, { size: "small", checked: selected.includes(db.id), onChange: () => {
                    handleToggle(db.id);
                }, disabled: disabled }), label: db.label }))))));
}
//# sourceMappingURL=FoldseekDatabaseSelector.js.map