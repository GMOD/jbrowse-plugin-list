import React, { useMemo, useState } from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { getContainingView, getSession, } from '@jbrowse/core/util';
import { Button, DialogActions, DialogContent, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import AlignmentSettingsButton from './AlignmentSettingsButton';
import HelpButton from './HelpButton';
import MSATable from './MSATable';
import TranscriptSelector from './TranscriptSelector';
import { ALIGNMENT_ALGORITHM_LABELS, } from '../../ProteinView/types';
import ExternalLink from '../../components/ExternalLink';
import useIsoformProteinSequences from '../hooks/useIsoformProteinSequences';
import useLocalStructureFileSequence from '../hooks/useLocalStructureFileSequence';
import useRemoteStructureFileSequence from '../hooks/useRemoteStructureFileSequence';
import useTranscriptSelection from '../hooks/useTranscriptSelection';
import { getGeneDisplayName, getId, getTranscriptDisplayName, getTranscriptFeatures, stripStopCodon, } from '../utils/util';
const useStyles = makeStyles()(theme => ({
    dialogContent: {
        marginTop: theme.spacing(6),
        width: '80em',
    },
    textAreaFont: {
        fontFamily: 'Courier New',
    },
}));
function HelpText() {
    return (React.createElement("div", { style: { marginBottom: 20 } },
        "Manually supply a protein structure (PDB, mmCIF, etc) for a given transcript. You can open the file from the result of running, for example,",
        ' ',
        React.createElement(ExternalLink, { href: "https://github.com/sokrypton/ColabFold" }, "ColabFold"),
        ". This plugin will align the protein sequence calculated from the genome to the protein sequence embedded in the structure file which allows for slight differences in these two representations."));
}
const UserProvidedStructure = observer(function UserProvidedStructure({ feature, model, handleClose, alignmentAlgorithm, onAlignmentAlgorithmChange, }) {
    const { classes } = useStyles();
    const session = getSession(model);
    const [file, setFile] = useState();
    const [pdbId, setPdbId] = useState('');
    const [choice, setChoice] = useState('file');
    const [submitError, setSubmitError] = useState();
    const [structureURL, setStructureURL] = useState('');
    const [showAllProteinSequences, setShowAllProteinSequences] = useState(false);
    // check if we are looking at a 'two-level' or 'three-level' feature by
    // finding exon/CDS subfeatures. we want to select from transcript names
    const options = useMemo(() => getTranscriptFeatures(feature), [feature]);
    const view = getContainingView(model);
    const { isoformSequences, error: isoformError } = useIsoformProteinSequences({
        feature,
        view,
    });
    const { sequences: structureSequences1, error: localFileError } = useLocalStructureFileSequence({ file });
    const { sequences: structureSequences2, error: remoteFileError } = useRemoteStructureFileSequence({ url: structureURL });
    const structureName = file?.name ?? structureURL.slice(structureURL.lastIndexOf('/') + 1);
    const structureSequences = structureSequences1 ?? structureSequences2;
    const structureSequence = structureSequences?.[0];
    const { userSelection, setUserSelection } = useTranscriptSelection({
        options,
        isoformSequences,
        structureSequence,
    });
    const selectedTranscript = options.find(val => getId(val) === userSelection);
    const protein = isoformSequences?.[userSelection ?? ''];
    const error = isoformError ?? submitError ?? localFileError ?? remoteFileError;
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            error ? React.createElement(ErrorMessage, { error: error }) : null,
            React.createElement(HelpText, null),
            React.createElement("div", { style: { display: 'flex', margin: 30 } },
                React.createElement(Typography, null,
                    "Open your structure file ",
                    React.createElement(HelpButton, null)),
                React.createElement(FormControl, { component: "fieldset" },
                    React.createElement(RadioGroup, { value: choice, onChange: event => {
                            setChoice(event.target.value);
                        } },
                        React.createElement(FormControlLabel, { value: "url", control: React.createElement(Radio, null), label: "URL" }),
                        React.createElement(FormControlLabel, { value: "file", control: React.createElement(Radio, null), label: "File" }),
                        React.createElement(FormControlLabel, { value: "pdb", control: React.createElement(Radio, null), label: "PDB ID" }))),
                choice === 'url' ? (React.createElement("div", null,
                    React.createElement(Typography, null, "Open a PDB/mmCIF/etc. file from remote URL"),
                    React.createElement(TextField, { label: "URL", value: structureURL, onChange: event => {
                            setStructureURL(event.target.value);
                        } }))) : null,
                choice === 'file' ? (React.createElement("div", { style: { paddingTop: 20 } },
                    React.createElement(Typography, null, "Open a PDB/mmCIF/etc. file from your local drive"),
                    React.createElement(Button, { variant: "outlined", component: "label" },
                        "Choose File",
                        React.createElement("input", { type: "file", hidden: true, onChange: ({ target }) => {
                                const file = target.files?.[0];
                                if (file) {
                                    setFile(file);
                                }
                            } })))) : null,
                choice === 'pdb' ? (React.createElement(TextField, { value: pdbId, onChange: event => {
                        const s = event.target.value;
                        setPdbId(s);
                        setStructureURL(`https://files.rcsb.org/download/${s}.cif`);
                    }, label: "PDB ID" })) : null),
            React.createElement("div", { style: { margin: 20 } }, isoformSequences ? (structureSequence ? (React.createElement(React.Fragment, null,
                React.createElement(TranscriptSelector, { val: userSelection ?? '', setVal: setUserSelection, structureSequence: structureSequence, isoforms: options, feature: feature, isoformSequences: isoformSequences }),
                React.createElement("div", { style: { margin: 10 } },
                    React.createElement(Button, { variant: "contained", color: "primary", onClick: () => {
                            setShowAllProteinSequences(!showAllProteinSequences);
                        } }, showAllProteinSequences
                        ? 'Hide all isoform protein sequences'
                        : 'Show all isoform protein sequences'),
                    showAllProteinSequences ? (React.createElement(MSATable, { structureSequence: structureSequence, structureName: structureName, isoformSequences: isoformSequences })) : null))) : null) : (React.createElement(LoadingEllipses, { title: "Loading protein sequences", variant: "h6" })))),
        React.createElement(DialogActions, null,
            protein?.seq &&
                structureSequence &&
                stripStopCodon(protein.seq) !== structureSequence ? (React.createElement(Typography, { variant: "body2", sx: { mr: 2, display: 'flex', alignItems: 'center' } },
                "Transcript and structure sequences differ, will run",
                ' ',
                ALIGNMENT_ALGORITHM_LABELS[alignmentAlgorithm] ??
                    alignmentAlgorithm,
                ' ',
                "alignment",
                React.createElement(AlignmentSettingsButton, { value: alignmentAlgorithm, onChange: onAlignmentAlgorithmChange }))) : null,
            React.createElement(Button, { variant: "contained", color: "secondary", onClick: () => {
                    handleClose();
                } }, "Cancel"),
            React.createElement(Button, { variant: "contained", color: "primary", disabled: !(structureURL || file) || !protein || !selectedTranscript, onClick: () => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    ;
                    (async () => {
                        try {
                            const structureData = file ? await file.text() : undefined;
                            session.addView('ProteinView', {
                                type: 'ProteinView',
                                alignmentAlgorithm,
                                displayName: `Protein view ${getGeneDisplayName(feature)} - ${getTranscriptDisplayName(selectedTranscript)}`,
                                structures: [
                                    {
                                        url: structureURL || undefined,
                                        data: structureData,
                                        connectedViewId: view.id,
                                        feature: selectedTranscript?.toJSON(),
                                        userProvidedTranscriptSequence: protein?.seq ?? '',
                                    },
                                ],
                            });
                            handleClose();
                        }
                        catch (e) {
                            console.error(e);
                            setSubmitError(e);
                        }
                    })();
                } }, "Launch 3-D protein structure view"))));
});
export default UserProvidedStructure;
//# sourceMappingURL=UserProvidedStructure.js.map