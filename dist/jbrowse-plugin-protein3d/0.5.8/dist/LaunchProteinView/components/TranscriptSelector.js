import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { classifyIsoforms, getGeneDisplayName, getTranscriptDisplayName, } from '../utils/util';
export default function TranscriptSelector({ val, setVal, isoforms, isoformSequences, structureSequence, feature, disabled, }) {
    const geneName = getGeneDisplayName(feature);
    const { matches, nonMatches, noData } = classifyIsoforms({
        options: isoforms,
        isoformSequences,
        structureSequence,
    });
    const renderOption = ({ feature: f, length }, note = '') => (React.createElement(MenuItem, { value: f.id(), key: f.id() },
        geneName,
        " - ",
        getTranscriptDisplayName(f),
        " (",
        length,
        "aa)",
        note));
    return (React.createElement(TextField, { value: val ?? '', onChange: event => {
            setVal(event.target.value);
        }, label: "Choose transcript isoform", select: true, disabled: disabled },
        matches.map(m => renderOption(m, ' (matches structure residues)')),
        nonMatches.map(m => renderOption(m)),
        noData.map(f => (React.createElement(MenuItem, { value: f.id(), key: f.id(), disabled: true },
            geneName,
            " - ",
            getTranscriptDisplayName(f),
            " (no data)")))));
}
