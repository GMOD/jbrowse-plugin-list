import React from 'react';
import type { MsaAlgorithm } from './consts';
declare const MsaAlgorithmSelect: ({ value, onChange, className, }: {
    value: MsaAlgorithm;
    onChange: (val: MsaAlgorithm) => void;
    className?: string;
}) => React.JSX.Element;
export default MsaAlgorithmSelect;
