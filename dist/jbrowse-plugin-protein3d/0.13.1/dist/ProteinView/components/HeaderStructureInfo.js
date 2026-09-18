import React from 'react';
import { observer } from 'mobx-react';
const HeaderStructureInfo = observer(function HeaderStructureInfo({ model, }) {
    const { structures } = model;
    // With several structures open a hover lights the same residue on each, so
    // every readout is prefixed with the structure it describes. A genome or MSA
    // hover that reaches one mapped structure but not another says so, since a
    // crystal that lacks the residue is the point of showing several; a
    // structure with no transcript could never have answered.
    const connectedHover = structures.some((s) => s.hoverPosition && s.hoverPosition.source !== 'structure');
    const readouts = structures.map((s) => s.hoverString ||
        (connectedHover && s.genomeToTranscriptSeqMapping
            ? 'not in structure'
            : ''));
    const hoverText = structures
        .map((s, i) => readouts[i] && structures.length > 1 && s.label
        ? `${s.label}: ${readouts[i]}`
        : readouts[i])
        .filter(Boolean)
        .join(' | ');
    return (React.createElement("div", { style: {
            flex: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: 12,
        }, title: hoverText }, hoverText ? `Hover: ${hoverText}` : ' '));
});
export default HeaderStructureInfo;
