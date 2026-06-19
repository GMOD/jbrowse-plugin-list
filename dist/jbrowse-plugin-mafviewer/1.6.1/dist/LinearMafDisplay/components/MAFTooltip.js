import React from 'react';
import { SanitizedHTML } from '@jbrowse/core/ui';
import BaseTooltip from '@jbrowse/core/ui/BaseTooltip';
import { getContainingView } from '@jbrowse/core/util';
import { observer } from 'mobx-react';
import { generateTooltipContent } from '../util';
const MAFTooltip = observer(function ({ model, mouseX, origMouseX, }) {
    const { hoveredInfo } = model;
    const view = getContainingView(model);
    const p1 = origMouseX ? view.pxToBp(origMouseX) : undefined;
    const p2 = view.pxToBp(mouseX);
    return hoveredInfo ? (React.createElement(BaseTooltip, null,
        React.createElement(SanitizedHTML, { html: generateTooltipContent(hoveredInfo, p1, p2) }))) : null;
});
export default MAFTooltip;
//# sourceMappingURL=MAFTooltip.js.map