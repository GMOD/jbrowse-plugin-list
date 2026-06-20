import React from 'react';
import type { Sample } from '../types';
interface LabelsCanvasProps {
    samples: Sample[];
    labelWidth: number;
    scrollTop: number;
    containerHeight: number;
}
export default function LabelsCanvas({ samples, labelWidth, scrollTop, containerHeight, }: LabelsCanvasProps): React.JSX.Element;
export {};
