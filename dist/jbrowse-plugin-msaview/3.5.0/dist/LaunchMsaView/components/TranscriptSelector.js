import React, { useState } from 'react';
import { Button, MenuItem, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import ReadOnlyTextField2 from '../../components/ReadOnlyTextField2';
import { featureMatchesId, getGeneDisplayName, getId, getTranscriptDisplayName, getTranscriptLength, } from '../util';
const useStyles = makeStyles()({
    flex: {
        display: 'flex',
    },
    minWidth: {
        minWidth: 300,
    },
    centered: {
        alignContent: 'center',
        marginLeft: 20,
    },
});
export default function TranscriptSelector({ feature, options, selectedId, selectedTranscript, setSelectedId, proteinSequence, validIds, }) {
    const { classes } = useStyles();
    const [showSequence, setShowSequence] = useState(false);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: classes.flex },
            React.createElement(TextField, { variant: "outlined", label: `Choose isoform of ${getGeneDisplayName(feature)}`, 
                // The query row is this transcript rather than NCBI's representative
                // protein, which is what keeps the alignment linked to the genome view
                // at codon resolution. It used to be a paragraph under the panel; as
                // helper text it says the same thing where the choice is made and
                // costs no height of its own.
                helperText: "the query row, so the alignment stays linked to the genome view", select: true, className: classes.minWidth, value: selectedId, onChange: event => {
                    setSelectedId(event.target.value);
                } }, options.map(val => {
                const inSet = validIds
                    ? validIds.some(id => featureMatchesId(val, id))
                    : true;
                const { len, mod } = getTranscriptLength(val);
                return (React.createElement(MenuItem, { value: getId(val), key: val.id(), disabled: !inSet },
                    getTranscriptDisplayName(val),
                    " (",
                    len,
                    " aa)",
                    ' ',
                    mod ? ` (possible fragment)` : '',
                    validIds ? (inSet ? ' (has data)' : ' (no data)') : ''));
            })),
            React.createElement("div", { className: classes.centered },
                React.createElement(Button, { variant: "contained", color: "primary", onClick: () => {
                        setShowSequence(!showSequence);
                    } }, showSequence ? 'Hide sequence' : 'Show sequence'))),
        showSequence ? (React.createElement(ReadOnlyTextField2, { value: proteinSequence
                ? `>${getTranscriptDisplayName(selectedTranscript)}\n${proteinSequence}`
                : 'Loading...' })) : null));
}
