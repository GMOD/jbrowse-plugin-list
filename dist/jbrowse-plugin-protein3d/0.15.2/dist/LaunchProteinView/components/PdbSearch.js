import React, { useState } from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { DialogActions, DialogContent, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { getPdbStructureUrl, isPdbId, uniprotEntryUrl } from 'p2s_mapper';
import { makeStyles } from 'tss-react/mui';
import PartialFailureNotice from './PartialFailureNotice';
import PdbResultsTable from './PdbResultsTable';
import ProteinViewActions from './ProteinViewActions';
import TranscriptSelector from './TranscriptSelector';
import UniProtLookupControls from './UniProtLookupControls';
import UniProtResultsTable from './UniProtResultsTable';
import ExternalLink from '../../components/ExternalLink';
import useDebouncedValue from '../hooks/useDebouncedValue';
import usePdbBestStructures from '../hooks/usePdbBestStructures';
import usePdbEntryMolecules from '../hooks/usePdbEntryMolecules';
import useTranscriptIsoformSelection from '../hooks/useTranscriptIsoformSelection';
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
});
// Experimental structures of the gene's protein, found through SIFTS: PDBe
// lists every entry mapped to the UniProt accession, ranked on coverage and
// resolution, so a reader who does not know a PDB id can still reach one.
// A crystal is usually a fragment, often with partners, so the view aligns
// the transcript to it after launch rather than expecting a sequence match
// here.
const PdbSearch = observer(function PdbSearch({ feature, preferredTranscriptId, session, view, handleClose, lookup, sideBySide, onSideBySideChange, }) {
    const { classes } = useStyles();
    const { uniprotId, isAutoMode, isLookupLoading } = lookup;
    const { entries, error: pdbError, isLoading: isPdbLoading, } = usePdbBestStructures(uniprotId);
    const [userPdbId, setUserPdbId] = useState();
    // A typed id reaches entries PDBe's SIFTS listing never offers: a structure
    // of a complex filed under a partner, anything a paper names. Debounced, so
    // the three characters on the way to four are not three fetches.
    const [typedPdbId, setTypedPdbId] = useState('');
    const trimmedTypedPdbId = typedPdbId.trim();
    const debouncedTypedPdbId = useDebouncedValue(trimmedTypedPdbId, 400);
    const typedPdbIdInvalid = trimmedTypedPdbId !== '' && !isPdbId(trimmedTypedPdbId);
    const selectedPdbId = isPdbId(debouncedTypedPdbId)
        ? debouncedTypedPdbId.toLowerCase()
        : userPdbId && entries?.some(e => e.pdbId === userPdbId)
            ? userPdbId
            : entries?.[0]?.pdbId;
    const structureUrl = selectedPdbId
        ? getPdbStructureUrl(selectedPdbId)
        : undefined;
    // The chosen entry's residues, so the isoform picker can say which transcript
    // matches it — the same annotation the AlphaFold tab shows. It is a label and
    // nothing more: its failure costs the label rather than the launch, which
    // reads the structure file itself. Launch waits only while the isoforms are
    // ranked against it, and not at all for the isoform the user right-clicked.
    //
    // While another entry's answer is in flight keepPreviousData still holds the
    // last one, so isValidating withholds it rather than labelling these rows
    // with the previous entry's chains.
    const { sequences, isValidating: isMoleculesValidating } = usePdbEntryMolecules(selectedPdbId);
    const structureSequences = isMoleculesValidating ? undefined : sequences;
    const { transcripts, structureSequence, ranking, isLoading: isIsoformLoading, isRanking, error: isoformError, partialFailure: isoformPartialFailure, selectedTranscriptId, setSelectedTranscriptId, selectedTranscript, selectedIsoform, } = useTranscriptIsoformSelection({
        feature,
        view,
        structureSequences,
        preferredTranscriptId,
        resetKey: uniprotId,
    });
    const loadingStatuses = [
        isLookupLoading && 'Looking up UniProt ID',
        isIsoformLoading && 'Loading protein sequences from transcript isoforms',
        isRanking && 'Aligning isoforms to the structure',
        isPdbLoading && 'Listing PDB entries from PDBe',
    ].filter((s) => !!s);
    const isLoading = loadingStatuses.length > 0;
    const error = isLoading
        ? undefined
        : (isoformError ?? lookup.lookupError ?? pdbError);
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            error ? React.createElement(ErrorMessage, { error: error }) : null,
            React.createElement(UniProtLookupControls, { lookup: lookup }),
            loadingStatuses.map(status => (React.createElement(LoadingEllipses, { key: status, variant: "subtitle2", message: status }))),
            React.createElement(PartialFailureNotice, { message: isoformPartialFailure }),
            isAutoMode && lookup.uniprotEntries.length > 0 ? (React.createElement(React.Fragment, null,
                React.createElement(Typography, { variant: "body2", color: "textSecondary" },
                    "Searched UniProt by ",
                    lookup.searchDescription),
                React.createElement(UniProtResultsTable, { entries: lookup.uniprotEntries, selectedAccession: lookup.selectedTableAccession, onSelect: lookup.setSelectedUniprotId }))) : null,
            isAutoMode &&
                !isLookupLoading &&
                lookup.uniprotEntries.length === 0 ? (React.createElement(Typography, { variant: "body2", color: "textSecondary" },
                "No UniProt entries found for ",
                lookup.searchDescriptionOr,
                ". Try a different identifier above, or search",
                ' ',
                React.createElement(ExternalLink, { href: "https://www.uniprot.org/" }, "UniProt"),
                ' ',
                "directly and use \"Enter manually\".")) : null,
            React.createElement(TextField, { size: "small", label: "PDB ID", placeholder: "e.g. 1TUP", helperText: typedPdbIdInvalid
                    ? 'A PDB ID is four characters beginning with a digit'
                    : 'Overrides the selection below', error: typedPdbIdInvalid, value: typedPdbId, onChange: event => {
                    setTypedPdbId(event.target.value);
                }, slotProps: { inputLabel: { shrink: true } }, sx: { width: 240 } }),
            uniprotId && entries && !isPdbLoading ? (entries.length > 0 ? (React.createElement(PdbResultsTable, { entries: entries, selectedPdbId: selectedPdbId, onSelect: setUserPdbId })) : (React.createElement(Typography, null,
                "PDBe lists no experimental structure for",
                ' ',
                React.createElement(ExternalLink, { href: uniprotEntryUrl(uniprotId) }, uniprotId),
                ". The AlphaFoldDB tab has a predicted one."))) : null,
            ranking && selectedTranscript ? (React.createElement(TranscriptSelector, { val: selectedTranscriptId, setVal: setSelectedTranscriptId, structureSequence: structureSequence, feature: feature, isoforms: transcripts, ranking: ranking })) : null),
        React.createElement(DialogActions, null,
            React.createElement(ProteinViewActions, { handleClose: handleClose, uniprotId: uniprotId, userSelectedProteinSequence: selectedIsoform, selectedTranscript: selectedTranscript, url: structureUrl, pdbId: selectedPdbId, feature: feature, view: view, session: session, sideBySide: sideBySide, onSideBySideChange: onSideBySideChange, isLoading: isLoading, error: error }))));
});
export default PdbSearch;
