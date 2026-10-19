import React from 'react';
import { Typography } from '@mui/material';
import { uniprotEntryUrl } from 'p2s_mapper';
import ExternalLink from '../../components/ExternalLink';
export default function AlphaFoldDBSearchStatus({ uniprotId, url, }) {
    return (React.createElement("div", null,
        React.createElement(Typography, null,
            "UniProt link:",
            ' ',
            React.createElement(ExternalLink, { href: uniprotEntryUrl(uniprotId) }, uniprotId)),
        React.createElement(Typography, null,
            "AlphaFoldDB link: ",
            React.createElement(ExternalLink, { href: url }, url))));
}
