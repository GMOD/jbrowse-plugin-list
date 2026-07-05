import React, { useState } from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select, } from '@mui/material';
import { getDbIdLabel } from '../utils/util';
export default function IdentifierSelector({ recognizedIds, geneName, selectedId, onSelectedIdChange, }) {
    const [expanded, setExpanded] = useState(false);
    // Build list of selectable options
    const options = [
        { value: 'auto', label: 'Auto (try all)' },
        ...recognizedIds.map(id => ({ value: id, label: getDbIdLabel(id) })),
    ];
    if (geneName) {
        options.push({
            value: `gene:${geneName}`,
            label: `${geneName} (gene name)`,
        });
    }
    if (recognizedIds.length === 0 && !geneName) {
        return null;
    }
    if (!expanded) {
        return (React.createElement(Button, { size: "small", variant: "text", onClick: () => {
                setExpanded(true);
            } }, "Choose identifier to query..."));
    }
    return (React.createElement(FormControl, { size: "small" },
        React.createElement(InputLabel, null, "Query UniProt by"),
        React.createElement(Select, { value: selectedId, label: "Query UniProt by", onChange: e => {
                onSelectedIdChange(e.target.value);
            } }, options.map(opt => (React.createElement(MenuItem, { key: opt.value, value: opt.value }, opt.label))))));
}
