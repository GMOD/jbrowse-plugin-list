import React from 'react';
import type { BlastLookupMethod } from './BlastPanel';
declare const BlastMethodSelector: ({ lookupMethod, setLookupMethod, }: {
    lookupMethod: BlastLookupMethod;
    setLookupMethod: (method: BlastLookupMethod) => void;
}) => React.JSX.Element;
export default BlastMethodSelector;
