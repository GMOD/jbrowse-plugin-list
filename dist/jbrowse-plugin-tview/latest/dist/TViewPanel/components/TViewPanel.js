import React from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { Button, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { MSAView } from 'react-msaview';
const padded = { padding: 20 };
const TViewPanel = observer(function TViewPanel2({ model, }) {
    const state = model.viewState;
    return state.kind === 'alignment' ? (React.createElement(MSAView, { model: model })) : (React.createElement("div", { style: padded }, state.kind === 'loading' ? (React.createElement(LoadingEllipses, { variant: "h6", message: state.message })) : state.kind === 'notice' ? (React.createElement(Typography, null, state.message)) : (React.createElement(React.Fragment, null,
        React.createElement(ErrorMessage, { error: state.error }),
        state.retry ? (React.createElement(Button, { variant: "contained", onClick: () => {
                model.retryLoad();
            } }, "Retry")) : null))));
});
export default TViewPanel;
//# sourceMappingURL=TViewPanel.js.map