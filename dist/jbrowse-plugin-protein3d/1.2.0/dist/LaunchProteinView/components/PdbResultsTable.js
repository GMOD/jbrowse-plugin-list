import React from 'react';
import { Paper, Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, } from '@mui/material';
import { rcsbEntryUrl } from 'p2s_mapper';
import { makeStyles } from 'tss-react/mui';
import ExternalLink from '../../components/ExternalLink';
const useStyles = makeStyles()(theme => ({
    tableContainer: {
        maxHeight: 300,
    },
    headerCell: {
        fontWeight: 'bold',
        backgroundColor: theme.palette.mode === 'dark'
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
    },
    selectedRow: {
        backgroundColor: theme.palette.action.selected,
    },
    clickableRow: {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}));
const MAX_ROWS = 100;
export default function PdbResultsTable({ entries, selectedPdbId, onSelect, }) {
    const { classes } = useStyles();
    const shown = entries.slice(0, MAX_ROWS);
    return (React.createElement(React.Fragment, null,
        React.createElement(Typography, { variant: "body2", color: "textSecondary" },
            entries.length,
            " PDB entries, ranked by PDBe on coverage and resolution",
            entries.length > shown.length
                ? ` (showing the first ${MAX_ROWS})`
                : ''),
        React.createElement(TableContainer, { component: Paper, className: classes.tableContainer },
            React.createElement(Table, { size: "small", stickyHeader: true, "data-testid": "pdb-results-table" },
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null,
                        React.createElement(TableCell, { className: classes.headerCell, padding: "checkbox" }),
                        React.createElement(TableCell, { className: classes.headerCell }, "PDB ID"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Method"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Resolution"),
                        React.createElement(TableCell, { className: classes.headerCell },
                            React.createElement(Tooltip, { title: "The span of the UniProt sequence this entry resolves, by SIFTS. A crystal is usually one domain rather than the whole protein." },
                                React.createElement("span", null, "UniProt residues"))),
                        React.createElement(TableCell, { className: classes.headerCell }, "Coverage"),
                        React.createElement(TableCell, { className: classes.headerCell }, "Chains"))),
                React.createElement(TableBody, null, shown.map(entry => {
                    const selected = entry.pdbId === selectedPdbId;
                    return (React.createElement(TableRow, { key: entry.pdbId, className: `${classes.clickableRow} ${selected ? classes.selectedRow : ''}`, onClick: () => {
                            onSelect(entry.pdbId);
                        } },
                        React.createElement(TableCell, { padding: "checkbox" },
                            React.createElement(Radio, { checked: selected, size: "small" })),
                        React.createElement(TableCell, null,
                            React.createElement(ExternalLink, { href: rcsbEntryUrl(entry.pdbId) }, entry.pdbId.toUpperCase())),
                        React.createElement(TableCell, null, entry.experimentalMethod),
                        React.createElement(TableCell, null, entry.resolution === undefined
                            ? '-'
                            : `${entry.resolution.toFixed(2)} Å`),
                        React.createElement(TableCell, null,
                            entry.unpStart,
                            "-",
                            entry.unpEnd),
                        React.createElement(TableCell, null,
                            (entry.coverage * 100).toFixed(0),
                            "%"),
                        React.createElement(TableCell, null, entry.chains.join(', '))));
                }))))));
}
