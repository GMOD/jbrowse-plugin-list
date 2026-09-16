import React, { useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, MenuItem, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import TextField2 from '../../../components/TextField2';
import { getBlastViewTitle, getGeneIdentifiers, getLinearGenomeView, } from '../../util';
import LaunchPanelContent from '../LaunchPanelContent';
import SequenceStatusMessage from '../SequenceStatus';
import SubmitCancelActions from '../SubmitCancelActions';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
import CachedBlastResults from './CachedBlastResults';
import MsaAlgorithmSelect from './MsaAlgorithmSelect';
import { blastLaunchView } from './blastLaunchView';
import { databaseLabel, databaseOptionsFor, defaultMaxHits, defaultSearchFor, searchProgramLabels, searchPrograms, } from './consts';
import { useStoredMsaAlgorithm, useStoredSearchChoice, } from './searchChoiceStorage';
import { useCachedBlastResults } from './useCachedBlastResults';
const useStyles = makeStyles()({
    selectField: {
        width: 150,
    },
    // wider than the rest because the collection names are what the user came to
    // read, and truncating them does not distinguish Swiss-Prot from TrEMBL
    databaseField: {
        width: 260,
    },
    cachedResultsAccordion: {
        marginTop: 20,
    },
    infoText: {
        marginTop: 20,
    },
});
const BlastAutomaticPanel = observer(function ({ handleClose, feature, model, children, preferredTranscriptId, }) {
    const { classes } = useStyles();
    const view = getLinearGenomeView(model);
    const [launchViewError, setLaunchViewError] = useState();
    // one piece of state, not two: a program and a database that program does not
    // have is a 400 from EBI minutes after Submit, and holding them apart is what
    // would let them drift into that
    const [search, setSearch] = useStoredSearchChoice();
    const [selectedMsaAlgorithm, setSelectedMsaAlgorithm] = useStoredMsaAlgorithm();
    const [maxHits, setMaxHits] = useState(String(defaultMaxHits));
    const hitCount = Number(maxHits);
    const hitCountValid = Number.isInteger(hitCount) && hitCount >= 1;
    const isPhmmer = search.program === 'phmmer';
    const geneIds = useMemo(() => getGeneIdentifiers(feature), [feature]);
    const { results: cachedResults, error: cachedResultsError } = useCachedBlastResults(geneIds);
    const transcriptSelection = useTranscriptSelection({
        feature,
        view,
        preferredTranscriptId,
    });
    const { selectedTranscript, proteinSequence, sequenceStatus } = transcriptSelection;
    const e = transcriptSelection.error ?? launchViewError ?? cachedResultsError;
    return (React.createElement(React.Fragment, null,
        React.createElement(LaunchPanelContent, { error: e },
            children,
            React.createElement(TextField2, { variant: "outlined", label: "Search program", className: classes.selectField, select: true, value: search.program, onChange: event => {
                    // the two services name their databases differently, so switching
                    // program replaces the database rather than keeping a name the new
                    // one has never heard of
                    setSearch(defaultSearchFor(event.target.value));
                } }, searchPrograms.map(val => (React.createElement(MenuItem, { value: val, key: val }, searchProgramLabels[val])))),
            React.createElement(TextField2, { variant: "outlined", label: "Database", className: classes.databaseField, select: true, value: search.database, onChange: event => {
                    setSearch({
                        program: search.program,
                        database: event.target.value,
                    });
                } }, databaseOptionsFor(search.program).map(val => (React.createElement(MenuItem, { value: val, key: val }, databaseLabel(val))))),
            isPhmmer ? null : (React.createElement(MsaAlgorithmSelect, { className: classes.selectField, value: selectedMsaAlgorithm, onChange: setSelectedMsaAlgorithm })),
            React.createElement(TextField2, { variant: "outlined", label: "Hits", className: classes.selectField, type: "number", value: maxHits, onChange: event => {
                    setMaxHits(event.target.value);
                }, error: !hitCountValid, helperText: "best-scoring sequences to keep" }),
            React.createElement(TranscriptSelector, { feature: feature, ...transcriptSelection }),
            React.createElement(Typography, { variant: "body2", className: classes.infoText },
                isPhmmer
                    ? 'phmmer aligns the hits as it finds them, so nothing is realigned afterwards.'
                    : 'The hits come back from EBI and are then run through the chosen aligner.',
                ' ',
                "The EBI queue is the wait, and it runs from seconds to many minutes."),
            cachedResults.length > 0 ? (React.createElement(Accordion, { className: classes.cachedResultsAccordion },
                React.createElement(AccordionSummary, { expandIcon: React.createElement(ExpandMoreIcon, null) },
                    React.createElement(Typography, null, "Previous BLAST Results")),
                React.createElement(AccordionDetails, null,
                    React.createElement(CachedBlastResults, { model: model, handleClose: handleClose, feature: feature })))) : null),
        React.createElement(SubmitCancelActions, { model: model, hint: React.createElement(SequenceStatusMessage, { status: sequenceStatus }), submitDisabled: !proteinSequence || !hitCountValid, onSubmit: () => {
                try {
                    if (selectedTranscript) {
                        setLaunchViewError(undefined);
                        blastLaunchView({
                            feature: selectedTranscript,
                            view,
                            newViewTitle: getBlastViewTitle(feature, selectedTranscript),
                            blastParams: search.program === 'phmmer'
                                ? {
                                    searchProgram: 'phmmer',
                                    blastDatabase: search.database,
                                    maxHits: hitCount,
                                    selectedTranscript: selectedTranscript.toJSON(),
                                    proteinSequence,
                                }
                                : {
                                    searchProgram: 'blastp',
                                    blastDatabase: search.database,
                                    msaAlgorithm: selectedMsaAlgorithm,
                                    maxHits: hitCount,
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
export default BlastAutomaticPanel;
