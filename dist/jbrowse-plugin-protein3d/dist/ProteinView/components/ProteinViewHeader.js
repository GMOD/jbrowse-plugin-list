import React from 'react';
import { LoadingEllipses } from '@jbrowse/core/ui';
import { observer } from 'mobx-react';
import AddStructureDialog from './AddStructureDialog';
import HeaderStructureInfo from './HeaderStructureInfo';
import ProteinAlignment from './ProteinAlignment';
const ProteinViewHeader = observer(function ProteinViewHeader({ model, }) {
    const { structures, showAlignment } = model;
    return (React.createElement("div", null,
        React.createElement(HeaderStructureInfo, { model: model }),
        showAlignment
            ? structures.map((structure, idx) => {
                const { pairwiseAlignment } = structure;
                return (React.createElement("div", { key: idx }, pairwiseAlignment ? (React.createElement(ProteinAlignment, { key: idx, model: structure })) : (React.createElement(LoadingEllipses, { message: "Loading pairwise alignment" }))));
            })
            : null,
        React.createElement(AddStructureDialog, { model: model })));
});
export default ProteinViewHeader;
//# sourceMappingURL=ProteinViewHeader.js.map