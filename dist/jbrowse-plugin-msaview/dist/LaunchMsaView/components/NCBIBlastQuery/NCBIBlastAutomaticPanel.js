import React, { useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, MenuItem, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import CachedBlastResults from './CachedBlastResults';
import MsaAlgorithmSelect from './MsaAlgorithmSelect';
import { blastLaunchView } from './blastLaunchView';
import { blastDatabaseOptions, blastPrograms } from './consts';
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
    databaseFieldContainer: {
        display: 'flex',
    },
    clusterSeqMessage: {
        marginLeft: 4,
        alignContent: 'center',
    },
    cachedResultsAccordion: {
        marginTop: 20,
    },
    infoText: {
        marginTop: 20,
    },
});
const NCBIBlastAutomaticPanel = observer(function ({ handleClose, feature, model, children, baseUrl, }) {
    const { classes } = useStyles();
    const view = getLinearGenomeView(model);
    const [launchViewError, setLaunchViewError] = useState();
    const [selectedBlastDatabase, setSelectedBlastDatabase] = useState('nr');
    const [selectedMsaAlgorithm, setSelectedMsaAlgorithm] = useState('clustalo');
    const [selectedBlastProgram, setSelectedBlastProgram] = useState('quick-blastp');
    const geneIds = useMemo(() => getGeneIdentifiers(feature), [feature]);
    const { results: cachedResults, error: cachedResultsError } = useCachedBlastResults(geneIds);
    const transcriptSelection = useTranscriptSelection({ feature, view });
    const { selectedTranscript, proteinSequence } = transcriptSelection;
    const e = transcriptSelection.error ?? launchViewError ?? cachedResultsError;
    return (React.createElement(React.Fragment, null,
        React.createElement(LaunchPanelContent, { error: e },
            children,
            React.createElement(TextField2, { variant: "outlined", label: "BLAST database", className: classes.selectField, select: true, value: selectedBlastDatabase, onChange: event => {
                    const newDb = event.target.value;
                    setSelectedBlastDatabase(newDb);
                    if (newDb === 'nr_cluster_seq') {
                        setSelectedBlastProgram('blastp');
                    }
                } }, blastDatabaseOptions.map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))),
            React.createElement(MsaAlgorithmSelect, { className: classes.selectField, value: selectedMsaAlgorithm, onChange: setSelectedMsaAlgorithm }),
            React.createElement("div", { className: classes.databaseFieldContainer },
                React.createElement(TextField2, { variant: "outlined", label: "BLAST program", disabled: selectedBlastDatabase === 'nr_cluster_seq', className: classes.selectField, select: true, value: selectedBlastProgram, onChange: event => {
                        setSelectedBlastProgram(event.target.value);
                    } }, blastPrograms.map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))),
                selectedBlastDatabase === 'nr_cluster_seq' ? (React.createElement(Typography, { variant: "subtitle2", className: classes.clusterSeqMessage }, "Can only use blastp on nr_cluster_seq")) : null),
            React.createElement(TranscriptSelector, { feature: feature, ...transcriptSelection }),
            React.createElement(Typography, { className: classes.infoText }, "This panel will automatically submit a query to NCBI. Using blastp can take 10+ minutes to run, quick-blastp is generally a lot faster but is not available for the clustered database. After completion, all the hits will be run through a multiple sequence alignment. Note: we are not able to currently run NCBI COBALT automatically on the BLAST results, even though that is the method NCBI uses on their website. If you need a COBALT alignment, please use the manual approach of submitting BLAST yourself and downloading the resulting files"),
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
                                baseUrl,
                                blastProgram: selectedBlastProgram,
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
export default NCBIBlastAutomaticPanel;
//# sourceMappingURL=NCBIBlastAutomaticPanel.js.map