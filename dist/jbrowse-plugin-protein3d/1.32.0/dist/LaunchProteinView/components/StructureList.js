import React, { useState } from 'react';
import { LoadingEllipses } from '@jbrowse/core/ui';
import { Link, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import StructureListRow from './StructureListRow';
import { SECTIONS } from '../utils/structureList';
const useStyles = makeStyles()(theme => ({
    list: {
        flex: '1 1 auto',
        minHeight: 160,
        overflowY: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 12,
        padding: '8px 24px 4px',
        background: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    heading: {
        fontSize: '0.8rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: theme.palette.text.secondary,
    },
    line: {
        padding: '6px 24px',
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));
// the protein on its own is mostly the same crystal again, so the section
// shows its best few and the partners start above the fold
const ALONE_SHOWN = 5;
function sectionText(section, geneName) {
    return section === 'alone'
        ? {
            title: `${geneName} on its own`,
            note: 'whole protein or most of it, with any bound nucleotide or drug',
        }
        : section === 'partner'
            ? {
                title: `${geneName} with another protein`,
                note: 'experimental complexes first, then AlphaFold DB predictions',
            }
            : {
                title: 'Short fragments',
                note: 'under half the protein, so each opens on its own',
            };
}
const Section = observer(function Section({ section, geneName, rows, status, checked, uniprotLength, onToggle, }) {
    const { classes } = useStyles();
    const [expanded, setExpanded] = useState(false);
    const { title, note } = sectionText(section, geneName);
    const collapsed = section === 'fragment' &&
        !expanded &&
        !rows.some(r => checked.includes(r.key));
    const shown = section === 'alone' && !expanded ? rows.slice(0, ALONE_SHOWN) : rows;
    const hidden = rows.length - shown.length;
    const loading = status?.loading ?? [];
    const notices = status?.notices ?? [];
    return rows.length + loading.length + notices.length === 0 ? null : (React.createElement("div", { "data-testid": `structure-section-${section}` },
        React.createElement("div", { className: classes.header },
            React.createElement("span", { className: classes.heading },
                title,
                " \u00B7 ",
                rows.length),
            React.createElement(Typography, { variant: "caption", color: "textSecondary" }, note)),
        collapsed ? (rows.length > 0 ? (React.createElement("div", { className: classes.line },
            React.createElement(Link, { component: "button", variant: "body2", onClick: () => {
                    setExpanded(true);
                } },
                "Show ",
                rows.length,
                " short fragment",
                rows.length === 1 ? '' : 's'))) : null) : (React.createElement(React.Fragment, null,
            shown.map(row => (React.createElement(StructureListRow, { key: row.key, row: row, checked: checked.includes(row.key), uniprotLength: uniprotLength, onToggle: () => {
                    onToggle(row);
                } }))),
            hidden > 0 ? (React.createElement("div", { className: classes.line },
                React.createElement(Link, { component: "button", variant: "body2", onClick: () => {
                        setExpanded(true);
                    } },
                    "Show ",
                    hidden,
                    " more"))) : null)),
        loading.map(message => (React.createElement("div", { className: classes.line, key: message },
            React.createElement(LoadingEllipses, { variant: "body2", message: message })))),
        notices.map(message => (React.createElement(Typography, { key: message, className: classes.line, variant: "body2", color: "textSecondary" }, message)))));
});
/** Every structure for the gene, grouped by what it shows of the protein */
const StructureList = observer(function StructureList({ rows, sections, geneName, checked, uniprotLength, onToggle, }) {
    const { classes } = useStyles();
    return (React.createElement("div", { className: classes.list, "data-testid": "structure-list" }, SECTIONS.map(section => (React.createElement(Section, { key: section, section: section, geneName: geneName, rows: rows.filter(r => r.section === section), status: sections?.[section], checked: checked, uniprotLength: uniprotLength, onToggle: onToggle })))));
});
export default StructureList;
