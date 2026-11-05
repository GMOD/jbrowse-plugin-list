import React, { useState } from 'react';
import { Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { HOVERED_BORDER, SELECTED_BORDER } from '../constants';
const KIND_LABEL = { domain: 'Domain', site: 'Site' };
const Bar = observer(function Bar({ row, bar, selected, model, }) {
    const [isHovered, setIsHovered] = useState(false);
    const { columnWidth, trackGap } = model;
    const first = model.residueNumber(bar.structureStart);
    const last = model.residueNumber(bar.structureEnd - 1);
    return (React.createElement(Tooltip, { title: React.createElement("div", null,
            React.createElement("div", null,
                React.createElement("strong", null, row.label)),
            React.createElement("div", null,
                KIND_LABEL[row.kind],
                " from the alignment, ",
                row.accession),
            React.createElement("div", null,
                "Structure residue: ",
                first === last ? first : `${first}-${last}`)), followCursor: true },
        React.createElement("div", { "data-testid": `alignment-domain-${row.kind}`, "data-accession": row.accession, onClick: () => {
                model.toggleDomainRow(row);
            }, onMouseEnter: () => {
                setIsHovered(true);
                model.setAlignmentHoverRange({
                    start: bar.alignmentStart,
                    end: bar.alignmentEnd,
                });
            }, onMouseLeave: () => {
                setIsHovered(false);
                model.setAlignmentHoverRange(undefined);
            }, style: {
                position: 'absolute',
                left: bar.alignmentStart * columnWidth,
                top: 0,
                width: (bar.alignmentEnd - bar.alignmentStart + 1) * columnWidth,
                height: `calc(100% - ${trackGap}px)`,
                backgroundColor: row.color,
                opacity: isHovered || selected ? 0.9 : 0.6,
                cursor: 'pointer',
                borderRadius: 2,
                border: selected
                    ? SELECTED_BORDER
                    : isHovered
                        ? HOVERED_BORDER
                        : 'none',
                boxSizing: 'border-box',
            } })));
});
/** One overview row from the alignment: a bar per run of its residues */
const DomainRowTrack = observer(function DomainRowTrack({ row, model, }) {
    const selected = model.selectedFeatureId === `alignment:${row.accession}`;
    return row.bars.map(bar => (React.createElement(Bar, { key: bar.alignmentStart, row: row, bar: bar, selected: selected, model: model })));
});
export default DomainRowTrack;
