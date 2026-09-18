import React, { useState } from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { observer } from 'mobx-react';
import { stripStopCodon } from 'p2s_mapper';
import { makeStyles } from 'tss-react/mui';
import PartialFailureNotice from './PartialFailureNotice';
import SequenceMismatchNotice from './SequenceMismatchNotice';
import StructureSourcePicker from './StructureSourcePicker';
import TranscriptSelector from './TranscriptSelector';
import ExternalLink from '../../components/ExternalLink';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { useSafeLaunch } from '../hooks/useSafeLaunch';
import useStructureFileSequence from '../hooks/useStructureFileSequence';
import useTranscriptIsoformSelection from '../hooks/useTranscriptIsoformSelection';
import { launch3DProteinView } from '../utils/launchViewUtils';
import { readStructureFile } from '../utils/readStructureFile';
const useStyles = makeStyles()(theme => ({
    dialogContent: {
        marginTop: theme.spacing(6),
        width: '80em',
    },
}));
function HelpText() {
    return (React.createElement("div", { style: { marginBottom: 20 } },
        "Manually supply a protein structure (PDB, mmCIF, etc) for a given transcript. You can open the file from the result of running, for example,",
        ' ',
        React.createElement(ExternalLink, { href: "https://github.com/sokrypton/ColabFold" }, "ColabFold"),
        ". This plugin will align the protein sequence calculated from the genome to the protein sequence embedded in the structure file which allows for slight differences in these two representations."));
}
const UserProvidedStructure = observer(function UserProvidedStructure({ feature, session, view, handleClose, }) {
    const { classes } = useStyles();
    const [file, setFile] = useState();
    const [choice, setChoice] = useState('file');
    const [structureURL, setStructureURL] = useState('');
    const { runLaunch, launchError } = useSafeLaunch(handleClose);
    const activeFile = choice === 'file' ? file : undefined;
    const activeURL = choice === 'file' ? '' : structureURL;
    // Only the sequence read is debounced: typing a url is a fast-changing value
    // behind a download and a molstar parse. The launch reads the field itself,
    // so clicking inside the window opens what the user typed rather than the
    // url as it stood 600 ms ago.
    const debouncedURL = useDebouncedValue(activeURL, 600);
    const { sequences: structureSequences, isLoading: isStructureLoading, error: fileError, } = useStructureFileSequence({ file: activeFile, url: debouncedURL });
    const { transcripts: options, isoformSequences, 
    // the chain the isoforms are compared against — not blindly chain 0, which
    // mismatched every heteromer the view itself went on to map correctly
    structureSequence, selectedTranscriptId: userSelection, setSelectedTranscriptId: setUserSelection, selectedTranscript, selectedIsoform: protein, error: isoformError, partialFailure: isoformPartialFailure, } = useTranscriptIsoformSelection({ feature, view, structureSequences });
    const error = isoformError ?? launchError ?? fileError;
    const canLaunch = !!(activeURL || activeFile) && !!protein && !!selectedTranscript;
    const sequencesDiffer = !!protein?.seq &&
        !!structureSequence &&
        stripStopCodon(protein.seq) !== structureSequence;
    const handleLaunch = runLaunch(async () => {
        if (protein && selectedTranscript) {
            const structureData = activeFile
                ? await readStructureFile(activeFile)
                : undefined;
            launch3DProteinView({
                session,
                view,
                feature,
                selectedTranscript,
                url: activeURL ? activeURL : undefined,
                data: structureData,
                userProvidedTranscriptSequence: protein.seq,
            });
        }
    });
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            error ? React.createElement(ErrorMessage, { error: error }) : null,
            React.createElement(HelpText, null),
            React.createElement(StructureSourcePicker, { choice: choice, setChoice: setChoice, structureURL: structureURL, setStructureURL: setStructureURL, setFile: setFile }),
            React.createElement("div", { style: { margin: 20 } },
                isStructureLoading ? (React.createElement(LoadingEllipses, { variant: "subtitle2", message: "Reading residues from the structure" })) : null,
                React.createElement(PartialFailureNotice, { message: isoformPartialFailure }),
                isoformSequences ? (structureSequence ? (React.createElement(TranscriptSelector, { val: userSelection, setVal: setUserSelection, structureSequence: structureSequence, isoforms: options, feature: feature, isoformSequences: isoformSequences })) : null) : (React.createElement(LoadingEllipses, { title: "Loading protein sequences", variant: "h6" })))),
        React.createElement(DialogActions, null,
            sequencesDiffer ? React.createElement(SequenceMismatchNotice, null) : null,
            React.createElement(Button, { variant: "contained", color: "secondary", onClick: () => {
                    handleClose();
                } }, "Cancel"),
            React.createElement(Button, { variant: "contained", color: "primary", disabled: !canLaunch, onClick: () => {
                    handleLaunch();
                } }, "Launch 3D protein structure view"))));
});
export default UserProvidedStructure;
