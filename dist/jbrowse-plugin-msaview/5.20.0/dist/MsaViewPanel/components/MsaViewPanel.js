import React from 'react';
import { LoadingEllipses } from '@jbrowse/core/ui';
import { observer } from 'mobx-react';
import { MSAView } from 'react-msaview';
import { makeStyles } from 'tss-react/mui';
import { isLaunching } from '../isLaunching';
import LaunchProgress from './LaunchProgress';
const useStyles = makeStyles()({
    loadingContainer: {
        padding: 20,
    },
});
const MsaViewPanel = observer(function MsaViewPanel2({ model, }) {
    const { classes } = useStyles();
    const { loadingStoredData } = model;
    const launching = isLaunching(model);
    return (React.createElement("div", null, launching ? (React.createElement(LaunchProgress, { model: model })) : loadingStoredData && !model.dataInitialized ? (React.createElement("div", { className: classes.loadingContainer },
        React.createElement(LoadingEllipses, { message: "Loading MSA data", variant: "h6" }))) : (React.createElement(MSAView, { model: model }))));
});
export default MsaViewPanel;
