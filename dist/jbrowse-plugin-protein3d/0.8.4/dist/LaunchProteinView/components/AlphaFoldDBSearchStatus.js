import React from 'react';
import { Typography } from '@mui/material';
import IsoformSequencesToggle from './IsoformSequencesToggle';
import ExternalLink from '../../components/ExternalLink';
import { uniprotEntryUrl } from '../utils/structureUrls';
import { getTranscriptDisplayName } from '../utils/util';
function NotFound({ uniprotId }) {
    return (React.createElement(Typography, null,
        "No structure found for this UniProtID in AlphaFoldDB",
        ' ',
        React.createElement(ExternalLink, { href: `https://alphafold.ebi.ac.uk/search/text/${uniprotId}` }, "(search for results)")));
}
export default function AlphaFoldDBSearchStatus({ uniprotId, selectedTranscript, structureSequence, isoformSequences, url, }) {
    return uniprotId ? (React.createElement(React.Fragment, null,
        React.createElement("div", null,
            React.createElement(Typography, null,
                "UniProt link:",
                ' ',
                React.createElement(ExternalLink, { href: uniprotEntryUrl(uniprotId) }, uniprotId)),
            React.createElement(Typography, null,
                "AlphaFoldDB link: ",
                React.createElement(ExternalLink, { href: url }, url))),
        structureSequence ? (React.createElement(IsoformSequencesToggle, { structureSequence: structureSequence, structureName: uniprotId, isoformSequences: isoformSequences })) : (React.createElement(NotFound, { uniprotId: uniprotId })))) : (React.createElement(Typography, null,
        "Searching",
        ' ',
        selectedTranscript
            ? getTranscriptDisplayName(selectedTranscript)
            : 'transcript',
        ' ',
        "for UniProt ID"));
}
