import React, { useEffect, useMemo, useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import { getContainingView, } from '@jbrowse/core/util';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Button, DialogActions, DialogContent, MenuItem, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import CachedBlastResults from './CachedBlastResults';
import { blastLaunchView } from './blastLaunchView';
import TextField2 from '../../../components/TextField2';
import { getAllCachedResults } from '../../../utils/blastCache';
import { getGeneDisplayName, getTranscriptDisplayName } from '../../util';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
function getGeneIdentifiers(feature) {
    const ids = [
        feature.id(),
        feature.get('id'),
        feature.get('name'),
        feature.get('gene_id'),
        feature.get('gene_name'),
    ].filter((id) => !!id);
    return [...new Set(ids)];
}
const useStyles = makeStyles()({
    dialogContent: {
        width: '80em',
    },
    textAreaFont: {
        fontFamily: 'Courier New',
    },
});
const blastDatabaseOptions = ['nr', 'nr_cluster_seq'];
const msaAlgorithms = ['clustalo', 'muscle', 'kalign', 'mafft'];
const blastPrograms = ['blastp', 'quick-blastp'];
const NCBIBlastAutomaticPanel = observer(function ({ handleClose, feature, model, children, baseUrl, }) {
    const { classes } = useStyles();
    const view = getContainingView(model);
    const [launchViewError, setLaunchViewError] = useState();
    const [selectedBlastDatabase, setSelectedBlastDatabase] = useState('nr');
    const [selectedMsaAlgorithm, setSelectedMsaAlgorithm] = useState('clustalo');
    const [selectedBlastProgram, setSelectedBlastProgram] = useState('quick-blastp');
    const [hasCachedResults, setHasCachedResults] = useState(false);
    const [error, setError] = useState();
    const geneIds = useMemo(() => getGeneIdentifiers(feature), [feature]);
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        ;
        (async () => {
            try {
                const results = await getAllCachedResults();
                setHasCachedResults(results.some(r => r.geneId && geneIds.includes(r.geneId)));
            }
            catch (e) {
                console.error(e);
                setError(e);
            }
        })();
    }, [geneIds]);
    const { options, selectedId, setSelectedId, selectedTranscript, proteinSequence, error: proteinSequenceError, } = useTranscriptSelection({ feature, view });
    useEffect(() => {
        if (selectedBlastDatabase === 'nr_cluster_seq') {
            setSelectedBlastProgram('blastp');
        }
    }, [selectedBlastDatabase]);
    const e = proteinSequenceError ?? launchViewError ?? error;
    const style = { width: 150 };
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            children,
            e ? React.createElement(ErrorMessage, { error: e }) : null,
            React.createElement(TextField2, { variant: "outlined", label: "BLAST database", style: style, select: true, value: selectedBlastDatabase, onChange: event => {
                    setSelectedBlastDatabase(event.target.value);
                } }, blastDatabaseOptions.map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))),
            React.createElement(TextField2, { variant: "outlined", label: "MSA Algorithm", style: style, select: true, value: selectedMsaAlgorithm, onChange: event => {
                    setSelectedMsaAlgorithm(event.target.value);
                } }, msaAlgorithms.map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))),
            React.createElement("div", { style: { display: 'flex' } },
                React.createElement(TextField2, { variant: "outlined", label: "BLAST program", disabled: selectedBlastDatabase === 'nr_cluster_seq', style: style, select: true, value: selectedBlastProgram, onChange: event => {
                        setSelectedBlastProgram(event.target.value);
                    } }, blastPrograms.map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))),
                selectedBlastDatabase === 'nr_cluster_seq' ? (React.createElement(Typography, { variant: "subtitle2", style: {
                        marginLeft: 4,
                        alignContent: 'center',
                    } }, "Can only use blastp on nr_cluster_seq")) : null),
            React.createElement(TranscriptSelector, { feature: feature, options: options, selectedId: selectedId, selectedTranscript: selectedTranscript, onTranscriptChange: setSelectedId, proteinSequence: proteinSequence }),
            React.createElement(Typography, { style: { marginTop: 20 } }, "This panel will automatically submit a query to NCBI. Using blastp can take 10+ minutes to run, quick-blastp is generally a lot faster but is not available for the clustered database. After completion, all the hits will be run through a multiple sequence alignment. Note: we are not able to currently run NCBI COBALT automatically on the BLAST results, even though that is the method NCBI uses on their website. If you need a COBALT alignment, please use the manual approach of submitting BLAST yourself and downloading the resulting files"),
            hasCachedResults ? (React.createElement(Accordion, { style: { marginTop: 20 } },
                React.createElement(AccordionSummary, { expandIcon: React.createElement(ExpandMoreIcon, null) },
                    React.createElement(Typography, null, "Previous BLAST Results")),
                React.createElement(AccordionDetails, null,
                    React.createElement(CachedBlastResults, { model: model, handleClose: handleClose, feature: feature })))) : null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { color: "primary", variant: "contained", onClick: () => {
                    try {
                        if (!selectedTranscript) {
                            return;
                        }
                        setLaunchViewError(undefined);
                        blastLaunchView({
                            feature: selectedTranscript,
                            view,
                            newViewTitle: `BLAST - ${getGeneDisplayName(feature)} - ${getTranscriptDisplayName(selectedTranscript)}`,
                            blastParams: {
                                baseUrl,
                                blastProgram: selectedBlastProgram,
                                blastDatabase: selectedBlastDatabase,
                                msaAlgorithm: selectedMsaAlgorithm,
                                selectedTranscript,
                                proteinSequence,
                            },
                        });
                    }
                    catch (e) {
                        console.error(e);
                        setLaunchViewError(e);
                    }
                    handleClose();
                }, disabled: !proteinSequence }, "Submit"),
            React.createElement(Button, { color: "secondary", variant: "contained", onClick: () => {
                    handleClose();
                } }, "Cancel"))));
});
export default NCBIBlastAutomaticPanel;
//# sourceMappingURL=NCBIBlastAutomaticPanel.js.map