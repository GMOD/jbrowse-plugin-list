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
});
export default function TranscriptSelector({ feature, options, selectedId, selectedTranscript, onTranscriptChange, proteinSequence, validSet, }) {
    const { classes } = useStyles();
    const [showSequence, setShowSequence] = useState(false);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: classes.flex },
            React.createElement(TextField, { variant: "outlined", label: `Choose isoform of ${getGeneDisplayName(feature)}`, select: true, className: classes.minWidth, value: selectedId, onChange: event => {
                    onTranscriptChange(event.target.value);
                } }, options.map(val => {
                const inSet = validSet
                    ? [...validSet].some(id => featureMatchesId(val, id))
                    : true;
                const { len, mod } = getTranscriptLength(val);
                return (React.createElement(MenuItem, { value: getId(val), key: val.id(), disabled: !inSet },
                    getTranscriptDisplayName(val),
                    " (",
                    len,
                    " aa)",
                    ' ',
                    mod ? ` (possible fragment)` : '',
                    validSet ? (inSet ? ' (has data)' : ' (no data)') : ''));
            })),
            React.createElement("div", { style: { alignContent: 'center', marginLeft: 20 } },
                React.createElement(Button, { variant: "contained", color: "primary", onClick: () => {
                        setShowSequence(!showSequence);
                    } }, showSequence ? 'Hide sequence' : 'Show sequence'))),
        showSequence && (React.createElement(ReadOnlyTextField2, { value: proteinSequence
                ? `>${getTranscriptDisplayName(selectedTranscript)}\n${proteinSequence}`
                : 'Loading...' }))));
}
//# sourceMappingURL=TranscriptSelector.js.map