import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, } from '@mui/material';
import { getStructureUrlFromTarget } from 'p2s_mapper';
import { makeStyles } from 'tss-react/mui';
import FoldseekActionMenu from './FoldseekActionMenu';
const useStyles = makeStyles()(theme => ({
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
        backgroundColor: theme.palette.mode === 'dark'
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
    },
    noResults: {
        padding: 16,
        textAlign: 'center',
    },
}));
const MAX_HITS = 100;
function flattenResults(results) {
    const hits = results.results.flatMap(dbResult => (dbResult.alignments ?? []).flat().map(alignment => ({
        ...alignment,
        db: dbResult.db,
        structureUrl: getStructureUrlFromTarget(alignment.target, dbResult.db),
    })));
    hits.sort((a, b) => (a.eval ?? Infinity) - (b.eval ?? Infinity));
    return hits;
}
export default function FoldseekResultsTable({ results, session, view, feature, selectedTranscript, userProvidedTranscriptSequence, onClose, }) {
    const { classes } = useStyles();
    const allHits = flattenResults(results);
    const flatHits = allHits.slice(0, MAX_HITS);
    if (flatHits.length === 0) {
        return (React.createElement(Paper, { className: classes.noResults },
            React.createElement(Typography, null, "No similar structures found")));
    }
    return (React.createElement("div", { className: classes.root },
        React.createElement(Typography, { variant: "subtitle2" },
            "Found ",
            allHits.length,
            " similar structures",
            allHits.length > flatHits.length
                ? ` (showing top ${flatHits.length})`
                : ''),
        React.createElement(TableContainer, { component: Paper, className: classes.tableContainer },
            React.createElement(Table, { size: "small", stickyHeader: true },
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null,
                        React.createElement(TableCell, { className: classes.headerCell }, "Database"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Target"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Organism"),
                        React.createElement(TableCell, { className: classes.headerCell },
                            React.createElement(Tooltip, { title: "Foldseek's estimated probability that the hit is a true structural homolog" },
                                React.createElement("span", null, "Prob"))),
                        React.createElement(TableCell, { className: classes.headerCell },
                            React.createElement(Tooltip, { title: "Percentage of aligned residues whose amino acid is identical; structural hits are often low here" },
                                React.createElement("span", null, "Seq. Id."))),
                        React.createElement(TableCell, { className: classes.headerCell }, "Coverage"),
                        React.createElement(TableCell, { className: classes.headerCell },
                            React.createElement(Tooltip, { title: "Hits of this score expected by chance in a database this size; smaller is stronger" },
                                React.createElement("span", null, "E-value"))),
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
