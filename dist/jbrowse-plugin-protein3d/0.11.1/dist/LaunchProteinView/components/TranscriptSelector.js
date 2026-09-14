import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { classifyIsoforms } from '../utils/isoformRanking';
import { getGeneDisplayName, getTranscriptDisplayName, stripStopCodon, } from '../utils/util';
export default function TranscriptSelector({ val, setVal, isoforms, isoformSequences, structureSequence, feature, disabled, }) {
    const geneName = getGeneDisplayName(feature);
    const { matches, nonMatches, noData } = classifyIsoforms({
        options: isoforms,
        isoformSequences,
        structureSequence,
    });
    const structureLength = structureSequence
        ? stripStopCodon(structureSequence).length
        : undefined;
    const renderOption = ({ feature: f, length, identical }, note = identical === undefined
        ? ''
        : ` (${identical}/${structureLength} structure residues identical)`) => (React.createElement(MenuItem, { value: f.id(), key: f.id() },
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
