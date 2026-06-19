import React from 'react';
import type { Sample } from '../types';
interface SequenceTooltipProps {
    x: number;
    y: number;
    sample: Sample;
    base?: string;
    genomicPos?: number;
}
export default function SequenceTooltip({ x, y, sample, base, genomicPos, }: SequenceTooltipProps): React.JSX.Element;
export {};
