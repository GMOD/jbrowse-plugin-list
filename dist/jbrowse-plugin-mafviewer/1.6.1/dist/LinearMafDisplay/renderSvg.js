import React from 'react';
import { getContainingView } from '@jbrowse/core/util';
import YScaleBars from './components/Sidebar/YScaleBars';
export async function renderSvg(self, opts, superRenderSvg) {
    const { height, id } = self;
    const { offsetPx, width } = getContainingView(self);
    const clipid = `mafclip-${id}`;
    return (React.createElement(React.Fragment, null,
        React.createElement("defs", null,
            React.createElement("clipPath", { id: clipid },
                React.createElement("rect", { x: 0, y: 0, width: width, height: height }))),
        React.createElement("g", { clipPath: `url(#${clipid})` },
            React.createElement("g", { id: "snpcov" }, await superRenderSvg(opts)),
            React.createElement("g", { transform: `translate(${Math.max(-offsetPx, 0)})` },
                React.createElement(YScaleBars, { model: self, exportSVG: true })))));
}
//# sourceMappingURL=renderSvg.js.map