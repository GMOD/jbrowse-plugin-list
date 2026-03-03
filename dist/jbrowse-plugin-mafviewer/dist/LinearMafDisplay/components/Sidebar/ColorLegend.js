import React from 'react';
import { observer } from 'mobx-react';
import RectBg from './RectBg';
import Tree from './Tree';
const ColorLegend = observer(function ({ model, }) {
    const { labelWidth, canDisplayLabel, totalHeight, treeWidth, sidebarWidth, samples = [], rowHeight, svgFontSize, } = model;
    const boxHeight = Math.min(20, rowHeight);
    return (React.createElement(React.Fragment, null,
        React.createElement(RectBg, { y: 0, x: 0, width: sidebarWidth, height: totalHeight }),
        React.createElement("g", { transform: "translate(4,0)" },
            React.createElement(Tree, { model: model })),
        React.createElement("g", { transform: `translate(${treeWidth + 9},0)` },
            samples.map((sample, idx) => (React.createElement(RectBg, { key: `${sample.id}-${idx}`, y: idx * rowHeight, x: 0, width: labelWidth + 5, height: boxHeight, color: sample.color }))),
            canDisplayLabel
                ? samples.map((sample, idx) => (React.createElement("text", { key: `${sample.id}-${idx}`, dominantBaseline: "middle", fontSize: svgFontSize, x: 2, y: idx * rowHeight + rowHeight / 2 }, sample.label)))
                : null)));
});
export default ColorLegend;
//# sourceMappingURL=ColorLegend.js.map