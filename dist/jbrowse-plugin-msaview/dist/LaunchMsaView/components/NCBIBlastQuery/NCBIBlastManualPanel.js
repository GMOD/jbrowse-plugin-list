import React from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import { getContainingView, shorten2 } from '@jbrowse/core/util';
import { Button, DialogActions, DialogContent, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import ExternalLink from '../../../components/ExternalLink';
import { cleanProteinSequence } from '../../util';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
const useStyles = makeStyles()({
    dialogContent: {
        width: '80em',
    },
    textAreaFont: {
        fontFamily: 'Courier New',
    },
    ncbiLink: {
        wordBreak: 'break-all',
        margin: 30,
        maxWidth: 600,
    },
});
const NCBIBlastManualPanel = observer(function ({ handleClose, feature, model, children, baseUrl, }) {
    const { classes } = useStyles();
    const view = getContainingView(model);
    const { options, selectedId, setSelectedId, selectedTranscript, proteinSequence, error, } = useTranscriptSelection({ feature, view });
    const s2 = cleanProteinSequence(proteinSequence);
    const link = `${baseUrl}?PAGE_TYPE=BlastSearch&PAGE=Proteins&PROGRAM=blastp&QUERY=${s2}`;
    const link2 = `${baseUrl}?PAGE_TYPE=BlastSearch&PAGE=Proteins&PROGRAM=blastp&QUERY=${shorten2(s2, 10)}`;
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            children,
            error ? React.createElement(ErrorMessage, { error: error }) : null,
            React.createElement(TranscriptSelector, { feature: feature, options: options, selectedId: selectedId, selectedTranscript: selectedTranscript, onTranscriptChange: setSelectedId, proteinSequence: proteinSequence }),
            proteinSequence ? (React.createElement("div", { className: classes.ncbiLink },
                "Link to NCBI BLAST: ",
                React.createElement(ExternalLink, { href: link }, link2))) : null,
            React.createElement(Typography, { style: { marginTop: 20 } }, "Click the link above and run your BLAST query, and once you have results, click \"Multiple Alignment\" at the top of the results page to be redirected to COBALT, NCBI's multiple sequence aligner. Once COBALT completes, you can download an MSA (.aln file) and optionally a Newick tree (.nh) and paste the results into JBrowse")),
        React.createElement(DialogActions, null,
            React.createElement(Button, { color: "primary", variant: "contained", onClick: () => {
                    handleClose();
                } }, "Submit"),
            React.createElement(Button, { color: "secondary", variant: "contained", onClick: () => {
                    handleClose();
                } }, "Close"))));
});
export default NCBIBlastManualPanel;
//# sourceMappingURL=NCBIBlastManualPanel.js.map