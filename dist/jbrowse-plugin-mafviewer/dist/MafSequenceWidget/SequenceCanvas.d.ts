import React from 'react';
import type { Sample } from '../types';
interface SequenceCanvasProps {
    samples: Sample[];
    sequences: string[];
    colorBackground: boolean;
    hoveredCol?: number;
    scrollTop: number;
    scrollLeft: number;
    containerHeight: number;
    containerWidth: number;
    onHover: (col: number | undefined, row: number | undefined, clientX: number, clientY: number) => void;
    onLeave: () => void;
}
export default function SequenceCanvas({ samples, sequences, colorBackground, hoveredCol, scrollTop, scrollLeft, containerHeight, containerWidth, onHover, onLeave, }: SequenceCanvasProps): React.JSX.Element;
export {};
