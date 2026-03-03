import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import MSATable from './MSATable';
import ExternalLink from '../../components/ExternalLink';
import { getDisplayName } from '../utils/util';
function NotFound({ uniprotId }) {
    return (React.createElement(Typography, null,
        "No structure found for this UniProtID in AlphaFoldDB",
        ' ',
        React.createElement(ExternalLink, { href: `https://alphafold.ebi.ac.uk/search/text/${uniprotId}` }, "(search for results)")));
}
export default function AlphaFoldDBSearchStatus({ uniprotId, selectedTranscript, structureSequence, isoformSequences, url, }) {
    const url2 = uniprotId
        ? `https://www.uniprot.org/uniprotkb/${uniprotId}/entry`
        : undefined;
    const [showAllProteinSequences, setShowAllProteinSequences] = useState(false);
    return uniprotId ? (React.createElement(React.Fragment, null,
        React.createElement("div", null,
            React.createElement(Typography, null,
                "UniProt link: ",
                React.createElement(ExternalLink, { href: url2 }, uniprotId)),
            React.createElement(Typography, null,
                "AlphaFoldDB link: ",
                React.createElement(ExternalLink, { href: url }, url))),
        structureSequence ? (React.createElement("div", { style: { margin: 20 } },
            React.createElement(Button, { variant: "contained", color: "primary", onClick: () => {
                    setShowAllProteinSequences(!showAllProteinSequences);
                } }, showAllProteinSequences
                ? 'Hide all isoform protein sequences'
                : 'Show all isoform protein sequences'),
            showAllProteinSequences ? (React.createElement(MSATable, { structureSequence: structureSequence, structureName: uniprotId, isoformSequences: isoformSequences })) : null)) : (React.createElement(NotFound, { uniprotId: uniprotId })))) : (React.createElement(Typography, null,
        "Searching",
        ' ',
        selectedTranscript ? getDisplayName(selectedTranscript) : 'transcript',
        ' ',
        "for UniProt ID"));
}
//# sourceMappingURL=AlphaFoldDBSearchStatus.js.map