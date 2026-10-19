import React, { useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton, List, ListItem, ListItemButton, ListItemText, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { featureMatchesId, getLinearGenomeView, getSortedTranscriptFeatures, } from '../../util';
import { builtAlignmentLook, launchConnectedView } from '../launchConnectedView';
import { useLaunchPlacement } from '../launchPlacement';
const useStyles = makeStyles()({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    resultList: {
        maxHeight: 300,
        overflow: 'auto',
    },
});
function getResultDisplayName(result) {
    const parts = [
        result.geneName,
        result.transcriptName !== result.geneName
            ? result.transcriptName
            : undefined,
    ].filter((p) => !!p);
    return parts.length > 0
        ? parts.join(' - ')
        : (result.geneId ?? result.transcriptId ?? 'Unknown');
}
/**
 * How the row was produced: `uniprotkb_swissprot / blastp / clustalo`, or
 * `swissprot / phmmer` for a row phmmer aligned as it searched and that
 * therefore ran no aligner. Each part is dropped when absent rather than
 * printed empty — `msaAlgorithm` became optional when phmmer arrived, and a
 * phmmer row read `(undefined)` until this stopped assuming one.
 *
 * `blastProgram` is the older field, written only while the plugin still
 * queried NCBI directly and blastp/quick-blastp was a real choice.
 */
export function describeSearch(result) {
    return [
        result.blastDatabase,
        result.searchProgram ?? result.blastProgram ?? 'blastp',
        result.msaAlgorithm,
    ]
        .filter(Boolean)
        .join(' / ');
}
const CachedBlastResults = observer(function ({ model, handleClose, feature, cached: { results, handleDelete, handleClearAll }, }) {
    const { classes } = useStyles();
    const view = getLinearGenomeView(model);
    const [operationError, setOperationError] = useState();
    const [sideBySide] = useLaunchPlacement();
    const handleUseCached = (cached) => {
        // the cached query row is the plugin's default `QUERY`, translated from
        // the transcript stored as transcriptId, so that transcript relinks it
        const { transcriptId, msa, tree, treeMetadata } = cached;
        launchConnectedView({
            view,
            feature: transcriptId
                ? getSortedTranscriptFeatures(feature).find(t => featureMatchesId(t, transcriptId))
                : undefined,
            placement: sideBySide ? 'splitRight' : 'stack',
            displayName: `BLAST - ${getResultDisplayName(cached)}`,
            ...builtAlignmentLook,
            data: { msa, tree, treeMetadata },
        }).then(handleClose, (e) => {
            console.error(e);
            setOperationError(e);
        });
    };
    return (React.createElement("div", null,
        operationError ? React.createElement(ErrorMessage, { error: operationError }) : null,
        React.createElement("div", { className: classes.header },
            React.createElement(Typography, { variant: "subtitle1" },
                "Cached BLAST Results (",
                results.length,
                ")"),
            React.createElement(Button, { size: "small", color: "error", onClick: async () => {
                    try {
                        setOperationError(undefined);
                        await handleClearAll();
                    }
                    catch (e) {
                        setOperationError(e);
                    }
                } }, "Clear results for this gene")),
        React.createElement(List, { dense: true, className: classes.resultList }, results.map(result => (React.createElement(ListItem, { key: result.id, disablePadding: true, secondaryAction: React.createElement(IconButton, { edge: "end", size: "small", onClick: async (e) => {
                    e.stopPropagation();
                    try {
                        setOperationError(undefined);
                        await handleDelete(result.id);
                    }
                    catch (err) {
                        setOperationError(err);
                    }
                } },
                React.createElement(DeleteIcon, { fontSize: "small" })) },
            React.createElement(ListItemButton, { onClick: () => {
                    handleUseCached(result);
                } },
                React.createElement(ListItemText, { primary: `${getResultDisplayName(result)} - ${describeSearch(result)}`, secondary: `${new Date(result.timestamp).toLocaleString()} - Seq: ${result.proteinSequence.slice(0, 30)}...` }))))))));
});
export default CachedBlastResults;
