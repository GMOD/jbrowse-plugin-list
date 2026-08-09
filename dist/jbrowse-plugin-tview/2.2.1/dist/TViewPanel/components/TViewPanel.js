import React from 'react';
import { observer } from 'mobx-react';
import { MSAView } from 'react-msaview';
const TViewPanel = observer(function TViewPanel2({ model, }) {
    // react-msaview types its model prop with type: 'MsaView' baked in, but a
    // JBrowse view model's `type` must equal its registered view type name. That
    // literal is the only difference, and the MSA renderer never reads it.
    return React.createElement(MSAView, { model: model });
});
export default TViewPanel;
//# sourceMappingURL=TViewPanel.js.map