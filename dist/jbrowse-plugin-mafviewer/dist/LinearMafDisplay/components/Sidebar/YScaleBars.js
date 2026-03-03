import React from 'react';
import { observer } from 'mobx-react';
import ColorLegend from './ColorLegend';
import SvgWrapper from './SvgWrapper';
export const YScaleBars = observer(function (props) {
    const { model } = props;
    return (React.createElement(SvgWrapper, { ...props },
        React.createElement(ColorLegend, { model: model })));
});
export default YScaleBars;
//# sourceMappingURL=YScaleBars.js.map