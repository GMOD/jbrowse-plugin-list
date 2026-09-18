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
    // three gate the same panel -- see LaunchProgress. An indexed view keeps its
    // init for the life of the view (it is how the block is refetched), so that
    // one is only "launching" until the alignment arrives.
    const request = blastParams ?? orthologParams;
    const pending = !!request && !model.launchCompleted;
    // a request that finished and then lost its alignment -- browser storage
    // expires one after 7 days -- is a request again, and LaunchProgress draws it
    // with the Retry that runs it
    const expired = !!request && !!model.error && !model.dataInitialized;
    const launching = pending || expired || (!!init && !model.dataInitialized);
    return (React.createElement(ErrorBoundary, null,
        React.createElement("div", null, launching ? (React.createElement(LaunchProgress, { model: model })) : loadingStoredData ? (React.createElement("div", { className: classes.loadingContainer },
            React.createElement(LoadingEllipses, { message: "Loading MSA data", variant: "h6" }))) : (React.createElement(MSAView, { model: model })))));
});
export default MsaViewPanel;
