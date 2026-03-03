import React from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import RIDLink from './RIDLink';
const useStyles = makeStyles()(theme => ({
    margin: {
        padding: 20,
    },
    loading: {
        background: theme.palette.background.paper,
    },
}));
function RIDError({ baseUrl, rid, error, }) {
    return (React.createElement("div", null,
        rid ? React.createElement(RIDLink, { rid: rid, baseUrl: baseUrl }) : null,
        React.createElement(ErrorMessage, { error: error })));
}
function RIDProgress({ baseUrl, rid, progress, }) {
    const { classes } = useStyles();
    return (React.createElement("div", { className: classes.loading },
        rid ? React.createElement(RIDLink, { baseUrl: baseUrl, rid: rid }) : null,
        React.createElement(Typography, null, progress)));
}
const LoadingBLAST = observer(function LoadingBLAST2({ model, baseUrl, }) {
    const { progress, rid, error, processing } = model;
    const { classes } = useStyles();
    return (React.createElement("div", { className: classes.margin },
        React.createElement(LoadingEllipses, { message: "Running NCBI BLAST", variant: "h5" }),
        error ? (React.createElement(RIDError, { baseUrl: baseUrl, rid: rid, error: error })) : rid ? (React.createElement(RIDProgress, { baseUrl: baseUrl, rid: rid, progress: progress })) : null,
        React.createElement(Typography, null, processing || 'Initializing BLAST query')));
});
export default LoadingBLAST;
//# sourceMappingURL=LoadingBLAST.js.map