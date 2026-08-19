import React from 'react';
import type { MsaAlgorithm } from './consts';
export default function MsaAlgorithmSelect({ value, onChange, className, }: {
    value: MsaAlgorithm;
    onChange: (val: MsaAlgorithm) => void;
    className?: string;
}): React.JSX.Element;
