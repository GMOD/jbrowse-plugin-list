import React, { useState } from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select, } from '@mui/material';
import { getDatabaseTypeForId } from '../utils/util';
function getIdLabel(id) {
    const dbType = getDatabaseTypeForId(id);
    if (dbType === 'refseq') {
        if (id.startsWith('NM_') || id.startsWith('XM_')) {
            return `${id} (RefSeq mRNA)`;
        }
        if (id.startsWith('NR_') || id.startsWith('XR_')) {
            return `${id} (RefSeq ncRNA)`;
        }
        if (id.startsWith('NP_') || id.startsWith('XP_')) {
            return `${id} (RefSeq protein)`;
        }
        return `${id} (RefSeq)`;
    }
    if (dbType === 'ensembl') {
        if (id.includes('G')) {
            return `${id} (Ensembl gene)`;
        }
        if (id.includes('T')) {
            return `${id} (Ensembl transcript)`;
        }
        if (id.includes('P')) {
            return `${id} (Ensembl protein)`;
        }
        return `${id} (Ensembl)`;
    }
    if (dbType === 'hgnc') {
        return `${id} (HGNC)`;
    }
    if (dbType === 'ccds') {
        return `${id} (CCDS)`;
    }
    return id;
}
export default function IdentifierSelector({ recognizedIds, uniprotId, geneName, selectedId, onSelectedIdChange, }) {
    const [expanded, setExpanded] = useState(false);
    // Build list of selectable options
    const options = [
        { value: 'auto', label: 'Auto (try all)' },
        ...recognizedIds.map(id => ({ value: id, label: getIdLabel(id) })),
    ];
    if (uniprotId) {
        options.push({
            value: `uniprot:${uniprotId}`,
            label: `${uniprotId} (UniProt)`,
        });
    }
    if (geneName) {
        options.push({
            value: `gene:${geneName}`,
            label: `${geneName} (gene name)`,
        });
    }
    if (recognizedIds.length === 0 && !uniprotId && !geneName) {
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
//# sourceMappingURL=IdentifierSelector.js.map