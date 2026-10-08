import React from 'react';
import { Typography } from '@mui/material';
import UniProtResultsTable from './UniProtResultsTable';
import ExternalLink from '../../components/ExternalLink';
function UniProtLink() {
    return React.createElement(ExternalLink, { href: "https://www.uniprot.org/" }, "UniProt");
}
// What the identifier search found, shared by the search tabs for the same
// reason UniProtLookupControls is. A failed search shows neither: the tab
// reports the error, and "no entries" would call an outage an empty answer.
export default function UniProtLookupResults({ lookup, }) {
    const hasEntries = lookup.uniprotEntries.length > 0;
    return !lookup.isAutoMode ? null : hasEntries ? (React.createElement(React.Fragment, null,
        React.createElement(Typography, { variant: "body2", color: "textSecondary" },
            "Searched UniProt by ",
            lookup.searchDescription),
        React.createElement(UniProtResultsTable, { entries: lookup.uniprotEntries, selectedAccession: lookup.selectedTableAccession, onSelect: lookup.setSelectedUniprotId }),
        React.createElement(Typography, { variant: "body2", color: "textSecondary" },
            "If you don't see the entry you're looking for, try a different identifier above or search ",
            React.createElement(UniProtLink, null),
            " directly and use \"Enter manually\"."))) : lookup.isLookupLoading || lookup.lookupError ? null : (React.createElement(Typography, { variant: "body2", color: "textSecondary" },
        "No UniProt entries found for ",
        lookup.searchDescriptionOr,
        ". Try a different identifier above, or search ",
        React.createElement(UniProtLink, null),
        " directly and use \"Enter manually\"."));
}
