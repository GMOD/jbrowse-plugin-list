import React, { useState } from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { Button, DialogActions, DialogContent, Link, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { stripAllStopCodons } from 'p2s_mapper';
import { makeStyles } from 'tss-react/mui';
import FoldseekDatabaseSelector from './FoldseekDatabaseSelector';
import FoldseekResultsTable from './FoldseekResultsTable';
import PartialFailureNotice from './PartialFailureNotice';
import TranscriptSelector from './TranscriptSelector';
import useFoldseekSearch from '../hooks/useFoldseekSearch';
import useTranscriptIsoformSelection from '../hooks/useTranscriptIsoformSelection';
import { DEFAULT_DATABASES } from '../services/foldseekApi';
const useStyles = makeStyles()({
    dialogContent: {
        width: '80em',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    sequenceInput: {
        fontFamily: 'monospace',
    },
    di3Section: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-start',
    },
});
const FoldseekSearch = observer(function FoldseekSearch({ feature, preferredTranscriptId, session, view, handleClose, }) {
    const { classes } = useStyles();
    const [userEditedSequence, setUserEditedSequence] = useState();
    const [selectedDatabases, setSelectedDatabases] = useState(DEFAULT_DATABASES);
    const [show3Di, setShow3Di] = useState(false);
    const { results, cleanedAaSequence, di3Sequence, isLoading, isPredicting, error, statusMessage, predictStructure, search, cancel, reset, } = useFoldseekSearch();
    const { transcripts, isoformSequences, isLoading: isLoadingIsoforms, error: isoformError, partialFailure: isoformPartialFailure, selectedTranscriptId: effectiveSelectedTranscriptId, setSelectedTranscriptId: setUserSelection, selectedTranscript, selectedIsoform: selectedIsoformData, } = useTranscriptIsoformSelection({
        feature,
        view,
        preferredTranscriptId,
    });
    const cleanedSequence = selectedIsoformData
        ? stripAllStopCodons(selectedIsoformData.seq)
        : '';
    const sequence = userEditedSequence ?? cleanedSequence;
    // Any change to the input sequence makes an existing 3Di prediction (and any
    // results derived from it) stale, so it goes back to being predicted on the
    // next search rather than a search running against the old residues.
    const invalidatePrediction = () => {
        if (di3Sequence !== undefined || results !== undefined) {
            reset();
        }
    };
    const setUserSelectionWithReset = (id) => {
        setUserSelection(id);
        setUserEditedSequence(undefined);
        invalidatePrediction();
    };
    const isBusy = isLoading || isPredicting;
    const canSearch = sequence.trim().length > 0 && selectedDatabases.length > 0 && !isBusy;
    // One button: predicting the 3Di alphabet is a step of the search, not a
    // decision, and making the user click twice only invited a stale prediction.
    const runSearch = async () => {
        const predicted = cleanedAaSequence && di3Sequence
            ? { aaSequence: cleanedAaSequence, di3Sequence }
            : await predictStructure(sequence.trim());
        if (predicted) {
            await search(predicted.aaSequence, predicted.di3Sequence, selectedDatabases);
        }
    };
    const combinedError = error ?? isoformError;
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            combinedError && !isLoadingIsoforms ? (React.createElement(ErrorMessage, { error: combinedError })) : null,
            isLoadingIsoforms ? (React.createElement(LoadingEllipses, { variant: "subtitle2", message: "Loading transcript sequences" })) : null,
            React.createElement(PartialFailureNotice, { message: isoformPartialFailure }),
            isoformSequences ? (React.createElement(React.Fragment, null,
                React.createElement(TranscriptSelector, { val: effectiveSelectedTranscriptId, setVal: setUserSelectionWithReset, isoforms: transcripts, isoformSequences: isoformSequences, feature: feature, disabled: isBusy }),
                React.createElement(TextField, { label: "Protein sequence (amino acids)", multiline: true, rows: 4, value: sequence, onChange: e => {
                        setUserEditedSequence(e.target.value);
                        invalidatePrediction();
                    }, placeholder: `MKTVRQERLKSIVRILERSKEPVSGAQLAEEL...`, disabled: isBusy, slotProps: {
                        input: { className: classes.sequenceInput },
                    } }))) : null,
            di3Sequence ? (React.createElement("div", { className: classes.di3Section },
                React.createElement(Link, { component: "button", type: "button", variant: "body2", onClick: () => {
                        setShow3Di(!show3Di);
                    } }, show3Di ? 'Hide 3Di' : 'Show 3Di'),
                show3Di ? (React.createElement(TextField, { label: "3Di structural alphabet (what the search runs on)", multiline: true, rows: 4, fullWidth: true, value: di3Sequence, slotProps: {
                        input: { className: classes.sequenceInput, readOnly: true },
                    } })) : null)) : null,
            React.createElement(FoldseekDatabaseSelector, { selected: selectedDatabases, onChange: setSelectedDatabases, disabled: isBusy }),
            statusMessage ? (React.createElement(LoadingEllipses, { variant: "subtitle2", message: statusMessage })) : null,
            results ? (React.createElement(FoldseekResultsTable, { results: results, session: session, view: view, feature: feature, selectedTranscript: selectedTranscript, userProvidedTranscriptSequence: selectedIsoformData?.seq, onClose: handleClose })) : null,
            React.createElement(Typography, { variant: "body2", color: "textSecondary" }, "Searching sends the protein sequence above to the foldseek.com servers, which predict its 3Di alphabet and run the structure search.")),
        React.createElement(DialogActions, null,
            React.createElement(Button, { variant: "contained", color: "secondary", onClick: () => {
                    handleClose();
                } }, "Close"),
            isBusy ? (React.createElement(Button, { variant: "outlined", onClick: () => {
                    cancel();
                } }, "Cancel search")) : null,
            results ? (React.createElement(Button, { variant: "outlined", onClick: () => {
                    reset();
                } }, "New search")) : null,
            React.createElement(Button, { variant: "contained", color: "primary", disabled: !canSearch, onClick: () => {
                    void runSearch();
                } }, isPredicting
                ? 'Predicting 3Di...'
                : isLoading
                    ? 'Searching...'
                    : 'Search Foldseek'))));
});
export default FoldseekSearch;
