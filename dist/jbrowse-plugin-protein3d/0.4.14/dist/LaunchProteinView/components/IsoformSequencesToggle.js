import React, { useState } from 'react';
import { Button } from '@mui/material';
import MSATable from './MSATable';
export default function IsoformSequencesToggle({ structureSequence, structureName, isoformSequences, }) {
    const [show, setShow] = useState(false);
    return (React.createElement("div", { style: { margin: 10 } },
        React.createElement(Button, { variant: "contained", color: "primary", onClick: () => {
                setShow(!show);
            } }, show
            ? 'Hide all isoform protein sequences'
            : 'Show all isoform protein sequences'),
        show ? (React.createElement(MSATable, { structureSequence: structureSequence, structureName: structureName, isoformSequences: isoformSequences })) : null));
}
