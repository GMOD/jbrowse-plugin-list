import React from 'react';
interface CrosshairsProps {
    width: number;
    height: number;
    scrollTop: number;
    mouseX?: number;
    mouseY: number;
}
declare const Crosshairs: ({ width, height, scrollTop, mouseX, mouseY, }: CrosshairsProps) => React.JSX.Element;
export default Crosshairs;
