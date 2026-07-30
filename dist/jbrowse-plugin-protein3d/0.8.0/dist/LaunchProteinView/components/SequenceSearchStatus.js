import React from 'react';
import { Typography } from '@mui/material';
export default function SequenceSearchStatus({ isLoading, uniprotId, url, hasProteinSequence, sequenceSearchType, }) {
    return isLoading ? null : !uniprotId && hasProteinSequence ? (React.createElement(Typography, { color: "warning.main" },
        "No AlphaFold structure found for this sequence (searched by",
        ' ',
        sequenceSearchType === 'md5' ? 'MD5 checksum' : 'full sequence',
        ")")) : uniprotId ? (React.createElement(Typography, { color: "success.main" },
        "Found AlphaFold structure: ",
        uniprotId,
        url ? (React.createElement(React.Fragment, null,
            ' ',
            "-",
            ' ',
            React.createElement("a", { href: url, target: "_blank", rel: "noreferrer" }, url))) : null)) : null;
}
