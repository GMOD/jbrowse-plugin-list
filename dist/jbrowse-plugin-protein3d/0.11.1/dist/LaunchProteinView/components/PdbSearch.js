import React, { useState } from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { DialogActions, DialogContent, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import IdentifierSelector from './IdentifierSelector';
import PdbResultsTable from './PdbResultsTable';
import ProteinViewActions from './ProteinViewActions';
import TranscriptSelector from './TranscriptSelector';
import UniProtIdInput from './UniProtIdInput';
import UniProtResultsTable from './UniProtResultsTable';
import ExternalLink from '../../components/ExternalLink';
import usePdbBestStructures from '../hooks/usePdbBestStructures';
import useTranscriptIsoformSelection from '../hooks/useTranscriptIsoformSelection';
import useUniProtIdLookup from '../hooks/useUniProtIdLookup';
import { getPdbStructureUrl, uniprotEntryUrl } from '../utils/structureUrls';
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
    endRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
});
// Experimental structures of the gene's protein, found through SIFTS: PDBe
// lists every entry mapped to the UniProt accession, ranked on coverage and
// resolution, so a reader who does not know a PDB id can still reach one.
// A crystal is usually a fragment, often with partners, so the view aligns
// the transcript to it after launch rather than expecting a sequence match
// here.
const PdbSearch = observer(function PdbSearch({ feature, session, view, handleClose, alignmentAlgorithm, onAlignmentAlgorithmChange, }) {
    const { classes } = useStyles();
    const lookup = useUniProtIdLookup({ feature, view });
    const { uniprotId, isAutoMode, isLookupLoading } = lookup;
    const { entries, error: pdbError, isLoading: isPdbLoading, } = usePdbBestStructures(uniprotId);
    const [userPdbId, setUserPdbId] = useState();
    const { transcripts, isoformSequences, isLoading: isIsoformLoading, error: isoformError, selectedTranscriptId, setSelectedTranscriptId, selectedTranscript, selectedIsoform, } = useTranscriptIsoformSelection({ feature, view, resetKey: uniprotId });
    const selectedPdbId = userPdbId && entries?.some(e => e.pdbId === userPdbId)
        ? userPdbId
        : entries?.[0]?.pdbId;
    const loadingStatuses = [
        isLookupLoading && 'Looking up UniProt ID',
        isIsoformLoading && 'Loading protein sequences from transcript isoforms',
        isPdbLoading && 'Listing PDB entries from PDBe',
    ].filter((s) => !!s);
    const isLoading = loadingStatuses.length > 0;
    const error = isLoading
        ? undefined
        : (isoformError ?? lookup.lookupError ?? pdbError);
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            error ? React.createElement(ErrorMessage, { error: error }) : null,
            React.createElement(UniProtIdInput, { lookupMode: lookup.lookupMode, onLookupModeChange: lookup.setLookupMode, manualUniprotId: lookup.manualUniprotId, onManualUniprotIdChange: lookup.setManualUniprotId, featureUniprotId: lookup.featureUniprotId, endContent: lookup.showIdentifierSelector ? (React.createElement("div", { className: classes.endRow },
                    React.createElement(IdentifierSelector, { recognizedIds: lookup.recognizedIds, geneName: lookup.geneName, selectedId: lookup.selectedQueryId, onSelectedIdChange: lookup.setSelectedQueryId }),
                    React.createElement(TextField, { size: "small", label: "Organism (NCBI taxon)", helperText: "Scopes the gene-name search", value: lookup.taxonId, onChange: event => {
                            lookup.setTaxonId(event.target.value);
                        }, placeholder: String(lookup.effectiveTaxonId), slotProps: { inputLabel: { shrink: true } }, sx: { width: 180 } }))) : null }),
            loadingStatuses.map(status => (React.createElement(LoadingEllipses, { key: status, variant: "subtitle2", message: status }))),
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
            uniprotId && entries && !isPdbLoading ? (entries.length > 0 ? (React.createElement(PdbResultsTable, { entries: entries, selectedPdbId: selectedPdbId, onSelect: setUserPdbId })) : (React.createElement(Typography, null,
                "PDBe lists no experimental structure for",
                ' ',
                React.createElement(ExternalLink, { href: uniprotEntryUrl(uniprotId) }, uniprotId),
                ". The AlphaFoldDB tab has a predicted one."))) : null,
            isoformSequences && selectedTranscript ? (React.createElement(TranscriptSelector, { val: selectedTranscriptId, setVal: setSelectedTranscriptId, feature: feature, isoforms: transcripts, isoformSequences: isoformSequences })) : null),
        React.createElement(DialogActions, null,
            React.createElement(ProteinViewActions, { handleClose: handleClose, uniprotId: uniprotId, userSelectedProteinSequence: selectedIsoform, selectedTranscript: selectedTranscript, url: selectedPdbId ? getPdbStructureUrl(selectedPdbId) : undefined, feature: feature, view: view, session: session, alignmentAlgorithm: alignmentAlgorithm, onAlignmentAlgorithmChange: onAlignmentAlgorithmChange, isLoading: isLoading, error: error }))));
});
export default PdbSearch;
