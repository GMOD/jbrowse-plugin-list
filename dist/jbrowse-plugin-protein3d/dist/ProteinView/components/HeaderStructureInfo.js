import React from 'react';
import { observer } from 'mobx-react';
const HeaderStructureInfo = observer(function HeaderStructureInfo({ model, }) {
    const { structures } = model;
    return structures.map((structure, idx) => {
        const { hoverString } = structure;
        return (React.createElement("span", { key: `${hoverString}-${idx}` },
            hoverString ? `Hover: ${hoverString}` : '',
            "\u00A0"));
    });
});
export default HeaderStructureInfo;
//# sourceMappingURL=HeaderStructureInfo.js.map