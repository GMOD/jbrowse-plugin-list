import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import FoldseekActionMenu from './FoldseekActionMenu';
import { getStructureUrlFromTarget } from '../utils/launchViewUtils';
const useStyles = makeStyles()({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    tableContainer: {
        maxHeight: 400,
    },
    headerCell: {
        fontWeight: 'bold',
        backgroundColor: '#f5f5f5',
    },
    noResults: {
        padding: 16,
        textAlign: 'center',
    },
});
function flattenResults(results) {
    const hits = [];
    for (const dbResult of results.results) {
        if (!dbResult.alignments) {
            continue;
        }
        for (const alignmentGroup of dbResult.alignments) {
            if (!alignmentGroup) {
                continue;
            }
            for (const alignment of alignmentGroup) {
                if (!alignment) {
                    continue;
                }
                hits.push({
                    ...alignment,
                    db: dbResult.db,
                    structureUrl: getStructureUrlFromTarget(alignment.target, dbResult.db),
                });
            }
        }
    }
    hits.sort((a, b) => (a.eval ?? Infinity) - (b.eval ?? Infinity));
    return hits.slice(0, 100);
}
export default function FoldseekResultsTable({ results, session, view, feature, selectedTranscript, userProvidedTranscriptSequence, onClose, }) {
    const { classes } = useStyles();
    const flatHits = flattenResults(results);
    if (flatHits.length === 0) {
        return (React.createElement(Paper, { className: classes.noResults },
            React.createElement(Typography, null, "No similar structures found")));
    }
    return (React.createElement("div", { className: classes.root },
        React.createElement(Typography, { variant: "subtitle2" },
            "Found ",
            flatHits.length,
            " similar structures"),
        React.createElement(TableContainer, { component: Paper, className: classes.tableContainer },
            React.createElement(Table, { size: "small", stickyHeader: true },
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null,
                        React.createElement(TableCell, { className: classes.headerCell }, "Database"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Target"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Organism"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Prob"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Seq. Id."),
                        React.createElement(TableCell, { className: classes.headerCell }, "Coverage"),
                        React.createElement(TableCell, { className: classes.headerCell }, "E-value"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Actions"))),
                React.createElement(TableBody, null, flatHits.map((hit, idx) => (React.createElement(TableRow, { key: `${hit.db}-${hit.target}-${idx}` },
                    React.createElement(TableCell, null, hit.db),
                    React.createElement(TableCell, null, hit.target),
                    React.createElement(TableCell, null, hit.taxName ?? '-'),
                    React.createElement(TableCell, null, hit.prob != null ? `${(hit.prob * 100).toFixed(1)}%` : '-'),
                    React.createElement(TableCell, null, hit.seqId != null ? `${hit.seqId.toFixed(1)}%` : '-'),
                    React.createElement(TableCell, null, hit.alnLength != null && hit.qLen != null
                        ? `${((hit.alnLength / hit.qLen) * 100).toFixed(1)}%`
                        : '-'),
                    React.createElement(TableCell, null, hit.eval != null ? hit.eval.toExponential(2) : '-'),
                    React.createElement(TableCell, null,
                        React.createElement(FoldseekActionMenu, { hit: hit, session: session, view: view, feature: feature, selectedTranscript: selectedTranscript, userProvidedTranscriptSequence: userProvidedTranscriptSequence, onClose: onClose }))))))))));
}
//# sourceMappingURL=FoldseekResultsTable.js.map