import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { getGeneDisplayName, getTranscriptDisplayName, stripStopCodon, } from '../utils/util';
export default function TranscriptSelector({ val, setVal, isoforms, isoformSequences, structureSequence, feature, disabled, }) {
    const geneName = getGeneDisplayName(feature);
    const matches = [];
    const nonMatches = [];
    const noData = [];
    for (const f of isoforms) {
        const entry = isoformSequences[f.id()];
        if (!entry) {
            noData.push(f);
        }
        else if (structureSequence &&
            stripStopCodon(entry.seq) === structureSequence) {
            matches.push(f);
        }
        else {
            nonMatches.push(f);
        }
    }
    matches.sort((a, b) => isoformSequences[b.id()].seq.length -
        isoformSequences[a.id()].seq.length);
    nonMatches.sort((a, b) => isoformSequences[b.id()].seq.length -
        isoformSequences[a.id()].seq.length);
    return (React.createElement(TextField, { value: val, onChange: event => {
            setVal(event.target.value);
        }, label: "Choose transcript isoform", select: true, disabled: disabled },
        matches.map(f => (React.createElement(MenuItem, { value: f.id(), key: f.id() },
            geneName,
            " - ",
            getTranscriptDisplayName(f),
            " (",
            isoformSequences[f.id()].seq.length,
            "aa) (matches structure residues)"))),
        nonMatches.map(f => (React.createElement(MenuItem, { value: f.id(), key: f.id() },
            geneName,
            " - ",
            getTranscriptDisplayName(f),
            " (",
            isoformSequences[f.id()].seq.length,
            "aa)"))),
        noData.map(f => (React.createElement(MenuItem, { value: f.id(), key: f.id(), disabled: true },
            geneName,
            " - ",
            getTranscriptDisplayName(f),
            " (no data)")))));
}
//# sourceMappingURL=TranscriptSelector.js.map