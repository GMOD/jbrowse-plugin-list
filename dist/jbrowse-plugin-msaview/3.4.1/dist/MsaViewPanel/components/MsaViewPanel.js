import React from 'react';
import { LoadingEllipses } from '@jbrowse/core/ui';
import { observer } from 'mobx-react';
import { MSAView } from 'react-msaview';
import { makeStyles } from 'tss-react/mui';
import { ErrorBoundary } from './ErrorBoundary';
import LaunchProgress from './LaunchProgress';
const useStyles = makeStyles()({
    loadingContainer: {
        padding: 20,
    },
});
const MsaViewPanel = observer(function MsaViewPanel2({ model, }) {
    const { classes } = useStyles();
    const { blastParams, orthologParams, init, loadingStoredData } = model;
    // an unresolved launch request means there is no alignment to draw yet, so all
    // three gate the same panel -- see LaunchProgress
    const launching = !!(blastParams ?? orthologParams ?? init);
    return (React.createElement(ErrorBoundary, null,
        React.createElement("div", null, launching ? (React.createElement(LaunchProgress, { model: model })) : loadingStoredData ? (React.createElement("div", { className: classes.loadingContainer },
            React.createElement(LoadingEllipses, { message: "Loading MSA data", variant: "h6" }))) : (React.createElement(MSAView, { model: model })))));
});
export default MsaViewPanel;
