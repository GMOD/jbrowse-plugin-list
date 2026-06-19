import React from 'react';
import { getConf } from '@jbrowse/core/configuration';
import { SanitizedHTML } from '@jbrowse/core/ui';
import { Tooltip } from '@jbrowse/plugin-wiggle';
import { observer } from 'mobx-react';
const TooltipContents = React.forwardRef(function TooltipContents2({ model, feature }, ref) {
    return (React.createElement("div", { ref: ref },
        React.createElement(SanitizedHTML, { html: getConf(model, 'mouseover', { feature }) })));
});
const TooltipComponent = observer(function (props) {
    return React.createElement(Tooltip, { TooltipContents: TooltipContents, ...props });
});
export default TooltipComponent;
//# sourceMappingURL=TooltipComponent.js.map