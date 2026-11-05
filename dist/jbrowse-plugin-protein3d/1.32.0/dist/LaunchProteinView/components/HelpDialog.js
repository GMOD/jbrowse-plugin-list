import React from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { Button, DialogActions, DialogContent, Divider, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import ExternalLink from '../../components/ExternalLink';
const ISSUES_URL = 'https://github.com/GMOD/jbrowse-plugin-protein3d/issues';
const HelpDialog = observer(function HelpDialog({ handleClose, }) {
    return (React.createElement(Dialog, { open: true, maxWidth: "lg", onClose: handleClose, title: "Help" },
        React.createElement(DialogContent, null,
            React.createElement(Typography, { sx: { mb: 2 } }, "Each tab finds a structure a different way. All of them end in the same place: the plugin aligns the structure's residues to the protein sequence it translates from the transcript you pick, and that alignment maps genome coordinates onto positions in the 3D view."),
            React.createElement(Typography, { component: "div" },
                React.createElement("ul", null,
                    React.createElement("li", null,
                        React.createElement("b", null, "Structures for the gene"),
                        " resolves the feature to a UniProt entry, shown in the bar at the top (",
                        React.createElement("i", null, "Change"),
                        " picks another), and lists every structure found for it: AlphaFold's model, the experimental PDB entries RCSB aligns to the entry, and the complexes AlphaFold DB predicted with other proteins. The list is grouped by what each structure shows: the protein on its own, the protein with another protein, and short fragments. Check several rows to open them in one view, superposed onto the first; a short fragment opens on its own. ",
                        React.createElement("i", null, "Open by PDB ID"),
                        " opens any entry instead."),
                    React.createElement("li", null,
                        React.createElement("b", null, "Similar structures (Foldseek)"),
                        " sends the protein sequence to the foldseek.com servers and lists structures similar in shape, including ones with little sequence similarity."),
                    React.createElement("li", null,
                        React.createElement("b", null, "Your file or URL"),
                        " opens a structure you already have \u2014 the output of ColabFold or another modelling tool, or any PDB/mmCIF file reachable by URL."))),
            React.createElement(Typography, { sx: { mb: 2 } }, "The transcript list ranks the isoforms against the first checked structure, marking which match its residues exactly and counting identical residues for the rest. You do not need an exact match; the alignment absorbs the differences between the two representations."),
            React.createElement(Typography, null,
                "If a gene will not resolve, or something looks wrong, please open an issue at",
                ' ',
                React.createElement(ExternalLink, { href: ISSUES_URL }, "github.com/GMOD/jbrowse-plugin-protein3d"),
                ".")),
        React.createElement(Divider, null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: handleClose, color: "primary" }, "Close"))));
});
export default HelpDialog;
