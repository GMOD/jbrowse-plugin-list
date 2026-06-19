import React, { useCallback, useMemo, useRef, useState } from 'react';
import { PrerenderedCanvas } from '@jbrowse/core/ui';
import Flatbush from 'flatbush';
import { observer } from 'mobx-react';
const LinearMafRendering = observer(function (props) {
    const { items, displayModel, height, samples, flatbush } = props;
    const ref = useRef(null);
    const flatbush2 = useMemo(() => Flatbush.from(flatbush), [flatbush]);
    const [isOverInsertion, setIsOverInsertion] = useState(false);
    const getFeatureUnderMouse = useCallback((eventClientX, eventClientY) => {
        let offsetX = 0;
        let offsetY = 0;
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            offsetX = eventClientX - rect.left;
            offsetY = eventClientY - rect.top;
        }
        const hits = flatbush2.search(offsetX, offsetY, offsetX + 1, offsetY + 1);
        if (hits.length === 0) {
            return undefined;
        }
        const insertionHit = hits.find(idx => items[idx]?.isInsertion);
        const hitIdx = insertionHit ?? hits[0];
        const item = hitIdx !== undefined ? items[hitIdx] : undefined;
        if (!item) {
            return undefined;
        }
        const sample = samples[item.rowIndex];
        return {
            ...item,
            sampleId: sample?.id ?? 'unknown',
            sampleLabel: sample?.label || sample?.id || 'unknown',
        };
    }, [flatbush2, items, samples]);
    return (React.createElement("div", { ref: ref, onClick: e => {
            const feature = getFeatureUnderMouse(e.clientX, e.clientY);
            if (feature?.isInsertion) {
                displayModel.showInsertionSequenceDialog?.({
                    sequence: feature.base,
                    sampleLabel: feature.sampleLabel,
                    chr: feature.chr,
                    pos: feature.pos,
                });
            }
        }, onMouseMove: e => {
            const feature = getFeatureUnderMouse(e.clientX, e.clientY);
            displayModel.setHoveredInfo?.(feature);
            displayModel.setHighlightedRowNames?.(feature?.sampleId ? [feature.sampleId] : undefined);
            setIsOverInsertion(!!feature?.isInsertion);
        }, onMouseLeave: () => {
            displayModel.setHoveredInfo?.(undefined);
            displayModel.setHighlightedRowNames?.(undefined);
            setIsOverInsertion(false);
        }, style: {
            overflow: 'visible',
            position: 'relative',
            height,
            cursor: isOverInsertion ? 'pointer' : 'default',
        } },
        React.createElement(PrerenderedCanvas, { ...props, style: {
                position: 'absolute',
                left: 0,
            } })));
});
export default LinearMafRendering;
//# sourceMappingURL=LinearMafRendering.js.map