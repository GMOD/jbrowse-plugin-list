import React from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { DialogActions, DialogContent, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import AlphaFoldDBSearchStatus from './AlphaFoldDBSearchStatus';
import IdentifierSelector from './IdentifierSelector';
import ProteinViewActions from './ProteinViewActions';
import TranscriptSelector from './TranscriptSelector';
import UniProtIdInput from './UniProtIdInput';
import UniProtResultsTable from './UniProtResultsTable';
import ExternalLink from '../../components/ExternalLink';
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
    endRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
});
const AlphaFoldDBSearch = observer(function AlphaFoldDBSearch({ feature, session, view, handleClose, alignmentAlgorithm, onAlignmentAlgorithmChange, }) {
    const { classes } = useStyles();
    const state = useAlphaFoldDBSearch({ feature, view });
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            state.error ? React.createElement(ErrorMessage, { error: state.error }) : null,
            state.noModel ? (React.createElement(Typography, null,
                "AlphaFold DB has no model for ",
                state.uniprotId,
                ". The PDB and Foldseek tabs may have a structure.")) : null,
            React.createElement(UniProtIdInput, { lookupMode: state.lookupMode, onLookupModeChange: state.setLookupMode, manualUniprotId: state.manualUniprotId, onManualUniprotIdChange: state.setManualUniprotId, featureUniprotId: state.featureUniprotId, endContent: state.showIdentifierSelector ? (React.createElement("div", { className: classes.endRow },
                    React.createElement(IdentifierSelector, { recognizedIds: state.recognizedIds, geneName: state.geneName, selectedId: state.selectedQueryId, onSelectedIdChange: state.setSelectedQueryId }),
                    React.createElement(TextField, { size: "small", label: "Organism (NCBI taxon)", helperText: "Scopes the gene-name search", value: state.taxonId, onChange: event => {
                            state.setTaxonId(event.target.value);
                        }, placeholder: String(state.effectiveTaxonId), slotProps: { inputLabel: { shrink: true } }, sx: { width: 180 } }))) : null }),
            state.loadingStatuses.map(status => (React.createElement(LoadingEllipses, { key: status, variant: "subtitle2", message: status }))),
            state.showUniprotResults && (React.createElement(React.Fragment, null,
                React.createElement(Typography, { variant: "body2", color: "textSecondary" },
                    "Searched UniProt by ",
                    state.searchDescription),
                React.createElement(UniProtResultsTable, { entries: state.uniprotEntries, selectedAccession: state.selectedTableAccession, onSelect: state.setSelectedUniprotId }),
                React.createElement(Typography, { variant: "body2", color: "textSecondary" },
                    "If you don't see the entry you're looking for, try a different identifier above or search",
                    ' ',
                    React.createElement(ExternalLink, { href: "https://www.uniprot.org/" }, "UniProt"),
                    ' ',
                    "directly and use \"Enter manually\"."))),
            state.showNoResults && (React.createElement(Typography, { variant: "body2", color: "textSecondary" },
                "No UniProt entries found for ",
                state.searchDescriptionOr,
                ". Try a different identifier above, or search",
                ' ',
                React.createElement(ExternalLink, { href: "https://www.uniprot.org/" }, "UniProt"),
                ' ',
                "directly and use \"Enter manually\" above.")),
            state.isoformSequences &&
                state.selectedTranscript &&
                state.structureSequence &&
                state.uniprotId ? (React.createElement(React.Fragment, null,
                React.createElement("div", { className: classes.selectorsRow },
                    React.createElement(TranscriptSelector, { val: state.userSelection, setVal: state.setUserSelection, structureSequence: state.structureSequence, feature: feature, isoforms: state.transcriptOptions, isoformSequences: state.isoformSequences })),
                React.createElement(AlphaFoldDBSearchStatus, { uniprotId: state.modelAccession ?? state.uniprotId, structureSequence: state.structureSequence, isoformSequences: state.isoformSequences, url: state.url }))) : null),
        React.createElement(DialogActions, null,
            React.createElement(ProteinViewActions, { handleClose: handleClose, uniprotId: state.modelAccession ?? state.uniprotId, userSelectedProteinSequence: state.userSelectedProteinSequence, selectedTranscript: state.selectedTranscript, url: state.url, confidenceUrl: state.confidenceUrl, feature: feature, view: view, session: session, alignmentAlgorithm: alignmentAlgorithm, onAlignmentAlgorithmChange: onAlignmentAlgorithmChange, sequencesMatch: state.sequencesMatch, isLoading: state.isLoading, error: state.error }))));
});
export default AlphaFoldDBSearch;
