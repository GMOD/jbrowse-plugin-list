import React from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { observer } from 'mobx-react';
import { LOW_IDENTITY_OVER_SHORTER, SHORT_ALIGNMENT_IDENTITY, SHORT_ALIGNMENT_RESIDUES, describeAlignmentQuality, describeCoveredRange, describeTranscriptCoverage, isLowSimilarity, uniprotEntryUrl, } from 'p2s_mapper';
import ChainSelect from './ChainSelect';
import { describeCoverage } from '../describeCoverage';
const LOW_SIMILARITY_EXPLANATION = `Under ${Math.round(LOW_IDENTITY_OVER_SHORTER * 100)}% of the shorter sequence is identical (${Math.round(SHORT_ALIGNMENT_IDENTITY * 100)}% for an alignment of fewer than ${SHORT_ALIGNMENT_RESIDUES} residues): an alignment this weak is what two unrelated proteins produce, so the positions it maps may be unrelated. Check the mapped chain, the transcript isoform, or import a curated alignment.`;
// Which UniProt entry the structure's mapped chain is, and so which one its
// feature tracks annotate. For an AlphaFold model that is in the filename, but
// for a PDB entry it is resolved via SIFTS and is otherwise invisible.
const UniProtLink = observer(function UniProtLink({ structure, }) {
    const { uniprotId, uniprotName } = structure.uniProtEntry;
    return uniprotId ? (React.createElement(Tooltip, { title: `The mapped chain is UniProt ${uniprotId}${uniprotName ? ` (${uniprotName})` : ''}, which its feature tracks annotate` },
        React.createElement(Link, { variant: "caption", href: uniprotEntryUrl(uniprotId), target: "_blank", rel: "noreferrer", noWrap: true, sx: { minWidth: 40 } },
            "UniProt ",
            uniprotId))) : null;
});
const StructureRow = observer(function StructureRow({ model, structure, readout, }) {
    const { label, alignmentQuality: quality, statusMessage } = structure;
    const switchable = model.showAlignment && model.structures.length > 1;
    const open = model.alignmentStructure === structure;
    const coveredRange = quality ? describeCoveredRange(quality) : undefined;
    return (React.createElement("div", { "data-testid": "structure-row", "data-label": label, "data-open": switchable ? open : undefined, style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            minHeight: 24,
            minWidth: 0,
        } },
        switchable ? (React.createElement(Tooltip, { title: open ? 'Alignment shown below' : 'Show alignment' },
            React.createElement("span", null,
                React.createElement(IconButton, { size: "small", "aria-label": `Show ${label} alignment`, "aria-expanded": open, disabled: open, onClick: () => {
                        model.openAlignmentOf(structure);
                    }, sx: { p: 0 } }, open ? (React.createElement(ExpandMoreIcon, { fontSize: "small" })) : (React.createElement(ChevronRightIcon, { fontSize: "small" })))))) : null,
        React.createElement(Typography, { variant: "caption", sx: { fontWeight: 'bold', flexShrink: 0 } }, label),
        statusMessage ? (React.createElement(Typography, { variant: "caption", color: "error", "data-testid": "structure-status" }, statusMessage)) : null,
        readout ? (React.createElement(Typography, { variant: "caption", noWrap: true, title: readout, "data-testid": "structure-hover" }, readout)) : quality ? (React.createElement(Tooltip, { title: quality.aligned === 0
                ? ''
                : `${describeTranscriptCoverage(quality)}${coveredRange ? `, ${coveredRange}` : ''}; ${describeAlignmentQuality(quality)}` },
            React.createElement(Typography, { variant: "caption", color: "textSecondary", noWrap: true, "data-testid": "header-alignment-quality" }, describeCoverage(quality)))) : null,
        React.createElement(UniProtLink, { structure: structure }),
        React.createElement("div", { style: { flex: 1 } }),
        open && model.showAlignment ? React.createElement(ChainSelect, { model: structure }) : null,
        quality && isLowSimilarity(quality) ? (React.createElement(Tooltip, { title: LOW_SIMILARITY_EXPLANATION },
            React.createElement(Chip, { size: "small", color: "warning", variant: "outlined", label: "low similarity", "data-testid": "header-low-similarity" }))) : null,
        React.createElement(Tooltip, { title: `Remove ${label}` },
            React.createElement(IconButton, { size: "small", "aria-label": `Remove ${label}`, onClick: () => {
                    model.removeStructure(structure);
                }, sx: { p: 0.25 } },
                React.createElement(CloseIcon, { fontSize: "small" })))));
});
/**
 * One line per structure, in the header the reader always sees. The identity
 * and coverage readout used to live only inside the pairwise panel, which the
 * same reader can hide — so how much of the transcript a structure speaks for,
 * and whether the mapping is chance, were one click away from invisible. The
 * open structure's row also carries what used to head its alignment panel:
 * the mapped-chain picker.
 *
 * A hovered residue is read out on its structure's row, in place of the
 * coverage line until the pointer leaves. A genome or MSA hover that reaches
 * one mapped structure but not another says so, since a crystal that lacks
 * the residue is the point of showing several.
 */
const HeaderStructureRows = observer(function HeaderStructureRows({ model, }) {
    const { structures } = model;
    const connectedHover = structures.some(s => s.hoverPosition && s.hoverPosition.source !== 'structure');
    return (React.createElement("div", { style: { flex: 1, minWidth: 0 } }, structures.map((structure, idx) => (React.createElement(StructureRow, { key: idx, model: model, structure: structure, readout: structure.hoverString ||
            (connectedHover && structure.genomeToTranscriptSeqMapping
                ? 'not in structure'
                : '') })))));
});
export default HeaderStructureRows;
