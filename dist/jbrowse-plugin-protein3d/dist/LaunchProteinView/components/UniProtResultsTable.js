import React from 'react';
import { Chip, Paper, Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import ExternalLink from '../../components/ExternalLink';
const useStyles = makeStyles()({
    tableContainer: {
        maxHeight: 200,
    },
    headerCell: {
        fontWeight: 'bold',
        backgroundColor: '#f5f5f5',
    },
    selectedRow: {
        backgroundColor: '#e3f2fd',
    },
    clickableRow: {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    reviewedChip: {
        backgroundColor: '#4caf50',
        color: 'white',
        fontSize: '0.7rem',
        height: 20,
    },
    unreviewedChip: {
        backgroundColor: '#ff9800',
        color: 'white',
        fontSize: '0.7rem',
        height: 20,
    },
});
export default function UniProtResultsTable({ entries, selectedAccession, onSelect, }) {
    const { classes, cx } = useStyles();
    if (entries.length === 0) {
        return null;
    }
    return (React.createElement("div", null,
        React.createElement(Typography, { variant: "body2", sx: { mb: 1 } },
            "Found ",
            entries.length,
            " UniProt entries. Select one:"),
        React.createElement(TableContainer, { component: Paper, className: classes.tableContainer },
            React.createElement(Table, { size: "small", stickyHeader: true },
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null,
                        React.createElement(TableCell, { className: classes.headerCell, padding: "checkbox" }),
                        React.createElement(TableCell, { className: classes.headerCell }, "Accession"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Gene"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Organism"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Protein"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Status"))),
                React.createElement(TableBody, null, entries.map(entry => (React.createElement(TableRow, { key: entry.accession, onClick: () => {
                        onSelect(entry.accession);
                    }, className: cx(classes.clickableRow, selectedAccession === entry.accession && classes.selectedRow) },
                    React.createElement(TableCell, { padding: "checkbox" },
                        React.createElement(Radio, { checked: selectedAccession === entry.accession, size: "small" })),
                    React.createElement(TableCell, null,
                        React.createElement(ExternalLink, { href: `https://www.uniprot.org/uniprotkb/${entry.accession}` }, entry.accession)),
                    React.createElement(TableCell, null, entry.geneName ?? '-'),
                    React.createElement(TableCell, null, entry.organismName ?? '-'),
                    React.createElement(TableCell, null, entry.proteinName
                        ? entry.proteinName.length > 40
                            ? `${entry.proteinName.slice(0, 40)}...`
                            : entry.proteinName
                        : '-'),
                    React.createElement(TableCell, null,
                        React.createElement(Chip, { label: entry.isReviewed ? 'Reviewed' : 'Unreviewed', size: "small", className: entry.isReviewed
                                ? classes.reviewedChip
                                : classes.unreviewedChip }))))))))));
}
//# sourceMappingURL=UniProtResultsTable.js.map