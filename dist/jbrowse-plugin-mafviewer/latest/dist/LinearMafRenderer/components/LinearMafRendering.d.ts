import React from 'react';
import type { Sample } from '../../types';
import type { RenderedBase } from '../rendering';
interface DisplayModel {
    setHoveredInfo?: (info: Record<string, unknown> | undefined) => void;
    setHighlightedRowNames?: (names: string[] | undefined) => void;
    showInsertionSequenceDialog?: (data: {
        sequence: string;
        sampleLabel: string;
        chr: string;
        pos: number;
    }) => void;
}
declare const LinearMafRendering: (props: {
    width: number;
    height: number;
    displayModel: DisplayModel;
    flatbush: ArrayBuffer;
    items: RenderedBase[];
    samples: Sample[];
}) => React.JSX.Element;
export default LinearMafRendering;
