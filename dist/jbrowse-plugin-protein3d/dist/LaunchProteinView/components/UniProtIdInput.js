import React from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, } from '@mui/material';
import ExternalLink from '../../components/ExternalLink';
/**
 * Component to handle UniProt ID input mode selection
 */
export default function UniProtIdInput({ lookupMode, onLookupModeChange, manualUniprotId, onManualUniprotIdChange, featureUniprotId, hasProteinSequence, sequenceSearchType, onSequenceSearchTypeChange, endContent, }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap' } },
            React.createElement(FormControl, { component: "fieldset" },
                React.createElement(RadioGroup, { row: true, value: lookupMode, onChange: event => {
                        onLookupModeChange(event.target.value);
                    } },
                    featureUniprotId && (React.createElement(FormControlLabel, { value: "feature", control: React.createElement(Radio, null), label: `From feature (${featureUniprotId})` })),
                    React.createElement(FormControlLabel, { value: "auto", control: React.createElement(Radio, null), label: "Auto-detect using UniProt ID mapping API" }),
                    React.createElement(FormControlLabel, { value: "manual", control: React.createElement(Radio, null), label: "Enter manually" }),
                    hasProteinSequence && (React.createElement(FormControlLabel, { value: "sequence", control: React.createElement(Radio, null), label: "Search sequence against AlphaFoldDB API" })))),
            endContent),
        lookupMode === 'manual' && (React.createElement("div", null,
            React.createElement(TextField, { label: "UniProt ID", variant: "outlined", placeholder: "e.g. P68871", size: "small", value: manualUniprotId, onChange: e => {
                    onManualUniprotIdChange(e.target.value);
                } }))),
        lookupMode === 'sequence' &&
            sequenceSearchType &&
            onSequenceSearchTypeChange && (React.createElement("div", null,
            React.createElement(FormControl, { component: "fieldset" },
                React.createElement(RadioGroup, { row: true, value: sequenceSearchType, onChange: event => {
                        onSequenceSearchTypeChange(event.target.value);
                    } },
                    React.createElement(FormControlLabel, { value: "md5", control: React.createElement(Radio, null), label: "Exact match" }),
                    React.createElement(FormControlLabel, { value: "sequence", control: React.createElement(Radio, null), label: "Fuzzy match" }))),
            React.createElement(Typography, { variant: "body2", color: "text.secondary" }, "May not find the canonical UniProt entry."))),
        lookupMode === 'manual' && !manualUniprotId && (React.createElement(Typography, { variant: "body2", color: "text.secondary" },
            "Search",
            ' ',
            React.createElement(ExternalLink, { href: "https://www.uniprot.org/" }, "UniProt"),
            ' or ',
            React.createElement(ExternalLink, { href: "https://alphafold.ebi.ac.uk/" }, "AlphaFoldDB")))));
}
//# sourceMappingURL=UniProtIdInput.js.map