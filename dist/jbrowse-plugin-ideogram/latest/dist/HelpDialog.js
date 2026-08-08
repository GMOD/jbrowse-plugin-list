import React from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { Button, DialogActions, DialogContent, Divider } from '@mui/material';
/**
 * Core's Dialog rather than MUI's: it supplies the title bar, the close button
 * and the divider under them, so the hand-rolled versions of all three are gone
 * along with the absolute-positioned closeButton style they needed. It also
 * puts the dialog on JBrowse's own theme and error boundary.
 *
 * Imported from the `@jbrowse/core/ui` barrel, NOT `@jbrowse/core/ui/Dialog`.
 * Only the barrel is in ReExports/list.ts, so the deep path is not externalized
 * and bundles a second copy of Dialog and everything it reaches (dompurify by
 * way of SanitizedHTML, the error boundary, the dialog theme): 68kB, measured.
 */
export default function HelpDialog({ handleClose, }) {
    return (React.createElement(Dialog, { open: true, maxWidth: "xl", onClose: handleClose, title: "How to use annotations files" },
        React.createElement(DialogContent, null,
            React.createElement("h3", null, "General"),
            React.createElement("ul", null,
                React.createElement("li", null, "annotations must be uploaded as a TSV with column headers"),
                React.createElement("li", null,
                    "enforced location data must be under a heading called",
                    ' ',
                    React.createElement("code", null, "genomeLocation"),
                    " and be in the format of 'chromosomeNumber:start-end', e.g. '1:39895426-39902013'"),
                React.createElement("li", null, "alternatively, annotation files provided without genome location data will attempt to be cross referenced with a remote file of gene locations"),
                React.createElement("li", null,
                    "each row of data must include ",
                    React.createElement("code", null, "name"))),
            React.createElement("h3", null, "External Links"),
            "Any external links that wish to be formatted on the widget properly must be in the following format:",
            React.createElement("ul", null,
                React.createElement("li", null,
                    "under a header ",
                    React.createElement("code", null, "externalLinks")),
                React.createElement("li", null,
                    "a JSON string appearing as follows:",
                    ' ',
                    React.createElement("code", null, '"[{"name": "MYLINK", "link": "https://my-link.com/"}]"')),
                React.createElement("li", null, "each annotation that you wish to have external links to must have this json string"),
                React.createElement("li", null, "multiple external links are permitted")),
            React.createElement("h3", null, "Colours and Categorization"),
            "Annotations can be categorized into two categories if the 'tier' header is within the TSV.",
            React.createElement("ul", null,
                React.createElement("li", null, "tier 1 is annotated in blue"),
                React.createElement("li", null, "tier 2 is annotated in red"),
                React.createElement("li", null, "this field is to be provided as a 1 or a 2")),
            React.createElement("h3", null, "Examples"),
            React.createElement("ul", null,
                React.createElement("li", null,
                    "TSV with only required headers",
                    React.createElement("br", null),
                    React.createElement("code", null,
                        "name",
                        React.createElement("br", null),
                        "note1",
                        React.createElement("br", null),
                        "note2")),
                React.createElement("br", null),
                React.createElement("li", null,
                    "TSV with optional headers",
                    React.createElement("br", null),
                    React.createElement("code", null,
                        "name\tgenomeLocation\ttier\texternalLinks",
                        React.createElement("br", null),
                        "note1\t1:39895426-39902013\t1\t",
                        `[{"name":"MYLINK","link":"https://my-link.com/note1"}]`,
                        React.createElement("br", null),
                        "note2\t1:157573749-157598080\t2\t",
                        `[{"name":"MYLINK","link":"https://my-link.com/note2"}]`)))),
        React.createElement(Divider, null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: () => { handleClose(); }, color: "primary" }, "Close"))));
}
//# sourceMappingURL=HelpDialog.js.map