import React from 'react';
import { observer } from 'mobx-react';
const HeaderStructureInfo = observer(function HeaderStructureInfo({ model, }) {
    const { structures } = model;
    return structures.map((structure, idx) => {
        const { clickString, hoverString } = structure;
        return (React.createElement("span", { key: `${clickString}-${hoverString}-${idx}` },
            [
                clickString ? `Click: ${clickString}` : '',
                hoverString ? `Hover: ${hoverString}` : '',
            ].join(' '),
            "\u00A0"));
    });
});
export default HeaderStructureInfo;
//# sourceMappingURL=HeaderStructureInfo.js.map