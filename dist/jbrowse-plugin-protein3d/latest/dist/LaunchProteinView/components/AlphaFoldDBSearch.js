import React, { useState } from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { DialogActions, DialogContent, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import AlphaFoldComplexesTable from './AlphaFoldComplexesTable';
import AlphaFoldDBSearchStatus from './AlphaFoldDBSearchStatus';
import PartialFailureNotice from './PartialFailureNotice';
import ProteinViewActions from './ProteinViewActions';
import TranscriptSelector from './TranscriptSelector';
import UniProtLookupControls from './UniProtLookupControls';
import UniProtLookupResults from './UniProtLookupResults';
import { errorMessage } from '../../ProteinView/util';
import { useAlphaFoldComplexes } from '../hooks/useAlphaFoldComplexes';
import useAlphaFoldDBSearch from '../hooks/useAlphaFoldDBSearch';
const useStyles = makeStyles()({
    dialogContent: {
        width: '80em',
        '& > *': {
            marginBottom: 20,
        },
        '& > *:last-child': {
            marginBottom: 0,
        },
    },
    selectorsRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
        alignItems: 'flex-start',
    },
});
const AlphaFoldDBSearch = observer(function AlphaFoldDBSearch({ feature, preferredTranscriptId, session, view, handleClose, lookup, sideBySide, onSideBySideChange, }) {
    const { classes } = useStyles();
    const [complexEntity, setComplexEntity] = useState();
    const { complexes, error: complexesError } = useAlphaFoldComplexes(lookup.uniprotId);
    // a choice from another accession's list is no choice
    const chosenComplex = complexes?.find(c => c.entity === complexEntity);
    const state = useAlphaFoldDBSearch({
        feature,
        view,
        lookup,
        preferredTranscriptId,
        complexEntity: chosenComplex?.entity,
    });
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            state.error ? React.createElement(ErrorMessage, { error: state.error }) : null,
            state.noModel ? (React.createElement(Typography, null,
                "AlphaFold DB has no model for ",
                state.uniprotId,
                ". The PDB and Foldseek tabs may have a structure.")) : null,
            state.modelsUnreachable ? (React.createElement(Typography, null,
                "AlphaFold DB's model list did not answer, so Launch opens the canonical model file for ",
                state.uniprotId,
                ", without comparing its sequence to the isoforms.")) : null,
            React.createElement(UniProtLookupControls, { lookup: lookup }),
            state.loadingStatuses.map(status => (React.createElement(LoadingEllipses, { key: status, variant: "subtitle2", message: status }))),
            React.createElement(PartialFailureNotice, { message: state.isoformPartialFailure }),
            React.createElement(UniProtLookupResults, { lookup: lookup }),
            state.ranking &&
                state.selectedTranscript &&
                (state.structureSequence || state.modelsUnreachable) &&
                state.uniprotId ? (React.createElement(React.Fragment, null,
                React.createElement("div", { className: classes.selectorsRow },
                    React.createElement(TranscriptSelector, { val: state.userSelection, setVal: state.setUserSelection, structureSequence: state.structureSequence, feature: feature, isoforms: state.transcriptOptions, ranking: state.ranking })),
                React.createElement(AlphaFoldDBSearchStatus, { uniprotId: state.modelAccession ?? state.uniprotId, url: state.url }))) : null,
            state.uniprotId && complexes ? (React.createElement(AlphaFoldComplexesTable, { complexes: complexes, accession: state.uniprotId, monomer: state.noModel ? undefined : { meanPlddt: state.meanPlddt }, selected: chosenComplex?.entity, onSelect: setComplexEntity })) : null,
            complexesError ? (React.createElement(Typography, { variant: "body2", color: "textSecondary" },
                "AlphaFold DB's complex list did not answer:",
                ' ',
                errorMessage(complexesError))) : null),
        React.createElement(DialogActions, null,
            React.createElement(ProteinViewActions, { handleClose: handleClose, uniprotId: state.modelAccession ?? state.uniprotId, userSelectedProteinSequence: state.userSelectedProteinSequence, selectedTranscript: state.selectedTranscript, url: state.url, confidenceUrl: state.confidenceUrl, feature: feature, view: view, session: session, sideBySide: sideBySide, onSideBySideChange: onSideBySideChange, sequencesMatch: state.sequencesMatch, isLoading: state.isLoading, error: state.error }))));
});
export default AlphaFoldDBSearch;
