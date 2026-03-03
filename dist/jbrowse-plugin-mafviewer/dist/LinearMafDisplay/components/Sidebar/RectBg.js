import React from 'react';
const RectBg = ({ x, y, width, height, color = 'rgb(255,255,255,0.5)', }) => {
    return React.createElement("rect", { x: x, y: y, width: width, height: height, fill: color });
};
export default RectBg;
//# sourceMappingURL=RectBg.js.map