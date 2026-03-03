import React from 'react';
import { LoadingEllipses } from '@jbrowse/core/ui';
import { observer } from 'mobx-react';
import { MSAView } from 'react-msaview';
import LoadingBLAST from './LoadingBLAST';
const MsaViewPanel = observer(function MsaViewPanel2({ model, }) {
    const { blastParams, loadingStoredData } = model;
    return (React.createElement("div", null, blastParams ? (React.createElement(LoadingBLAST, { model: model, baseUrl: blastParams.baseUrl })) : loadingStoredData ? (React.createElement("div", { style: { padding: 20 } },
        React.createElement(LoadingEllipses, { message: "Loading MSA data", variant: "h6" }))) : (React.createElement(MSAView, { model: model }))));
});
export default MsaViewPanel;
//# sourceMappingURL=MsaViewPanel.js.map