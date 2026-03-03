import React, { useState } from 'react';
import { ErrorMessage, FileSelector } from '@jbrowse/core/ui';
import { getContainingView, getSession, } from '@jbrowse/core/util';
import { Alert, Button, DialogActions, DialogContent, FormControl, FormControlLabel, Radio, RadioGroup, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { launchView } from './launchView';
import TextField2 from '../../../components/TextField2';
import { getGeneDisplayName } from '../../util';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
const useStyles = makeStyles()({
    dialogContent: {
        width: '80em',
    },
    textAreaFont: {
        fontFamily: 'Courier New',
    },
});
const ManualMSALoader = observer(function PreLoadedMSA2({ model, feature, handleClose, }) {
    const session = getSession(model);
    const view = getContainingView(model);
    const { classes } = useStyles();
    const [launchViewError, setLaunchViewError] = useState();
    const [inputMethod, setInputMethod] = useState('file');
    const [msaText, setMsaText] = useState('');
    const [treeText, setTreeText] = useState('');
    const [msaFileLocation, setMsaFileLocation] = useState();
    const [treeFileLocation, setTreeFileLocation] = useState();
    const [querySeqName, setQuerySeqName] = useState('');
    const { options, selectedId, setSelectedId, selectedTranscript, proteinSequence, error: error2, } = useTranscriptSelection({ feature, view });
    const e = launchViewError ?? error2;
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            e ? React.createElement(ErrorMessage, { error: e }) : null,
            React.createElement(FormControl, { component: "fieldset" },
                React.createElement(RadioGroup, { row: true, value: inputMethod, onChange: event => {
                        setInputMethod(event.target.value);
                    } },
                    React.createElement(FormControlLabel, { value: "file", control: React.createElement(Radio, null), label: "Open files" }),
                    React.createElement(FormControlLabel, { value: "text", control: React.createElement(Radio, null), label: "Paste text" }))),
            React.createElement("div", { style: { marginBottom: 30 } }, inputMethod === 'file' ? (React.createElement("div", { style: { maxWidth: 500 } },
                React.createElement(FileSelector, { name: "MSA File .aln (Clustal), .fa/.mfa (aligned FASTA), .stock (Stockholm), etc)", inline: true, location: msaFileLocation, setLocation: setMsaFileLocation }),
                React.createElement(FileSelector, { name: "Tree file .nh (Newick) or .asn (NCBI COBALT ASN.1)", inline: true, location: treeFileLocation, setLocation: setTreeFileLocation }))) : (React.createElement(React.Fragment, null,
                React.createElement(TextField2, { variant: "outlined", name: "MSA", multiline: true, minRows: 5, style: { marginBottom: '20px' }, maxRows: 10, fullWidth: true, placeholder: "Paste MSA here", value: msaText, onChange: event => {
                        setMsaText(event.target.value);
                    } }),
                React.createElement(TextField2, { variant: "outlined", name: "Tree", multiline: true, minRows: 5, maxRows: 10, fullWidth: true, placeholder: "Paste newick tree (optional)", value: treeText, onChange: event => {
                        setTreeText(event.target.value);
                    } })))),
            React.createElement(TranscriptSelector, { feature: feature, options: options, selectedId: selectedId, selectedTranscript: selectedTranscript, onTranscriptChange: setSelectedId, proteinSequence: proteinSequence }),
            React.createElement(TextField2, { variant: "outlined", name: "MSA row name", fullWidth: true, required: true, style: { marginTop: 20 }, placeholder: "Row name in MSA that corresponds to the selected transcript", helperText: "Required: Specify the name of the row in your MSA that should be aligned with the selected transcript", value: querySeqName, onChange: event => {
                    setQuerySeqName(event.target.value);
                } }),
            !querySeqName.trim() && (React.createElement(Alert, { severity: "warning", style: { marginTop: 10 } }, "Without specifying the MSA row name, clicking on the MSA will not navigate to the corresponding genome position, and hovering highlights will not work."))),
        React.createElement(DialogActions, null,
            React.createElement(Button, { color: "primary", variant: "contained", disabled: !selectedTranscript ||
                    (inputMethod === 'file' && !msaFileLocation) ||
                    (inputMethod === 'text' && !msaText.trim()), onClick: () => {
                    try {
                        if (!selectedTranscript) {
                            return;
                        }
                        setLaunchViewError(undefined);
                        launchView({
                            session,
                            newViewTitle: getGeneDisplayName(selectedTranscript),
                            view,
                            feature: selectedTranscript,
                            querySeqName: querySeqName.trim() || undefined,
                            ...(inputMethod === 'file'
                                ? {
                                    msaFilehandle: msaFileLocation,
                                    treeFilehandle: treeFileLocation,
                                }
                                : {
                                    data: {
                                        msa: msaText,
                                        tree: treeText || undefined,
                                    },
                                }),
                        });
                        handleClose();
                    }
                    catch (e) {
                        console.error(e);
                        setLaunchViewError(e);
                    }
                } }, "Submit"),
            React.createElement(Button, { color: "secondary", variant: "contained", onClick: () => {
                    handleClose();
                } }, "Cancel"))));
});
export default ManualMSALoader;
//# sourceMappingURL=ManualMSALoader.js.map