import React from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { Button, DialogActions, DialogContent, Divider, Typography, } from '@mui/material';
import ExternalLink from '../../components/ExternalLink';
const ISSUES_URL = 'https://github.com/GMOD/jbrowse-plugin-protein3d/issues';
export default function HelpDialog({ handleClose, }) {
    return (React.createElement(Dialog, { open: true, maxWidth: "lg", onClose: handleClose, title: "Help" },
        React.createElement(DialogContent, null,
            React.createElement(Typography, { sx: { mb: 2 } }, "Each tab finds a structure a different way. All of them end in the same place: the plugin aligns the structure's residues to the protein sequence it translates from the transcript you pick, and that alignment maps genome coordinates onto positions in the 3D view."),
            React.createElement(Typography, { component: "div" },
                React.createElement("ul", null,
                    React.createElement("li", null,
                        React.createElement("b", null, "AlphaFoldDB search"),
                        " resolves the feature to a UniProt accession \u2014 from its own identifiers, or one you type \u2014 and opens AlphaFold's predicted model for it."),
                    React.createElement("li", null,
                        React.createElement("b", null, "PDB search"),
                        " lists the experimental structures PDBe maps to that accession, ranked on coverage and resolution. A crystal is usually one domain, often with binding partners, so the view picks the chain the transcript belongs to once the structure loads."),
                    React.createElement("li", null,
                        React.createElement("b", null, "Foldseek search"),
                        " sends the protein sequence to the foldseek.com servers and lists structures similar in shape, including ones with little sequence similarity."),
                    React.createElement("li", null,
                        React.createElement("b", null, "File or URL"),
                        " opens a structure you already have \u2014 the output of ColabFold or another modelling tool, or any PDB/mmCIF file reachable by URL."))),
            React.createElement(Typography, { sx: { mb: 2 } }, "The isoform list marks which transcripts match the structure's residues exactly, and counts identical residues for the rest. You do not need an exact match; the alignment absorbs the differences between the two representations."),
            React.createElement(Typography, null,
                "If a gene will not resolve, or something looks wrong, please open an issue at",
                ' ',
                React.createElement(ExternalLink, { href: ISSUES_URL }, "github.com/GMOD/jbrowse-plugin-protein3d"),
                ".")),
        React.createElement(Divider, null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: handleClose, color: "primary" }, "Close"))));
}
