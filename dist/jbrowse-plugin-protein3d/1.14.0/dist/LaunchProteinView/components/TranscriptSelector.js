import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { stripStopCodon } from 'p2s_mapper';
import { getGeneDisplayName, getTranscriptDisplayName } from '../utils/util';
export default function TranscriptSelector({ val, setVal, isoforms, ranking, structureSequence, feature, disabled, }) {
    const geneName = getGeneDisplayName(feature);
    const byId = new Map(isoforms.map(f => [f.id(), f]));
    // A ranked isoform carries an id rather than the feature, so the name is a
    // lookup, and a row with no name at all reads worse than a bare id.
    const nameOf = (id) => getTranscriptDisplayName(byId.get(id)) || id;
    const { matches, nonMatches, noData } = ranking;
    const structureLength = structureSequence
        ? stripStopCodon(structureSequence).length
        : undefined;
    const renderOption = ({ id, length, identical }, note = identical === undefined
        ? ''
        : ` (${identical}/${structureLength} structure residues identical)`) => (React.createElement(MenuItem, { value: id, key: id },
        geneName,
        " - ",
        nameOf(id),
        " (",
        length,
        "aa)",
        note));
    return (React.createElement(TextField, { value: val ?? '', onChange: event => {
            setVal(event.target.value);
        }, label: "Choose transcript isoform", select: true, disabled: disabled },
        matches.map(m => renderOption(m, ' (matches structure residues)')),
        nonMatches.map(m => renderOption(m)),
        noData.map(id => (React.createElement(MenuItem, { value: id, key: id, disabled: true },
            geneName,
            " - ",
            nameOf(id),
            " (no data)")))));
}
