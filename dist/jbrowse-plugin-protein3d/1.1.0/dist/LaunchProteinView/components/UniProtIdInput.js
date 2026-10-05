import React from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, } from '@mui/material';
import ExternalLink from '../../components/ExternalLink';
const LOOKUP_MODES = ['auto', 'manual', 'feature'];
function isLookupMode(value) {
    return LOOKUP_MODES.some(mode => mode === value);
}
export default function UniProtIdInput({ lookupMode, onLookupModeChange, manualUniprotId, onManualUniprotIdChange, featureUniprotId, hasSearchableIdentifier = true, endContent, }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap' } },
            React.createElement(FormControl, { component: "fieldset" },
                React.createElement(RadioGroup, { row: true, value: lookupMode, onChange: event => {
                        if (isLookupMode(event.target.value)) {
                            onLookupModeChange(event.target.value);
                        }
                    } },
                    featureUniprotId && (React.createElement(FormControlLabel, { value: "feature", control: React.createElement(Radio, null), label: `From feature (${featureUniprotId})` })),
                    hasSearchableIdentifier && (React.createElement(FormControlLabel, { value: "auto", control: React.createElement(Radio, null), label: "Look up from the feature's identifiers" })),
                    React.createElement(FormControlLabel, { value: "manual", control: React.createElement(Radio, null), label: "Enter manually" }))),
            endContent),
        lookupMode === 'manual' && (React.createElement("div", null,
            React.createElement(TextField, { autoFocus: true, label: "UniProt ID", variant: "outlined", placeholder: "e.g. P68871", size: "small", value: manualUniprotId, onChange: e => {
                    onManualUniprotIdChange(e.target.value);
                } }))),
        lookupMode === 'manual' && !manualUniprotId && (React.createElement(Typography, { variant: "body2", color: "text.secondary" },
            "Search",
            ' ',
            React.createElement(ExternalLink, { href: "https://www.uniprot.org/" }, "UniProt"),
            ' or ',
            React.createElement(ExternalLink, { href: "https://alphafold.ebi.ac.uk/" }, "AlphaFoldDB")))));
}
