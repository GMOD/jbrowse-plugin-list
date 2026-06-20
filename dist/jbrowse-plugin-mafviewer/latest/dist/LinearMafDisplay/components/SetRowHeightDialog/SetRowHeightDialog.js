import React, { useState } from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { Button, DialogActions, DialogContent, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()({
    root: {
        width: 500,
    },
});
const SetRowHeightDialog = observer(function (props) {
    const { model, handleClose } = props;
    const { classes } = useStyles();
    const [rowHeight, setRowHeight] = useState(`${model.rowHeight}`);
    const [rowProportion, setRowProportion] = useState(`${model.rowProportion}`);
    return (React.createElement(Dialog, { open: true, onClose: handleClose, title: "Set row height" },
        React.createElement("form", { onSubmit: event => {
                event.preventDefault();
                model.setRowProportion(+rowProportion);
                model.setRowHeight(+rowHeight);
                handleClose();
            } },
            React.createElement(DialogContent, { className: classes.root },
                React.createElement(Typography, null, "Set row height and the proportion of the row height to use for drawing each row"),
                React.createElement(TextField, { value: rowHeight, helperText: "Enter row height", autoFocus: true, onChange: event => {
                        setRowHeight(event.target.value);
                    } }),
                React.createElement(TextField, { value: rowProportion, helperText: "Enter row proportion", onChange: event => {
                        setRowProportion(event.target.value);
                    } }),
                React.createElement(DialogActions, null,
                    React.createElement(Button, { variant: "contained", color: "primary", type: "submit" }, "Submit"),
                    React.createElement(Button, { variant: "contained", color: "secondary", onClick: () => {
                            handleClose();
                        } }, "Cancel"))))));
});
export default SetRowHeightDialog;
//# sourceMappingURL=SetRowHeightDialog.js.map