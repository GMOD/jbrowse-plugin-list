import React, { useMemo, useRef } from 'react';
import { PrerenderedCanvas } from '@jbrowse/core/ui';
import { SimpleFeature } from '@jbrowse/core/util';
import Flatbush from 'flatbush';
import { observer } from 'mobx-react';
const LinearManhattanRendering = observer(function (props) {
    const { height, onMouseLeave, onMouseMove, onFeatureClick, clickMap } = props;
    const ref = useRef(null);
    const clickMapIndex = useMemo(() => Flatbush.from(clickMap.index), [clickMap.index]);
    function getFeatureUnderMouse(clientX, clientY) {
        if (!ref.current) {
            return undefined;
        }
        const rect = ref.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const [firstIndex] = clickMapIndex.search(x, y, x + 3, y + 3);
        const item = firstIndex !== undefined ? clickMap.items[firstIndex] : undefined;
        return item ? new SimpleFeature(item.feature) : undefined;
    }
    return (React.createElement("div", { ref: ref, "data-testid": "manhattan-rendering", onMouseMove: e => { var _a; return onMouseMove === null || onMouseMove === void 0 ? void 0 : onMouseMove(e, (_a = getFeatureUnderMouse(e.clientX, e.clientY)) === null || _a === void 0 ? void 0 : _a.id()); }, onClick: e => { var _a; return onFeatureClick === null || onFeatureClick === void 0 ? void 0 : onFeatureClick(e, (_a = getFeatureUnderMouse(e.clientX, e.clientY)) === null || _a === void 0 ? void 0 : _a.id()); }, onMouseLeave: onMouseLeave, style: {
            overflow: 'visible',
            position: 'relative',
            height,
        } },
        React.createElement(PrerenderedCanvas, { ...props })));
});
export default LinearManhattanRendering;
//# sourceMappingURL=LinearManhattanRendering.js.map