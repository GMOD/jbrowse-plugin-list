import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import MsaAlgorithmSelect from './MsaAlgorithmSelect';
import { blastLaunchView } from './blastLaunchView';
import ExternalLink from '../../../components/ExternalLink';
import TextField2 from '../../../components/TextField2';
import { getBlastViewTitle, getLinearGenomeView } from '../../util';
import LaunchPanelContent from '../LaunchPanelContent';
import SubmitCancelActions from '../SubmitCancelActions';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
const useStyles = makeStyles()({
    marginBottom: {
        marginBottom: 16,
    },
    ridField: {
        width: 150,
    },
    infoText: {
        marginTop: 20,
    },
});
const NCBIBlastRIDPanel = observer(function ({ handleClose, feature, model, children, baseUrl, }) {
    const { classes } = useStyles();
    const view = getLinearGenomeView(model);
    const [launchViewError, setLaunchViewError] = useState();
    const [rid, setRid] = useState('');
    const [selectedMsaAlgorithm, setSelectedMsaAlgorithm] = useState('clustalo');
    const transcriptSelection = useTranscriptSelection({ feature, view });
    const { selectedTranscript, proteinSequence } = transcriptSelection;
    const e = transcriptSelection.error ?? launchViewError;
    const trimmedRid = rid.trim();
    return (React.createElement(React.Fragment, null,
        React.createElement(LaunchPanelContent, { error: e },
            children,
            React.createElement(Typography, { variant: "body2", className: classes.marginBottom }, "Enter the RID (Request ID) from a previously submitted NCBI BLAST query. You can find the RID in the BLAST results page URL or at the top of the results page. RIDs are typically valid for 24-36 hours after submission."),
            React.createElement(TextField2, { variant: "outlined", label: "BLAST RID", placeholder: "e.g., ABC12345", fullWidth: true, className: classes.marginBottom, value: rid, onChange: event => {
                    setRid(event.target.value);
                } }),
            trimmedRid ? (React.createElement(Typography, { variant: "body2", className: classes.marginBottom },
                React.createElement(ExternalLink, { href: `${baseUrl}?CMD=Get&RID=${trimmedRid}` }, "View BLAST results on NCBI"))) : null,
            React.createElement(MsaAlgorithmSelect, { className: classes.ridField, value: selectedMsaAlgorithm, onChange: setSelectedMsaAlgorithm }),
            React.createElement(TranscriptSelector, { feature: feature, ...transcriptSelection }),
            React.createElement(Typography, { className: classes.infoText }, "This will fetch the BLAST results for the provided RID and run them through a multiple sequence alignment. The protein sequence from the selected transcript will be added as the query sequence in the MSA.")),
        React.createElement(SubmitCancelActions, { submitDisabled: !proteinSequence || !trimmedRid, onSubmit: () => {
                try {
                    if (selectedTranscript && trimmedRid) {
                        setLaunchViewError(undefined);
                        blastLaunchView({
                            feature: selectedTranscript,
                            view,
                            newViewTitle: getBlastViewTitle(feature, selectedTranscript),
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
                        handleClose();
                    }
                }
                catch (e) {
                    console.error(e);
                    setLaunchViewError(e);
                }
            }, onCancel: handleClose })));
});
export default NCBIBlastRIDPanel;
//# sourceMappingURL=NCBIBlastRIDPanel.js.map