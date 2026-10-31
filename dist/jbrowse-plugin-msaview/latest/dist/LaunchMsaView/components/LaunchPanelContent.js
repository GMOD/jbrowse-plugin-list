import React from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import { DialogContent } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()({
    dialogContent: {
        width: '80em',
    },
});
const LaunchPanelContent = observer(function LaunchPanelContent({ error, children, }) {
    const { classes } = useStyles();
    return (React.createElement(DialogContent, { className: classes.dialogContent },
        error ? React.createElement(ErrorMessage, { error: error }) : null,
        children));
});
export default LaunchPanelContent;
