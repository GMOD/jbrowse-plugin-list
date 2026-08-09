import React from 'react';
import type { BlastLookupMethod } from './NCBIBlastPanel';
export default function NCBIBlastMethodSelector({ lookupMethod, setLookupMethod, }: {
    lookupMethod: BlastLookupMethod;
    setLookupMethod: (method: BlastLookupMethod) => void;
}): React.JSX.Element;
