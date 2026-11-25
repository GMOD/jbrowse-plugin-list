import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import TextField2 from '../../components/TextField2';
const useStyles = makeStyles()({
    textAreaFont: {
        fontFamily: 'Courier New',
    },
    msaInput: {
        marginBottom: 20,
    },
});
const PastedAlignmentFields = observer(function PastedAlignmentFields({ msaText, setMsaText, treeText, setTreeText, }) {
    const { classes } = useStyles();
    return (React.createElement(React.Fragment, null,
        React.createElement(TextField2, { variant: "outlined", label: "Alignment", name: "MSA", multiline: true, minRows: 5, maxRows: 10, fullWidth: true, className: classes.msaInput, slotProps: { input: { className: classes.textAreaFont } }, placeholder: "Paste the alignment here (Clustal, aligned FASTA, Stockholm, ...)", value: msaText, onChange: event => {
                setMsaText(event.target.value);
            } }),
        React.createElement(TextField2, { variant: "outlined", label: "Tree (optional)", name: "Tree", multiline: true, minRows: 3, maxRows: 10, fullWidth: true, slotProps: { input: { className: classes.textAreaFont } }, placeholder: "Paste a Newick tree here", value: treeText, onChange: event => {
                setTreeText(event.target.value);
            } })));
});
export default PastedAlignmentFields;
