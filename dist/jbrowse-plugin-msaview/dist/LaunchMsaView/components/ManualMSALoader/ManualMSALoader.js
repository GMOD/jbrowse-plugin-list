import React, { useState } from 'react';
import { FileSelector } from '@jbrowse/core/ui';
import { getSession } from '@jbrowse/core/util';
import { Alert, FormControl, FormControlLabel, Radio, RadioGroup, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { launchView } from './launchView';
import TextField2 from '../../../components/TextField2';
import { getGeneDisplayName, getLinearGenomeView } from '../../util';
import LaunchPanelContent from '../LaunchPanelContent';
import SubmitCancelActions from '../SubmitCancelActions';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
const useStyles = makeStyles()({
    textAreaFont: {
        fontFamily: 'Courier New',
    },
    inputContainer: {
        marginBottom: 30,
    },
    fileContainer: {
        maxWidth: 500,
    },
    msaInput: {
        marginBottom: 20,
    },
    queryNameInput: {
        marginTop: 20,
    },
    warningAlert: {
        marginTop: 10,
    },
});
const ManualMSALoader = observer(function PreLoadedMSA2({ model, feature, handleClose, }) {
    const session = getSession(model);
    const view = getLinearGenomeView(model);
    const { classes } = useStyles();
    const [launchViewError, setLaunchViewError] = useState();
    const [inputMethod, setInputMethod] = useState('file');
    const [msaText, setMsaText] = useState('');
    const [treeText, setTreeText] = useState('');
    const [msaFileLocation, setMsaFileLocation] = useState();
    const [treeFileLocation, setTreeFileLocation] = useState();
    const [querySeqName, setQuerySeqName] = useState('');
    const transcriptSelection = useTranscriptSelection({ feature, view });
    const { selectedTranscript, error } = transcriptSelection;
    const e = launchViewError ?? error;
    return (React.createElement(React.Fragment, null,
        React.createElement(LaunchPanelContent, { error: e },
            React.createElement(FormControl, { component: "fieldset" },
                React.createElement(RadioGroup, { row: true, value: inputMethod, onChange: event => {
                        setInputMethod(event.target.value);
                    } },
                    React.createElement(FormControlLabel, { value: "file", control: React.createElement(Radio, null), label: "Open files" }),
                    React.createElement(FormControlLabel, { value: "text", control: React.createElement(Radio, null), label: "Paste text" }))),
            React.createElement("div", { className: classes.inputContainer }, inputMethod === 'file' ? (React.createElement("div", { className: classes.fileContainer },
                React.createElement(FileSelector, { name: "MSA File .aln (Clustal), .fa/.mfa (aligned FASTA), .stock (Stockholm), etc)", inline: true, location: msaFileLocation, setLocation: setMsaFileLocation }),
                React.createElement(FileSelector, { name: "Tree file .nh (Newick) or .asn (NCBI COBALT ASN.1)", inline: true, location: treeFileLocation, setLocation: setTreeFileLocation }))) : (React.createElement(React.Fragment, null,
                React.createElement(TextField2, { variant: "outlined", name: "MSA", multiline: true, minRows: 5, className: classes.msaInput, maxRows: 10, fullWidth: true, placeholder: "Paste MSA here", value: msaText, onChange: event => {
                        setMsaText(event.target.value);
                    } }),
                React.createElement(TextField2, { variant: "outlined", name: "Tree", multiline: true, minRows: 5, maxRows: 10, fullWidth: true, placeholder: "Paste newick tree (optional)", value: treeText, onChange: event => {
                        setTreeText(event.target.value);
                    } })))),
            React.createElement(TranscriptSelector, { feature: feature, ...transcriptSelection }),
            React.createElement(TextField2, { variant: "outlined", name: "MSA row name", fullWidth: true, required: true, className: classes.queryNameInput, placeholder: "Row name in MSA that corresponds to the selected transcript", helperText: "Required: Specify the name of the row in your MSA that should be aligned with the selected transcript", value: querySeqName, onChange: event => {
                    setQuerySeqName(event.target.value);
                } }),
            !querySeqName.trim() ? (React.createElement(Alert, { severity: "warning", className: classes.warningAlert }, "Without specifying the MSA row name, clicking on the MSA will not navigate to the corresponding genome position, and hovering highlights will not work.")) : null),
        React.createElement(SubmitCancelActions, { submitDisabled: !selectedTranscript ||
                (inputMethod === 'file' && !msaFileLocation) ||
                (inputMethod === 'text' && !msaText.trim()), onSubmit: () => {
                try {
                    if (selectedTranscript) {
                        setLaunchViewError(undefined);
                        launchView({
                            session,
                            newViewTitle: getGeneDisplayName(selectedTranscript),
                            view,
                            feature: selectedTranscript,
                            querySeqName: querySeqName.trim(),
                            ...(inputMethod === 'file'
                                ? {
                                    msaFilehandle: msaFileLocation,
                                    treeFilehandle: treeFileLocation,
                                }
                                : {
                                    data: {
                                        msa: msaText,
                                        tree: treeText,
                                    },
                                }),
                        });
                        handleClose();
                    }
                }
                catch (err) {
                    console.error(err);
                    setLaunchViewError(err);
                }
            }, onCancel: handleClose })));
});
export default ManualMSALoader;
//# sourceMappingURL=ManualMSALoader.js.map