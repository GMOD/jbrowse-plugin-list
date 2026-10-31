import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import TextField2 from './TextField2';
const useStyles = makeStyles()({
    textAreaFont: {
        fontFamily: 'Courier New',
    },
});
const ReadOnlyTextField2 = observer(function ReadOnlyTextField2({ value, }) {
    const { classes } = useStyles();
    return (React.createElement(TextField2, { variant: "outlined", multiline: true, minRows: 5, maxRows: 10, fullWidth: true, value: value, slotProps: {
            input: {
                readOnly: true,
                classes: {
                    input: classes.textAreaFont,
                },
            },
        } }));
});
export default ReadOnlyTextField2;
