import React from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { Button, DialogActions, DialogContent, Divider, Typography, } from '@mui/material';
export default function HelpDialog({ handleClose, }) {
    return (React.createElement(Dialog, { open: true, maxWidth: "md", onClose: handleClose, title: "Launching an MSA" },
        React.createElement(DialogContent, null,
            React.createElement(Typography, { gutterBottom: true }, "Every tab aligns the same thing: the protein the selected transcript translates to. That transcript is the query row, which is what ties alignment columns back to codons in the genome view \u2014 hovering one highlights the other, and clicking navigates."),
            React.createElement(Typography, { variant: "h6", gutterBottom: true }, "Orthologs"),
            React.createElement(Typography, { gutterBottom: true }, "Precomputed sets, looked up rather than searched for: NCBI and PANTHER give one gene per species, and a UniRef cluster gives every UniProtKB entry within 50% identity of the query, one per species, from any organism. Nothing is queued, so this is the quickest route to \"this gene across species\"."),
            React.createElement(Typography, { variant: "h6", gutterBottom: true }, "BLAST query"),
            React.createElement(Typography, { gutterBottom: true }, "Searches run at EBI's Job Dispatcher, which searches UniProtKB. Swiss-Prot returns curated sequences that align more cleanly than the many near-identical entries a TrEMBL search brings back. blastp finds the hits and the chosen aligner then aligns them \u2014 \"in browser\" needs no second EBI job. phmmer instead searches with a profile HMM built from the query and aligns as it goes, so its output is the alignment and nothing is realigned; a hit matching the query in more than one place appears once per matched region. The Representative Proteomes (15% to 75%) spread the hits across all of life."),
            React.createElement(Typography, { gutterBottom: true }, "The EBI queue is the wait, and it runs from seconds to many minutes. Searching NCBI's nr needs the Manual option, which links out to NCBI's own site: NCBI no longer lets a browser read responses from Blast.cgi."),
            React.createElement(Typography, { variant: "h6", gutterBottom: true }, "Pre-loaded MSA datasets and Manual upload"),
            React.createElement(Typography, { gutterBottom: true }, "Both take an alignment that already exists \u2014 one a dataset the site configured, the other a file or pasted text. In each case the row matching the selected transcript is found by comparing residues, not by name, because aligners rename the query on the way through.")),
        React.createElement(Divider, null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: handleClose, color: "primary" }, "Close"))));
}
