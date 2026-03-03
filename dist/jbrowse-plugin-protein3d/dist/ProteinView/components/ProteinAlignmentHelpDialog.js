import React from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { Button, DialogActions, DialogContent, Typography } from '@mui/material';
function Typography2({ children }) {
    return (React.createElement(Typography, { style: {
            margin: 4,
            marginBottom: 12,
        } }, children));
}
export default function ProteinAlignmentHelpDialog({ handleClose, }) {
    return (React.createElement(Dialog, { open: true, maxWidth: "lg", onClose: handleClose, title: "Protein alignment" },
        React.createElement(DialogContent, null,
            React.createElement(Typography2, null, "This panel shows the computed pairwise alignment of the reference genome sequence to the structure sequence. The structure file (PDB file, mmCIF file, etc) has a stored representation of the e.g. amino acid sequence but the sequence in the structure file can differ from the sequence from the gene on the genome browser"),
            React.createElement(Typography2, null, "In order to resolve this, we align the two sequences together (using EMBOSS needle) to get pairwise alignment of the genome's representation of the protein and the structure file's representation of the protein."),
            React.createElement(Typography2, null, "If you need a 100% fidelity protein, you can do a folding with e.g. AlphaFold to make sure the structure you are using matches exactly the sequence of the transcript")),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: () => {
                    handleClose();
                }, variant: "contained", color: "primary" }, "Close"))));
}
//# sourceMappingURL=ProteinAlignmentHelpDialog.js.map