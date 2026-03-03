import React, { useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, ButtonGroup, Dialog, DialogContent, DialogTitle, MenuItem, MenuList, Typography, } from '@mui/material';
import AlignmentSettingsButton from './AlignmentSettingsButton';
import { ALIGNMENT_ALGORITHM_LABELS, } from '../../ProteinView/types';
import { hasMsaViewPlugin, launch1DProteinView, launch3DProteinView, launch3DProteinViewWithMsa, launchMsaView, } from '../utils/launchViewUtils';
export default function ProteinViewActions({ handleClose, uniprotId, userSelectedProteinSequence, selectedTranscript, url, confidenceUrl, feature, view, session, alignmentAlgorithm, onAlignmentAlgorithmChange, sequencesMatch, isLoading, }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const canLaunch = !!uniprotId && !!userSelectedProteinSequence && !!selectedTranscript;
    const missingReasons = isLoading
        ? []
        : [
            !uniprotId && 'No UniProt ID found',
            !userSelectedProteinSequence &&
                'Could not compute protein sequence (feature may be missing CDS subfeatures)',
            !selectedTranscript && 'No transcript selected',
        ].filter(Boolean);
    const handleLaunch3DView = () => {
        setDialogOpen(false);
        if (!selectedTranscript) {
            return;
        }
        launch3DProteinView({
            session,
            view,
            feature,
            selectedTranscript,
            uniprotId,
            url,
            userProvidedTranscriptSequence: userSelectedProteinSequence?.seq,
            alignmentAlgorithm,
        });
        handleClose();
    };
    const handleLaunch1DView = async () => {
        setDialogOpen(false);
        if (!uniprotId || !selectedTranscript) {
            return;
        }
        try {
            await launch1DProteinView({
                session,
                view,
                feature,
                selectedTranscript,
                uniprotId,
                confidenceUrl,
            });
        }
        catch (e) {
            console.error(e);
            session.notifyError(`${e}`, e);
        }
        handleClose();
    };
    const handleLaunchMSAView = () => {
        setDialogOpen(false);
        if (!selectedTranscript || !uniprotId) {
            return;
        }
        launchMsaView({
            session,
            view,
            feature,
            selectedTranscript,
            uniprotId,
        });
        handleClose();
    };
    const handleLaunch3DWithMsa = () => {
        setDialogOpen(false);
        if (!selectedTranscript || !uniprotId) {
            return;
        }
        launch3DProteinViewWithMsa({
            session,
            view,
            feature,
            selectedTranscript,
            uniprotId,
            url,
            userProvidedTranscriptSequence: userSelectedProteinSequence?.seq,
            alignmentAlgorithm,
        });
        handleClose();
    };
    return (React.createElement(React.Fragment, null,
        sequencesMatch === false ? (React.createElement(Typography, { variant: "body2", sx: { mr: 2, display: 'flex', alignItems: 'center' } },
            "Transcript and structure sequences differ, will run",
            ' ',
            ALIGNMENT_ALGORITHM_LABELS[alignmentAlgorithm] ?? alignmentAlgorithm,
            ' ',
            "alignment",
            React.createElement(AlignmentSettingsButton, { value: alignmentAlgorithm, onChange: onAlignmentAlgorithmChange }))) : null,
        React.createElement(Button, { variant: "contained", color: "secondary", size: "small", onClick: () => {
                handleClose();
            } }, "Cancel"),
        !canLaunch ? (React.createElement(Typography, { variant: "body2", color: "error", sx: { mr: 2 } }, missingReasons.join('. '))) : null,
        React.createElement(ButtonGroup, { variant: "contained", color: "primary", size: "small" },
            React.createElement(Button, { disabled: !canLaunch, onClick: handleLaunch3DView }, "Launch"),
            React.createElement(Button, { disabled: !canLaunch, onClick: () => {
                    setDialogOpen(true);
                }, "aria-label": "More launch options" },
                React.createElement(ArrowDropDownIcon, null))),
        React.createElement(Dialog, { open: dialogOpen, onClose: () => {
                setDialogOpen(false);
            } },
            React.createElement(DialogTitle, null, "Launch options"),
            React.createElement(DialogContent, null,
                React.createElement(MenuList, null,
                    React.createElement(MenuItem, { onClick: handleLaunch3DView },
                        React.createElement("div", null,
                            React.createElement(Typography, { variant: "body1" }, "Launch 3D protein structure view"),
                            React.createElement(Typography, { variant: "body2", color: "text.secondary" }, "View protein structure with genome-to-structure coordinate mapping"))),
                    React.createElement(MenuItem, { onClick: () => {
                            handleLaunch1DView().catch((e) => {
                                console.error(e);
                            });
                        } },
                        React.createElement("div", null,
                            React.createElement(Typography, { variant: "body1" }, "Launch 1D protein annotation view"),
                            React.createElement(Typography, { variant: "body2", color: "text.secondary" }, "View protein features and annotations as a linear track"))),
                    hasMsaViewPlugin()
                        ? [
                            React.createElement(MenuItem, { key: "msa", onClick: handleLaunchMSAView },
                                React.createElement("div", null,
                                    React.createElement(Typography, { variant: "body1" }, "Launch MSA view"),
                                    React.createElement(Typography, { variant: "body2", color: "text.secondary" }, "View AlphaFold a3m multiple sequence alignment"))),
                            React.createElement(MenuItem, { key: "3d-msa", onClick: handleLaunch3DWithMsa },
                                React.createElement("div", null,
                                    React.createElement(Typography, { variant: "body1" }, "Launch 3D structure + MSA view"),
                                    React.createElement(Typography, { variant: "body2", color: "text.secondary" }, "Launch both views with AlphaFold a3m MSA"))),
                        ]
                        : null)))));
}
//# sourceMappingURL=ProteinViewActions.js.map