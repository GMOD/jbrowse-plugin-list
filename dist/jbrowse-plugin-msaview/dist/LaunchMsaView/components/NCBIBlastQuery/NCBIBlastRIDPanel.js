import React, { useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import { getContainingView, } from '@jbrowse/core/util';
import { Button, DialogActions, DialogContent, MenuItem, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { blastLaunchView } from './blastLaunchView';
import ExternalLink from '../../../components/ExternalLink';
import TextField2 from '../../../components/TextField2';
import { getGeneDisplayName, getTranscriptDisplayName } from '../../util';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
const useStyles = makeStyles()({
    dialogContent: {
        width: '80em',
    },
});
const msaAlgorithms = ['clustalo', 'muscle', 'kalign', 'mafft'];
const NCBIBlastRIDPanel = observer(function ({ handleClose, feature, model, children, baseUrl, }) {
    const { classes } = useStyles();
    const view = getContainingView(model);
    const [launchViewError, setLaunchViewError] = useState();
    const [rid, setRid] = useState('');
    const [selectedMsaAlgorithm, setSelectedMsaAlgorithm] = useState('clustalo');
    const { options, selectedId, setSelectedId, selectedTranscript, proteinSequence, error: proteinSequenceError, } = useTranscriptSelection({ feature, view });
    const e = proteinSequenceError ?? launchViewError;
    const style = { width: 150 };
    const trimmedRid = rid.trim();
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            children,
            e ? React.createElement(ErrorMessage, { error: e }) : null,
            React.createElement(Typography, { variant: "body2", style: { marginBottom: 16 } }, "Enter the RID (Request ID) from a previously submitted NCBI BLAST query. You can find the RID in the BLAST results page URL or at the top of the results page. RIDs are typically valid for 24-36 hours after submission."),
            React.createElement(TextField2, { variant: "outlined", label: "BLAST RID", placeholder: "e.g., ABC12345", fullWidth: true, style: { marginBottom: 16 }, value: rid, onChange: event => {
                    setRid(event.target.value);
                } }),
            trimmedRid ? (React.createElement(Typography, { variant: "body2", style: { marginBottom: 16 } },
                React.createElement(ExternalLink, { href: `${baseUrl}?CMD=Get&RID=${trimmedRid}` }, "View BLAST results on NCBI"))) : null,
            React.createElement(TextField2, { variant: "outlined", label: "MSA Algorithm", style: style, select: true, value: selectedMsaAlgorithm, onChange: event => {
                    setSelectedMsaAlgorithm(event.target.value);
                } }, msaAlgorithms.map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))),
            React.createElement(TranscriptSelector, { feature: feature, options: options, selectedId: selectedId, selectedTranscript: selectedTranscript, onTranscriptChange: setSelectedId, proteinSequence: proteinSequence }),
            React.createElement(Typography, { style: { marginTop: 20 } }, "This will fetch the BLAST results for the provided RID and run them through a multiple sequence alignment. The protein sequence from the selected transcript will be added as the query sequence in the MSA.")),
        React.createElement(DialogActions, null,
            React.createElement(Button, { color: "primary", variant: "contained", onClick: () => {
                    try {
                        if (!selectedTranscript || !trimmedRid) {
                            return;
                        }
                        setLaunchViewError(undefined);
                        blastLaunchView({
                            feature: selectedTranscript,
                            view,
                            newViewTitle: `BLAST - ${getGeneDisplayName(feature)} - ${getTranscriptDisplayName(selectedTranscript)}`,
                            blastParams: {
                                baseUrl,
                                blastProgram: 'blastp',
                                blastDatabase: 'nr',
                                msaAlgorithm: selectedMsaAlgorithm,
                                selectedTranscript,
                                proteinSequence,
                                rid: trimmedRid,
                            },
                        });
                    }
                    catch (e) {
                        console.error(e);
                        setLaunchViewError(e);
                    }
                    handleClose();
                }, disabled: !proteinSequence || !trimmedRid }, "Submit"),
            React.createElement(Button, { color: "secondary", variant: "contained", onClick: () => {
                    handleClose();
                } }, "Cancel"))));
});
export default NCBIBlastRIDPanel;
//# sourceMappingURL=NCBIBlastRIDPanel.js.map