import React from 'react';
import { LoadingEllipses } from '@jbrowse/core/ui';
import { observer } from 'mobx-react';
import { MSAView } from 'react-msaview';
import { makeStyles } from 'tss-react/mui';
import { ErrorBoundary } from './ErrorBoundary';
import LoadingBLAST from './LoadingBLAST';
const useStyles = makeStyles()({
    loadingContainer: {
        padding: 20,
    },
});
const MsaViewPanel = observer(function MsaViewPanel2({ model, }) {
    const { classes } = useStyles();
    const { blastParams, loadingStoredData } = model;
    return (React.createElement(ErrorBoundary, null,
        React.createElement("div", null, blastParams ? (React.createElement(LoadingBLAST, { model: model, baseUrl: blastParams.baseUrl })) : loadingStoredData ? (React.createElement("div", { className: classes.loadingContainer },
            React.createElement(LoadingEllipses, { message: "Loading MSA data", variant: "h6" }))) : (React.createElement(MSAView, { model: model })))));
});
export default MsaViewPanel;
