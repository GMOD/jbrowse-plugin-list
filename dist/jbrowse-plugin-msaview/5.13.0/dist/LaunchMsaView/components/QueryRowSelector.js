import React from 'react';
import { Alert, MenuItem } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import TextField2 from '../../components/TextField2';
const useStyles = makeStyles()({
    field: {
        marginTop: 20,
    },
    alert: {
        marginTop: 10,
    },
});
/**
 * Where a trimmed row sits in the protein. The offset is what the view maps
 * through, so the alert says it rather than leaving the user to wonder why the
 * row is shorter than their transcript.
 */
function partialCoverage({ identity, offset, }) {
    const covering = `, covering ${Math.round(identity * 100)}% of it`;
    return offset > 0
        ? `${covering} from residue ${offset + 1}`
        : offset < 0
            ? `${covering} and running ${-offset} residues past its start`
            : covering;
}
/**
 * Which MSA row corresponds to the selected transcript. Clicking and hovering in
 * the alignment reach the genome only through this name, and a wrong one fails
 * silently -- the view opens, renders, and never navigates -- so the field fills
 * itself in from the pasted alignment and offers that alignment's own row names
 * rather than a free text box the user can typo.
 */
export default function QueryRowSelector({ names, detected, querySeqName, setQuerySeqName, isAutoDetected, }) {
    const { classes } = useStyles();
    return (React.createElement(React.Fragment, null,
        names.length > 0 ? (React.createElement(TextField2, { variant: "outlined", label: "MSA row matching the selected transcript", select: true, fullWidth: true, className: classes.field, value: names.includes(querySeqName) ? querySeqName : '', onChange: event => {
                setQuerySeqName(event.target.value);
            } }, names.map(name => (React.createElement(MenuItem, { value: name, key: name },
            name,
            detected?.name === name ? ' — matches your protein' : ''))))) : (React.createElement(TextField2, { variant: "outlined", label: "MSA row matching the selected transcript", fullWidth: true, className: classes.field, helperText: "Paste an alignment above and this fills in on its own", value: querySeqName, onChange: event => {
                setQuerySeqName(event.target.value);
            } })),
        isAutoDetected && detected ? (detected.quality === 'similar' ? (React.createElement(Alert, { severity: "warning", className: classes.alert },
            React.createElement("strong", null, detected.name),
            " is",
            ' ',
            Math.round(detected.identity * 100),
            "% identical to your protein but is not the same sequence. Clicking the alignment navigates the genome view, approximately: wherever the two differ by an insertion or a deletion, every residue after it lands one codon off.")) : (React.createElement(Alert, { severity: "success", className: classes.alert },
            "Matched ",
            React.createElement("strong", null, detected.name),
            " to your protein sequence",
            detected.quality === 'exact' ? '' : partialCoverage(detected),
            ". Clicking the alignment will navigate the genome view."))) : names.length > 0 && !querySeqName ? (React.createElement(Alert, { severity: "warning", className: classes.alert }, "No row matched your protein sequence \u2014 pick the one for your gene above. Without it the alignment still renders, but clicking it will not navigate the genome view.")) : null));
}
