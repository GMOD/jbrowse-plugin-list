import React from 'react';
import { Typography } from '@mui/material';
export default function SequenceSearchStatus({ isLoading, uniprotId, url, hasProteinSequence, sequenceSearchType, }) {
    if (isLoading) {
        return null;
    }
    if (!uniprotId && hasProteinSequence) {
        return (React.createElement(Typography, { color: "warning.main" },
            "No AlphaFold structure found for this sequence (searched by",
            ' ',
            sequenceSearchType === 'md5' ? 'MD5 checksum' : 'full sequence',
            ")"));
    }
    if (uniprotId) {
        return (React.createElement(Typography, { color: "success.main" },
            "Found AlphaFold structure: ",
            uniprotId,
            url && (React.createElement(React.Fragment, null,
                ' ',
                "-",
                ' ',
                React.createElement("a", { href: url, target: "_blank", rel: "noreferrer" }, url)))));
    }
    return null;
}
//# sourceMappingURL=SequenceSearchStatus.js.map