import React, { useEffect, useMemo, useState } from 'react';
import { getContainingView } from '@jbrowse/core/util';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton, List, ListItem, ListItemButton, ListItemText, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { blastLaunchViewFromCache } from './blastLaunchView';
import { clearAllCachedResults, deleteCachedResult, getAllCachedResults, } from '../../../utils/blastCache';
function getGeneIdentifiers(feature) {
    const ids = [
        feature.id(),
        feature.get('id'),
        feature.get('name'),
        feature.get('gene_id'),
        feature.get('gene_name'),
    ].filter((id) => !!id);
    return [...new Set(ids)];
}
function getResultDisplayName(result) {
    const parts = [];
    if (result.geneName) {
        parts.push(result.geneName);
    }
    if (result.transcriptName && result.transcriptName !== result.geneName) {
        parts.push(result.transcriptName);
    }
    if (parts.length === 0) {
        parts.push(result.geneId ?? result.transcriptId ?? 'Unknown');
    }
    return parts.join(' - ');
}
const CachedBlastResults = observer(function ({ model, handleClose, feature, }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const view = getContainingView(model);
    const geneIds = useMemo(() => getGeneIdentifiers(feature), [feature]);
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        ;
        (async () => {
            try {
                const cached = await getAllCachedResults();
                setResults(cached.filter(r => r.geneId && geneIds.includes(r.geneId)));
                setLoading(false);
            }
            catch (e) {
                console.error(e);
            }
        })();
    }, [geneIds]);
    const handleDelete = async (id) => {
        await deleteCachedResult(id);
        setResults(r => r.filter(result => result.id !== id));
    };
    const handleClearAll = async () => {
        await clearAllCachedResults();
        setResults([]);
    };
    const handleUseCached = (cached) => {
        blastLaunchViewFromCache({
            view,
            cached,
            newViewTitle: `BLAST - ${getResultDisplayName(cached)}`,
        });
        handleClose();
    };
    if (loading) {
        return React.createElement(Typography, null, "Loading cached results...");
    }
    if (results.length === 0) {
        return (React.createElement(Typography, { color: "textSecondary" }, "No cached BLAST results found for this gene. Run a BLAST query to cache results."));
    }
    return (React.createElement("div", null,
        React.createElement("div", { style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
            } },
            React.createElement(Typography, { variant: "subtitle1" },
                "Cached BLAST Results (",
                results.length,
                ")"),
            React.createElement(Button, { size: "small", color: "error", onClick: () => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    handleClearAll();
                } }, "Clear All")),
        React.createElement(List, { dense: true, style: { maxHeight: 300, overflow: 'auto' } }, results.map(result => (React.createElement(ListItem, { key: result.id, disablePadding: true, secondaryAction: React.createElement(IconButton, { edge: "end", size: "small", onClick: e => {
                    e.stopPropagation();
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    handleDelete(result.id);
                } },
                React.createElement(DeleteIcon, { fontSize: "small" })) },
            React.createElement(ListItemButton, { onClick: () => {
                    handleUseCached(result);
                } },
                React.createElement(ListItemText, { primary: `${getResultDisplayName(result)} - ${result.blastDatabase}/${result.blastProgram} (${result.msaAlgorithm})`, secondary: `${new Date(result.timestamp).toLocaleString()} - Seq: ${result.proteinSequence.slice(0, 30)}...` }))))))));
});
export default CachedBlastResults;
//# sourceMappingURL=CachedBlastResults.js.map