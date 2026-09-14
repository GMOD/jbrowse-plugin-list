import React from 'react';
import { Typography } from '@mui/material';
import IsoformSequencesToggle from './IsoformSequencesToggle';
import ExternalLink from '../../components/ExternalLink';
import { uniprotEntryUrl } from '../utils/structureUrls';
export default function AlphaFoldDBSearchStatus({ uniprotId, structureSequence, isoformSequences, url, }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", null,
            React.createElement(Typography, null,
                "UniProt link:",
                ' ',
                React.createElement(ExternalLink, { href: uniprotEntryUrl(uniprotId) }, uniprotId)),
            React.createElement(Typography, null,
                "AlphaFoldDB link: ",
                React.createElement(ExternalLink, { href: url }, url))),
        React.createElement(IsoformSequencesToggle, { structureSequence: structureSequence, structureName: uniprotId, isoformSequences: isoformSequences })));
}
