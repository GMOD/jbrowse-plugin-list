import React from 'react';
import { Paper, Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { uniprotEntryUrl } from 'p2s_mapper';
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
export function alphaFoldEntryUrl(entity) {
    return `https://alphafold.ebi.ac.uk/entry/${entity}`;
}
function complexKind({ homomer, oligomericState }) {
    return `${homomer ? 'Homo' : 'Hetero'}${oligomericState ?? 'mer'}`;
}
function fixed(value, digits) {
    return value === undefined ? '-' : value.toFixed(digits);
}
const Member = observer(function Member({ member, }) {
    return (React.createElement("div", null,
        React.createElement("strong", null, member.gene ?? member.accession),
        member.copies > 1 ? ` ×${member.copies}` : '',
        ' ',
        member.description ? `${member.description} ` : '',
        React.createElement(ExternalLink, { href: uniprotEntryUrl(member.accession) }, member.accession)));
});
/**
 * The structures AlphaFold DB predicted for a protein: optionally its monomer
 * first, then each complex with the proteins it pairs with. `selected`
 * undefined is the monomer.
 */
const AlphaFoldComplexesTable = observer(function AlphaFoldComplexesTable({ complexes, accession, monomer, selected, onSelect, }) {
    const { classes } = useStyles();
    const entry = accession.replace(/-\d+$/, '');
    const rowClass = (isSelected) => `${classes.clickableRow} ${isSelected ? classes.selectedRow : ''}`;
    return (React.createElement(React.Fragment, null,
        React.createElement(Typography, { variant: "body2", color: "textSecondary" }, complexes.length === 0
            ? `AlphaFold DB has predicted no complex with ${entry}`
            : `${complexes.length} complex${complexes.length === 1 ? '' : 'es'} AlphaFold DB predicted with ${entry}, homomers first, then by ipTM`),
        React.createElement(TableContainer, { component: Paper, className: classes.tableContainer },
            React.createElement(Table, { size: "small", stickyHeader: true, "data-testid": "alphafold-complexes-table" },
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null,
                        React.createElement(TableCell, { className: classes.headerCell, padding: "checkbox" }),
                        React.createElement(TableCell, { className: classes.headerCell }, "Structure"),
                        React.createElement(TableCell, { className: classes.headerCell }, "With"),
                        React.createElement(TableCell, { className: classes.headerCell },
                            React.createElement(Tooltip, { title: "Interface predicted TM-score, 0 to 1: how sure the prediction is of how the chains sit against each other. Above 0.8 is confident; below 0.6 the interface is likely wrong." },
                                React.createElement("span", null, "ipTM"))),
                        React.createElement(TableCell, { className: classes.headerCell },
                            React.createElement(Tooltip, { title: "Mean per-residue confidence, 0 to 100" },
                                React.createElement("span", null, "pLDDT"))),
                        React.createElement(TableCell, { className: classes.headerCell }, "AlphaFold DB"))),
                React.createElement(TableBody, null,
                    monomer ? (React.createElement(TableRow, { className: rowClass(selected === undefined), onClick: () => {
                            onSelect(undefined);
                        } },
                        React.createElement(TableCell, { padding: "checkbox" },
                            React.createElement(Radio, { checked: selected === undefined, size: "small" })),
                        React.createElement(TableCell, null, "Monomer"),
                        React.createElement(TableCell, null, "-"),
                        React.createElement(TableCell, null, "-"),
                        React.createElement(TableCell, null, fixed(monomer.meanPlddt, 1)),
                        React.createElement(TableCell, null,
                            React.createElement(ExternalLink, { href: alphaFoldEntryUrl(entry) }, entry)))) : null,
                    complexes.map(complex => {
                        const isSelected = complex.entity === selected;
                        const partners = complex.homomer
                            ? complex.members
                            : complex.members.filter(m => m.accession !== entry);
                        return (React.createElement(TableRow, { key: complex.entity, className: rowClass(isSelected), onClick: () => {
                                onSelect(complex.entity);
                            } },
                            React.createElement(TableCell, { padding: "checkbox" },
                                React.createElement(Radio, { checked: isSelected, size: "small" })),
                            React.createElement(TableCell, null, complexKind(complex)),
                            React.createElement(TableCell, null, partners.map(m => (React.createElement(Member, { key: m.accession, member: m })))),
                            React.createElement(TableCell, null, fixed(complex.iptm, 2)),
                            React.createElement(TableCell, null, fixed(complex.meanPlddt, 1)),
                            React.createElement(TableCell, null,
                                React.createElement(ExternalLink, { href: alphaFoldEntryUrl(complex.entity) }, complex.entity))));
                    }))))));
});
export default AlphaFoldComplexesTable;
