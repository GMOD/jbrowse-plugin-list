import React, { useEffect, useMemo, useState } from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { getContainingView, getSession } from '@jbrowse/core/util';
import { Button, DialogActions, DialogContent, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import FoldseekDatabaseSelector from './FoldseekDatabaseSelector';
import FoldseekResultsTable from './FoldseekResultsTable';
import TranscriptSelector from './TranscriptSelector';
import useFoldseekSearch from '../hooks/useFoldseekSearch';
import useIsoformProteinSequences from '../hooks/useIsoformProteinSequences';
import { DEFAULT_DATABASES, } from '../services/foldseekApi';
import { getTranscriptFeatures } from '../utils/util';
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
    },
});
const FoldseekSearch = observer(function FoldseekSearch({ feature, model, handleClose, }) {
    const { classes } = useStyles();
    const session = getSession(model);
    const view = getContainingView(model);
    const [sequence, setSequence] = useState('');
    const [selectedTranscriptId, setSelectedTranscriptId] = useState('');
    const [selectedDatabases, setSelectedDatabases] = useState(DEFAULT_DATABASES);
    const { results, cleanedAaSequence, di3Sequence, isLoading, isPredicting, error, statusMessage, predictStructure, search, reset, } = useFoldseekSearch();
    const transcripts = useMemo(() => getTranscriptFeatures(feature), [feature]);
    const { isoformSequences, isLoading: isLoadingIsoforms, error: isoformError, } = useIsoformProteinSequences({ feature, view });
    const selectedTranscript = transcripts.find(t => t.id() === selectedTranscriptId);
    const selectedIsoformData = isoformSequences?.[selectedTranscriptId];
    useEffect(() => {
        if (isoformSequences && !selectedTranscriptId) {
            const sortedTranscripts = [...transcripts].sort((a, b) => {
                const seqA = isoformSequences[a.id()]?.seq;
                const seqB = isoformSequences[b.id()]?.seq;
                return (seqB?.length ?? 0) - (seqA?.length ?? 0);
            });
            const firstWithSeq = sortedTranscripts.find(t => isoformSequences[t.id()]?.seq);
            if (firstWithSeq) {
                setSelectedTranscriptId(firstWithSeq.id());
            }
        }
    }, [isoformSequences, selectedTranscriptId, transcripts]);
    useEffect(() => {
        if (selectedIsoformData?.seq) {
            // Strip stop codons from displayed sequence
            setSequence(selectedIsoformData.seq.replace(/\*/g, ''));
        }
    }, [selectedIsoformData]);
    const handlePredict = async () => {
        if (sequence.trim()) {
            await predictStructure(sequence.trim());
        }
    };
    const handleSearch = () => {
        if (cleanedAaSequence && di3Sequence && selectedDatabases.length > 0) {
            search(cleanedAaSequence, di3Sequence, selectedDatabases).catch((e) => {
                console.error(e);
            });
        }
    };
    const canPredict = sequence.trim().length > 0 && !isPredicting && !isLoading;
    const canSearch = !!cleanedAaSequence &&
        !!di3Sequence &&
        selectedDatabases.length > 0 &&
        !isLoading;
    const combinedError = error ?? isoformError;
    const isBusy = isLoading || isPredicting;
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            combinedError && !isLoadingIsoforms ? (React.createElement(ErrorMessage, { error: combinedError })) : null,
            isLoadingIsoforms ? (React.createElement(LoadingEllipses, { variant: "subtitle2", message: "Loading transcript sequences" })) : null,
            isoformSequences ? (React.createElement(React.Fragment, null,
                React.createElement(TranscriptSelector, { val: selectedTranscriptId, setVal: setSelectedTranscriptId, isoforms: transcripts, isoformSequences: isoformSequences, feature: feature, disabled: isBusy }),
                React.createElement(TextField, { label: "Protein sequence (amino acids)", multiline: true, rows: 4, value: sequence, onChange: e => {
                        setSequence(e.target.value);
                    }, placeholder: `MKTVRQERLKSIVRILERSKEPVSGAQLAEEL...`, disabled: isBusy, InputProps: {
                        className: classes.sequenceInput,
                    } }))) : null,
            di3Sequence ? (React.createElement("div", { className: classes.di3Section },
                React.createElement(Typography, { variant: "subtitle2" }, "3Di structural alphabet (used for searching):"),
                React.createElement(TextField, { multiline: true, rows: 4, value: di3Sequence, InputProps: {
                        className: classes.sequenceInput,
                        readOnly: true,
                    } }))) : null,
            React.createElement(FoldseekDatabaseSelector, { selected: selectedDatabases, onChange: setSelectedDatabases, disabled: isBusy }),
            statusMessage ? (React.createElement(LoadingEllipses, { variant: "subtitle2", message: statusMessage })) : null,
            results ? (React.createElement(FoldseekResultsTable, { results: results, session: session, view: view, feature: feature, selectedTranscript: selectedTranscript, userProvidedTranscriptSequence: sequence, onClose: handleClose })) : null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { variant: "contained", color: "secondary", onClick: handleClose }, "Cancel"),
            results ? (React.createElement(Button, { variant: "outlined", onClick: reset }, "New search")) : null,
            !di3Sequence ? (React.createElement(Button, { variant: "contained", color: "primary", disabled: !canPredict, onClick: () => {
                    handlePredict().catch((e) => {
                        console.error(e);
                    });
                } }, isPredicting ? 'Predicting...' : 'Predict 3Di structure')) : (React.createElement(Button, { variant: "contained", color: "primary", disabled: !canSearch, onClick: handleSearch }, isLoading ? 'Searching...' : 'Search Foldseek')))));
});
export default FoldseekSearch;
//# sourceMappingURL=FoldseekSearch.js.map