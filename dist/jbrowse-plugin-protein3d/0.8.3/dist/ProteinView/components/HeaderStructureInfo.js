import React from 'react';
import { observer } from 'mobx-react';
const HeaderStructureInfo = observer(function HeaderStructureInfo({ model, }) {
    const { structures } = model;
    const hoverText = structures
        .map((structure) => structure.hoverString)
        .filter(Boolean)
        .join(' ');
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
