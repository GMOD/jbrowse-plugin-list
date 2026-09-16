import React, { useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import TextField2 from '../../../components/TextField2';
import { defaultMaxSpecies } from '../../../utils/ncbiOrthologs';
import { useLocalStorage } from '../../../utils/useLocalStorage';
import { getGeneDisplayName, getGeneIdentifiers, getLinearGenomeView, getTranscriptDisplayName, } from '../../util';
import MsaAlgorithmSelect from '../BlastQuery/MsaAlgorithmSelect';
import { useStoredMsaAlgorithm } from '../BlastQuery/searchChoiceStorage';
import LaunchPanelContent from '../LaunchPanelContent';
import SequenceStatusMessage from '../SequenceStatus';
import SubmitCancelActions from '../SubmitCancelActions';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
import OrthologSourceSelect, { ORTHOLOG_SOURCE_STORAGE_KEY, } from './OrthologSourceSelect';
import QuerySpeciesSelect from './QuerySpeciesSelect';
import { orthologLaunchView } from './orthologLaunchView';
const useStyles = makeStyles()({
    selectField: {
        width: 180,
    },
});
// the N was literal: the helper text said "the closest N species" whatever the
// box held
const rowsHint = {
    ncbi: rows => `the ${rows} closest species NCBI has`,
    panther: rows => `the ${rows} closest species PANTHER has`,
    uniref: rows => `${rows} rows, one per species, reviewed entries first`,
};
const OrthologPanel = observer(function ({ handleClose, feature, model, preferredTranscriptId, }) {
    const { classes } = useStyles();
    const view = getLinearGenomeView(model);
    const [launchViewError, setLaunchViewError] = useState();
    const [taxId, setTaxId] = useState(9606);
    const [source, setSource] = useLocalStorage(ORTHOLOG_SOURCE_STORAGE_KEY, 'ncbi');
    const [msaAlgorithm, setMsaAlgorithm] = useStoredMsaAlgorithm();
    const [maxSpecies, setMaxSpecies] = useState(String(defaultMaxSpecies));
    const geneCandidates = useMemo(() => getGeneIdentifiers(feature), [feature]);
    const transcriptSelection = useTranscriptSelection({
        feature,
        view,
        preferredTranscriptId,
    });
    const { selectedTranscript, proteinSequence, sequenceStatus } = transcriptSelection;
    const e = transcriptSelection.error ?? launchViewError;
    const rowCount = Number(maxSpecies);
    const rowCountValid = Number.isInteger(rowCount) && rowCount >= 2;
    return (React.createElement(React.Fragment, null,
        React.createElement(LaunchPanelContent, { error: e },
            React.createElement(Typography, { variant: "body2" }, "Precomputed orthologs, one gene per species, looked up rather than searched for. No BLAST job to queue, and with the in-browser aligner no job at all."),
            React.createElement("div", null,
                React.createElement(OrthologSourceSelect, { className: classes.selectField, value: source, onChange: setSource }),
                React.createElement(QuerySpeciesSelect, { className: classes.selectField, value: taxId, assemblyName: view.assemblyNames[0], onChange: setTaxId }),
                React.createElement(MsaAlgorithmSelect, { className: classes.selectField, value: msaAlgorithm, onChange: setMsaAlgorithm }),
                React.createElement(TextField2, { variant: "outlined", label: "Rows to align", className: classes.selectField, type: "number", value: maxSpecies, onChange: event => {
                        setMaxSpecies(event.target.value);
                    }, error: !rowCountValid, helperText: rowCountValid
                        ? rowsHint[source](rowCount)
                        : 'a whole number, 2 or more' })),
            React.createElement(TranscriptSelector, { feature: feature, ...transcriptSelection })),
        React.createElement(SubmitCancelActions, { model: model, hint: React.createElement(SequenceStatusMessage, { status: sequenceStatus }), submitDisabled: !proteinSequence || !rowCountValid, onSubmit: () => {
                try {
                    if (selectedTranscript) {
                        setLaunchViewError(undefined);
                        orthologLaunchView({
                            feature: selectedTranscript,
                            view,
                            newViewTitle: `Orthologs - ${getGeneDisplayName(feature)} - ${getTranscriptDisplayName(selectedTranscript)}`,
                            orthologParams: {
                                taxId,
                                source,
                                maxSpecies: rowCount,
                                geneCandidates,
                                msaAlgorithm,
                                selectedTranscript: selectedTranscript.toJSON(),
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
