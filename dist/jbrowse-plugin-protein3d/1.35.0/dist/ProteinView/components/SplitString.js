import React from 'react';
import { observer } from 'mobx-react';
const SplitString = observer(function SplitString({ model, str, }) {
    const { columnWidth } = model;
    return str.split('').map((char, i) => (React.createElement("span", { key: i, style: {
            position: 'absolute',
            left: i * columnWidth,
            width: columnWidth,
        } }, char === ' ' ? '\u00A0' : char)));
});
export default SplitString;
