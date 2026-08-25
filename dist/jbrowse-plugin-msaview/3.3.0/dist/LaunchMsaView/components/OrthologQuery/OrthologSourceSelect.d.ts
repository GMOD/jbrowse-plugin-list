import React from 'react';
import type { OrthologSource } from '../../../MsaViewPanel/model';
export declare const ORTHOLOG_SOURCE_STORAGE_KEY = "msaview-ortholog-source";
export declare const orthologSourceLabels: Record<OrthologSource, string>;
export default function OrthologSourceSelect({ value, onChange, className, }: {
    value: OrthologSource;
    onChange: (val: OrthologSource) => void;
    className?: string;
}): React.JSX.Element;
