import React from 'react';
import type { BlastLookupMethod } from './BlastPanel';
export default function BlastMethodSelector({ lookupMethod, setLookupMethod, }: {
    lookupMethod: BlastLookupMethod;
    setLookupMethod: (method: BlastLookupMethod) => void;
}): React.JSX.Element;
