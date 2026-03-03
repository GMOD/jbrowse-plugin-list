import React, { useState } from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { getContainingView, getSession, } from '@jbrowse/core/util';
import { Button, DialogActions, DialogContent, Link } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { ensemblGeneTreeLaunchView } from './ensemblGeneTreeLaunchView';
import { useGeneTree } from './useGeneTree';
import { getGeneDisplayName } from '../../util';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
const useStyles = makeStyles()({
    dialogContent: {
        width: '80em',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
});
const EnsemblGeneTree = observer(function ({ model, feature, handleClose, }) {
    const session = getSession(model);
    const view = getContainingView(model);
    const { classes } = useStyles();
    const [launchViewError, setLaunchViewError] = useState();
    const { options, selectedId, setSelectedId, selectedTranscript, proteinSequence, error: featureSequenceError, } = useTranscriptSelection({ feature, view });
    const { treeData, isTreeLoading, treeError } = useGeneTree(selectedId);
    const loadingMessage = isTreeLoading
        ? 'Loading tree data from Ensembl GeneTree'
        : undefined;
    const e = treeError ?? launchViewError ?? featureSequenceError;
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            e ? React.createElement(ErrorMessage, { error: e }) : null,
            loadingMessage ? React.createElement(LoadingEllipses, { message: loadingMessage }) : null,
            treeData ? (React.createElement("div", null,
                React.createElement("div", null,
                    "Found Ensembl Compara GeneTree: ",
                    treeData.geneTreeId),
                React.createElement(Link, { target: "_blank", href: `https://useast.ensembl.org/Multi/GeneTree/Image?gt=${treeData.geneTreeId}` },
                    "See ",
                    treeData.geneTreeId,
                    " at Ensembl"))) : null,
            React.createElement(TranscriptSelector, { feature: feature, options: options, selectedId: selectedId, selectedTranscript: selectedTranscript, onTranscriptChange: setSelectedId, proteinSequence: proteinSequence })),
        React.createElement(DialogActions, null,
            React.createElement(Button, { color: "primary", variant: "contained", onClick: () => {
                    try {
                        if (!treeData) {
                            return;
                        }
                        setLaunchViewError(undefined);
                        ensemblGeneTreeLaunchView({
                            feature,
                            view,
                            session,
                            newViewTitle: getGeneDisplayName(feature),
                            data: treeData,
                        });
                        handleClose();
                    }
                    catch (e) {
                        console.error(e);
                        setLaunchViewError(e);
                    }
                } }, "Submit"),
            React.createElement(Button, { color: "secondary", variant: "contained", onClick: () => {
                    handleClose();
                } }, "Cancel"))));
});
export default EnsemblGeneTree;
//# sourceMappingURL=EnsemblGeneTree.js.map