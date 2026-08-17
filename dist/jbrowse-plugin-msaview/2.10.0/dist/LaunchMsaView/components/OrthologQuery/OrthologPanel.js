import React, { useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import QuerySpeciesSelect from './QuerySpeciesSelect';
import { orthologLaunchView } from './orthologLaunchView';
import TextField2 from '../../../components/TextField2';
import { defaultMaxSpecies } from '../../../utils/ncbiOrthologs';
import { getGeneDisplayName, getGeneIdentifiers, getLinearGenomeView, getTranscriptDisplayName, } from '../../util';
import MsaAlgorithmSelect from '../BlastQuery/MsaAlgorithmSelect';
import LaunchPanelContent from '../LaunchPanelContent';
import SubmitCancelActions from '../SubmitCancelActions';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
const useStyles = makeStyles()({
    selectField: {
        width: 180,
    },
});
const OrthologPanel = observer(function ({ handleClose, feature, model, }) {
    const { classes } = useStyles();
    const view = getLinearGenomeView(model);
    const [launchViewError, setLaunchViewError] = useState();
    const [taxId, setTaxId] = useState(9606);
    const [msaAlgorithm, setMsaAlgorithm] = useState('clustalo');
    const [maxSpecies, setMaxSpecies] = useState(String(defaultMaxSpecies));
    const geneCandidates = useMemo(() => getGeneIdentifiers(feature), [feature]);
    const transcriptSelection = useTranscriptSelection({ feature, view });
    const { selectedTranscript, proteinSequence } = transcriptSelection;
    const e = transcriptSelection.error ?? launchViewError;
    const rowCount = Number(maxSpecies);
    const rowCountValid = Number.isInteger(rowCount) && rowCount >= 2;
    return (React.createElement(React.Fragment, null,
        React.createElement(LaunchPanelContent, { error: e },
            React.createElement(Typography, { variant: "body2" }, "NCBI's precomputed orthologs, one gene per species, looked up rather than searched for. No BLAST job to queue."),
            React.createElement("div", null,
                React.createElement(QuerySpeciesSelect, { className: classes.selectField, value: taxId, onChange: setTaxId }),
                React.createElement(MsaAlgorithmSelect, { className: classes.selectField, value: msaAlgorithm, onChange: setMsaAlgorithm }),
                React.createElement(TextField2, { variant: "outlined", label: "Rows to align", className: classes.selectField, type: "number", value: maxSpecies, onChange: event => {
                        setMaxSpecies(event.target.value);
                    }, error: !rowCountValid, helperText: "the closest N species NCBI has" })),
            React.createElement(TranscriptSelector, { feature: feature, ...transcriptSelection })),
        React.createElement(SubmitCancelActions, { submitDisabled: !proteinSequence || !rowCountValid, onSubmit: () => {
                try {
                    if (selectedTranscript) {
                        setLaunchViewError(undefined);
                        orthologLaunchView({
                            feature: selectedTranscript,
                            view,
                            newViewTitle: `Orthologs - ${getGeneDisplayName(feature)} - ${getTranscriptDisplayName(selectedTranscript)}`,
                            orthologParams: {
                                taxId,
                                maxSpecies: rowCount,
                                geneCandidates,
                                msaAlgorithm,
                                selectedTranscript,
                                proteinSequence,
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
export default OrthologPanel;
