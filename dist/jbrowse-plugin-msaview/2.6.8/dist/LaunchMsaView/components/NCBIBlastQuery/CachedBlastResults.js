import React, { useMemo, useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton, List, ListItem, ListItemButton, ListItemText, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { blastLaunchViewFromCache } from './blastLaunchView';
import { useCachedBlastResults } from './useCachedBlastResults';
import { featureMatchesId, getGeneIdentifiers, getLinearGenomeView, getSortedTranscriptFeatures, } from '../../util';
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
const CachedBlastResults = observer(function ({ model, handleClose, feature, }) {
    const { classes } = useStyles();
    const view = getLinearGenomeView(model);
    const [operationError, setOperationError] = useState();
    const geneIds = useMemo(() => getGeneIdentifiers(feature), [feature]);
    const { results, error, isLoading, handleDelete, handleClearAll } = useCachedBlastResults(geneIds);
    const handleUseCached = (cached) => {
        // reconnect the cached MSA to the genome: the cached query row is named
        // 'QUERY' (react-msaview's default querySeqName) and corresponds to the
        // transcript stored as transcriptId. Resolving it here restores the
        // MSA<->genome navigation and hover-sync a fresh BLAST gets.
        const { transcriptId } = cached;
        const transcript = transcriptId
            ? getSortedTranscriptFeatures(feature).find(t => featureMatchesId(t, transcriptId))
            : undefined;
        blastLaunchViewFromCache({
            view,
            cached,
            newViewTitle: `BLAST - ${getResultDisplayName(cached)}`,
            connectedFeature: transcript?.toJSON(),
        });
        handleClose();
    };
    const displayError = error ?? operationError;
    return displayError ? (React.createElement(ErrorMessage, { error: displayError })) : isLoading ? (React.createElement(Typography, null, "Loading cached results...")) : results.length === 0 ? (React.createElement(Typography, { color: "textSecondary" }, "No cached BLAST results found for this gene. Run a BLAST query to cache results.")) : (React.createElement("div", null,
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
                } }, "Clear All")),
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
                React.createElement(ListItemText, { primary: `${getResultDisplayName(result)} - ${result.blastDatabase}/${result.blastProgram} (${result.msaAlgorithm})`, secondary: `${new Date(result.timestamp).toLocaleString()} - Seq: ${result.proteinSequence.slice(0, 30)}...` }))))))));
});
export default CachedBlastResults;
