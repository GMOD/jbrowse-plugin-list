import React from 'react';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()({
    cursor: {
        pointerEvents: 'none',
    },
});
const Crosshairs = ({ width, height, scrollTop, mouseX, mouseY, }) => {
    const { classes } = useStyles();
    return (React.createElement("svg", { className: classes.cursor, width: width, height: height, style: {
            position: 'absolute',
            top: scrollTop,
        } },
        React.createElement("line", { x1: 0, x2: width, y1: mouseY, y2: mouseY, stroke: "black" }),
        React.createElement("line", { x1: mouseX, x2: mouseX, y1: 0, y2: height, stroke: "black" })));
};
export default Crosshairs;
//# sourceMappingURL=Crosshairs.js.map