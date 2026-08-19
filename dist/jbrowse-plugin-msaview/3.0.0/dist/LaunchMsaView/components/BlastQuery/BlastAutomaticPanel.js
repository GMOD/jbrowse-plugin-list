import React, { useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, MenuItem, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import CachedBlastResults from './CachedBlastResults';
import MsaAlgorithmSelect from './MsaAlgorithmSelect';
import { blastLaunchView } from './blastLaunchView';
import { blastDatabaseOptions, defaultBlastDatabase } from './consts';
import { useCachedBlastResults } from './useCachedBlastResults';
import TextField2 from '../../../components/TextField2';
import { getBlastViewTitle, getGeneIdentifiers, getLinearGenomeView, } from '../../util';
import LaunchPanelContent from '../LaunchPanelContent';
import SubmitCancelActions from '../SubmitCancelActions';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
const useStyles = makeStyles()({
    selectField: {
        width: 150,
    },
    cachedResultsAccordion: {
        marginTop: 20,
    },
    infoText: {
        marginTop: 20,
    },
});
const BlastAutomaticPanel = observer(function ({ handleClose, feature, model, children, }) {
    const { classes } = useStyles();
    const view = getLinearGenomeView(model);
    const [launchViewError, setLaunchViewError] = useState();
    const [selectedBlastDatabase, setSelectedBlastDatabase] = useState(defaultBlastDatabase);
    const [selectedMsaAlgorithm, setSelectedMsaAlgorithm] = useState('clustalo');
    const geneIds = useMemo(() => getGeneIdentifiers(feature), [feature]);
    const { results: cachedResults, error: cachedResultsError } = useCachedBlastResults(geneIds);
    const transcriptSelection = useTranscriptSelection({ feature, view });
    const { selectedTranscript, proteinSequence } = transcriptSelection;
    const e = transcriptSelection.error ?? launchViewError ?? cachedResultsError;
    return (React.createElement(React.Fragment, null,
        React.createElement(LaunchPanelContent, { error: e },
            children,
            React.createElement(TextField2, { variant: "outlined", label: "BLAST database", className: classes.selectField, select: true, value: selectedBlastDatabase, onChange: event => {
                    setSelectedBlastDatabase(event.target.value);
                } }, blastDatabaseOptions.map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))),
            React.createElement(MsaAlgorithmSelect, { className: classes.selectField, value: selectedMsaAlgorithm, onChange: setSelectedMsaAlgorithm }),
            React.createElement(TranscriptSelector, { feature: feature, ...transcriptSelection }),
            React.createElement(Typography, { className: classes.infoText }, "This panel will automatically submit a blastp query to EBI, which searches UniProtKB. Searches usually finish in under a minute, and swissprot returns curated sequences that align more cleanly than the many near-identical entries a TrEMBL search brings back. After completion, all the hits will be run through a multiple sequence alignment. Searching NCBI's nr needs the manual approach: NCBI no longer lets a browser read responses from Blast.cgi."),
            cachedResults.length > 0 ? (React.createElement(Accordion, { className: classes.cachedResultsAccordion },
                React.createElement(AccordionSummary, { expandIcon: React.createElement(ExpandMoreIcon, null) },
                    React.createElement(Typography, null, "Previous BLAST Results")),
                React.createElement(AccordionDetails, null,
                    React.createElement(CachedBlastResults, { model: model, handleClose: handleClose, feature: feature })))) : null),
        React.createElement(SubmitCancelActions, { submitDisabled: !proteinSequence, onSubmit: () => {
                try {
                    if (selectedTranscript) {
                        setLaunchViewError(undefined);
                        blastLaunchView({
                            feature: selectedTranscript,
                            view,
                            newViewTitle: getBlastViewTitle(feature, selectedTranscript),
                            blastParams: {
                                blastDatabase: selectedBlastDatabase,
                                msaAlgorithm: selectedMsaAlgorithm,
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
export default BlastAutomaticPanel;
