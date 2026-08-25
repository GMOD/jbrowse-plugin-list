import React from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import JobLink from './JobLink';
const useStyles = makeStyles()(theme => ({
    margin: {
        padding: 20,
    },
    loading: {
        background: theme.palette.background.paper,
    },
}));
const LoadingBLAST = observer(function LoadingBLAST2({ model, }) {
    const { progress, rid, error } = model;
    const { classes } = useStyles();
    return (React.createElement("div", { className: classes.margin },
        React.createElement(LoadingEllipses, { message: "Running EBI BLAST", variant: "h5" }),
        error ? (React.createElement("div", null,
            rid ? React.createElement(JobLink, { jobId: rid }) : null,
            React.createElement(ErrorMessage, { error: error }))) : rid ? (React.createElement("div", { className: classes.loading },
            React.createElement(JobLink, { jobId: rid }),
            React.createElement(Typography, null, progress))) : (React.createElement(Typography, null, progress || 'Initializing BLAST query'))));
});
export default LoadingBLAST;
