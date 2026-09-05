import React, { useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, MenuItem, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import TextField2 from '../../../components/TextField2';
import { getBlastViewTitle, getGeneIdentifiers, getLinearGenomeView, } from '../../util';
import LaunchPanelContent from '../LaunchPanelContent';
import SubmitCancelActions from '../SubmitCancelActions';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
import CachedBlastResults from './CachedBlastResults';
import MsaAlgorithmSelect from './MsaAlgorithmSelect';
import { blastLaunchView } from './blastLaunchView';
import { databaseOptionsFor, defaultSearchFor, searchPrograms } from './consts';
import { useStoredMsaAlgorithm, useStoredSearchChoice, } from './searchChoiceStorage';
import { useCachedBlastResults } from './useCachedBlastResults';
const useStyles = makeStyles()({
    selectField: {
        width: 150,
    },
    // wider than the rest because the values are what the user came to read, and
    // `uniprotkb_swissprot` is 19 characters — at 150 the field showed
    // `uniprotkb_swis…`, which does not distinguish it from `uniprotkb_trembl`
    databaseField: {
        width: 230,
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
    // one piece of state, not two: a program and a database that program does not
    // have is a 400 from EBI minutes after Submit, and holding them apart is what
    // would let them drift into that
    const [search, setSearch] = useStoredSearchChoice();
    const [selectedMsaAlgorithm, setSelectedMsaAlgorithm] = useStoredMsaAlgorithm();
    const isPhmmer = search.program === 'phmmer';
    const geneIds = useMemo(() => getGeneIdentifiers(feature), [feature]);
    const { results: cachedResults, error: cachedResultsError } = useCachedBlastResults(geneIds);
    const transcriptSelection = useTranscriptSelection({ feature, view });
    const { selectedTranscript, proteinSequence } = transcriptSelection;
    const e = transcriptSelection.error ?? launchViewError ?? cachedResultsError;
    return (React.createElement(React.Fragment, null,
        React.createElement(LaunchPanelContent, { error: e },
            children,
            React.createElement(TextField2, { variant: "outlined", label: "Search program", className: classes.selectField, select: true, value: search.program, onChange: event => {
                    // the two services name their databases differently, so switching
                    // program replaces the database rather than keeping a name the new
                    // one has never heard of
                    setSearch(defaultSearchFor(event.target.value));
                } }, searchPrograms.map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))),
            React.createElement(TextField2, { variant: "outlined", label: "Database", className: classes.databaseField, select: true, value: search.database, onChange: event => {
                    setSearch({
                        program: search.program,
                        database: event.target.value,
                    });
                } }, databaseOptionsFor(search.program).map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))),
            isPhmmer ? null : (React.createElement(MsaAlgorithmSelect, { className: classes.selectField, value: selectedMsaAlgorithm, onChange: setSelectedMsaAlgorithm })),
            React.createElement(TranscriptSelector, { feature: feature, ...transcriptSelection }),
            React.createElement(Typography, { className: classes.infoText },
                isPhmmer
                    ? `phmmer searches UniProtKB with a profile HMM built from the query,
               so it aligns the hits as it finds them and that alignment is used
               directly — nothing is realigned afterwards. The tree is then built
               from it by neighbour-joining. A hit matching the query in more
               than one place appears once per matched region.`
                    : `This panel will automatically submit a blastp query to EBI, which
               searches UniProtKB. Searches usually finish in under a minute, and
               swissprot returns curated sequences that align more cleanly than
               the many near-identical entries a TrEMBL search brings back. After
               completion, all the hits will be run through a multiple sequence
               alignment.`,
                ' ',
                "Searching NCBI's nr needs the manual approach: NCBI no longer lets a browser read responses from Blast.cgi."),
            cachedResults.length > 0 ? (React.createElement(Accordion, { className: classes.cachedResultsAccordion },
                React.createElement(AccordionSummary, { expandIcon: React.createElement(ExpandMoreIcon, null) },
                    React.createElement(Typography, null, "Previous BLAST Results")),
                React.createElement(AccordionDetails, null,
                    React.createElement(CachedBlastResults, { model: model, handleClose: handleClose, feature: feature })))) : null),
        React.createElement(SubmitCancelActions, { model: model, submitDisabled: !proteinSequence, onSubmit: () => {
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
                                    selectedTranscript,
                                    proteinSequence,
                                }
                                : {
                                    searchProgram: 'blastp',
                                    blastDatabase: search.database,
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
