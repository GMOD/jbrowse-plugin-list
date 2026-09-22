import React, { useState } from 'react';
import { FileSelector } from '@jbrowse/core/ui';
import { openLocation } from '@jbrowse/core/util/io';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import TextField2 from '../../../components/TextField2';
import { useDebounced, useFetch } from '../../../utils/useFetch';
import { useQueryRowName } from '../../useQueryRowName';
import { getGeneDisplayName, getLinearGenomeView } from '../../util';
import LaunchPanelContent from '../LaunchPanelContent';
import QueryRowSelector from '../QueryRowSelector';
import SequenceStatusMessage from '../SequenceStatus';
import SubmitCancelActions from '../SubmitCancelActions';
import TranscriptSelector from '../TranscriptSelector';
import { launchConnectedView, useLaunchSubmit } from '../launchConnectedView';
import { useTranscriptSelection } from '../useTranscriptSelection';
/**
 * The chosen file's text, so its query row is found by sequence the way a
 * pasted alignment's is; without it a file launch named no row and never
 * linked to the genome. Debounced because a URL arrives a keystroke at a time.
 */
function useMsaFileText(location) {
    const debounced = useDebounced(location, 500);
    const { data } = useFetch(debounced ? [JSON.stringify(debounced), 'msa-file-text'] : null, () => openLocation(debounced).readFile('utf8'));
    return data ?? '';
}
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
});
const ManualMSALoader = observer(function PreLoadedMSA2({ model, feature, handleClose, preferredTranscriptId, }) {
    const view = getLinearGenomeView(model);
    const { classes } = useStyles();
    const { launchError, submit } = useLaunchSubmit(handleClose);
    const [inputMethod, setInputMethod] = useState('file');
    const [msaText, setMsaText] = useState('');
    const [treeText, setTreeText] = useState('');
    const [msaFileLocation, setMsaFileLocation] = useState();
    const [treeFileLocation, setTreeFileLocation] = useState();
    const transcriptSelection = useTranscriptSelection({
        feature,
        view,
        preferredTranscriptId,
    });
    const { selectedTranscript, proteinSequence, error, sequenceStatus } = transcriptSelection;
    const msaFileText = useMsaFileText(inputMethod === 'file' ? msaFileLocation : undefined);
    const queryRow = useQueryRowName(inputMethod === 'file' ? msaFileText : msaText, proteinSequence);
    const e = launchError ?? error;
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
            React.createElement(QueryRowSelector, { ...queryRow })),
        React.createElement(SubmitCancelActions, { model: model, hint: React.createElement(SequenceStatusMessage, { status: sequenceStatus }), submitDisabled: !selectedTranscript ||
                (inputMethod === 'file' && !msaFileLocation) ||
                (inputMethod === 'text' && !msaText.trim()), onSubmit: placement => {
                if (selectedTranscript) {
                    submit(() => {
                        launchConnectedView({
                            view,
                            feature: selectedTranscript,
                            placement,
                            displayName: getGeneDisplayName(selectedTranscript),
                            querySeqName: queryRow.querySeqName,
                            querySeqOffset: queryRow.querySeqOffset,
                            ...(inputMethod === 'file'
                                ? {
                                    msaFilehandle: msaFileLocation,
                                    treeFilehandle: treeFileLocation,
                                }
                                : { data: { msa: msaText, tree: treeText } }),
                        });
                    });
                }
            }, onCancel: handleClose })));
});
export default ManualMSALoader;
