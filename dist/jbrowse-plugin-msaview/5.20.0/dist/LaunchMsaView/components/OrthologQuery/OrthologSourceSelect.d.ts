import React from 'react';
import type { OrthologSource } from '../../../MsaViewPanel/model';
export declare function validOrthologSource(stored: unknown): OrthologSource;
export declare function useStoredOrthologSource(): readonly ["ncbi" | "panther" | "uniref", (source: OrthologSource) => void];
declare const OrthologSourceSelect: ({ value, onChange, className, }: {
    value: OrthologSource;
    onChange: (val: OrthologSource) => void;
    className?: string;
}) => React.JSX.Element;
export default OrthologSourceSelect;
