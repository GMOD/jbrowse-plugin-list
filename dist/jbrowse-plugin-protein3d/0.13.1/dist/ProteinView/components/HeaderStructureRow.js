import React from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { observer } from 'mobx-react';
import { LOW_IDENTITY_OVER_SHORTER, SHORT_ALIGNMENT_IDENTITY, SHORT_ALIGNMENT_RESIDUES, describeCoveredRange, describeTranscriptCoverage, isLowSimilarity, } from 'p2s_mapper';
const LOW_SIMILARITY_EXPLANATION = `Under ${Math.round(LOW_IDENTITY_OVER_SHORTER * 100)}% of the shorter sequence is identical (${Math.round(SHORT_ALIGNMENT_IDENTITY * 100)}% for an alignment of fewer than ${SHORT_ALIGNMENT_RESIDUES} residues): an alignment this weak is what two unrelated proteins produce, so the positions it maps may be unrelated. Check the mapped chain, the transcript isoform, or import a curated alignment.`;
const StructureRow = observer(function StructureRow({ model, structure, }) {
    const { label, alignmentQuality: quality, statusMessage } = structure;
    const coveredRange = quality ? describeCoveredRange(quality) : undefined;
    const switchable = model.showAlignment && model.structures.length > 1;
    const open = model.alignmentStructure === structure;
    return (React.createElement("div", { "data-testid": "structure-row", "data-label": label, "data-open": switchable ? open : undefined, style: { display: 'flex', alignItems: 'center', gap: 8, minHeight: 24 } },
        switchable ? (React.createElement(Tooltip, { title: open ? 'Alignment shown below' : 'Show alignment' },
            React.createElement("span", null,
                React.createElement(IconButton, { size: "small", "aria-label": `Show ${label} alignment`, "aria-expanded": open, disabled: open, onClick: () => {
                        model.openAlignmentOf(structure);
                    }, sx: { p: 0 } }, open ? (React.createElement(ExpandMoreIcon, { fontSize: "small" })) : (React.createElement(ChevronRightIcon, { fontSize: "small" })))))) : null,
        React.createElement(Typography, { variant: "caption", sx: { fontWeight: 'bold' } }, label),
        statusMessage ? (React.createElement(Typography, { variant: "caption", color: "error", "data-testid": "structure-status" }, statusMessage)) : null,
        quality ? (React.createElement(Typography, { variant: "caption", color: "textSecondary", "data-testid": "header-alignment-quality" },
            describeTranscriptCoverage(quality),
            coveredRange ? `, ${coveredRange}` : '')) : null,
        React.createElement("div", { style: { flex: 1 } }),
        quality && isLowSimilarity(quality) ? (React.createElement(Tooltip, { title: LOW_SIMILARITY_EXPLANATION },
            React.createElement(Chip, { size: "small", color: "warning", variant: "outlined", label: "low similarity", "data-testid": "header-low-similarity" }))) : null,
        React.createElement(Tooltip, { title: `Remove ${label}` },
            React.createElement(IconButton, { size: "small", "aria-label": `Remove ${label}`, onClick: () => {
                    model.removeStructure(structure);
                } },
                React.createElement(CloseIcon, { fontSize: "small" })))));
});
/**
 * One line per structure, in the header the reader always sees. The identity
 * and coverage readout used to live only inside the pairwise panel, which the
 * same reader can hide — so how much of the transcript a structure speaks for,
 * and whether the mapping is chance, were one click away from invisible.
 */
const HeaderStructureRows = observer(function HeaderStructureRows({ model, }) {
    return (React.createElement("div", null, model.structures.map((structure, idx) => (React.createElement(StructureRow, { key: idx, model: model, structure: structure })))));
});
export default HeaderStructureRows;
