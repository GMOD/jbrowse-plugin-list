import React, { useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button, ButtonGroup, IconButton, Tooltip, Typography } from '@mui/material';
import LaunchOptionsDialog from './LaunchOptionsDialog';
import LaunchSettingsDialog from './LaunchSettingsDialog';
import SequenceMismatchNotice from './SequenceMismatchNotice';
import { useSafeLaunch } from '../hooks/useSafeLaunch';
import { getLaunchMissingReasons } from '../utils/launchHelpers';
import { getConditionalProteinLaunches, launch3DProteinView, launch3DProteinViewWithMsa, } from '../utils/launchViewUtils';
export default function ProteinViewActions({ handleClose, uniprotId, userSelectedProteinSequence, selectedTranscript, url, confidenceUrl, feature, view, session, alignmentAlgorithm, onAlignmentAlgorithmChange, sequencesMatch, isLoading, error, }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const missingReasons = getLaunchMissingReasons({
        uniprotId,
        userSelectedProteinSequence,
        selectedTranscript,
    });
    // Disable launch while loading — SWR's keepPreviousData would otherwise let
    // a user click Launch on stale results (wrong UniProt ID) during a refetch.
    const canLaunch = !isLoading && missingReasons.length === 0;
    // Suppress the derived reasons while loading or while a real upstream error
    // is displayed above via <ErrorMessage> — a duplicate hint would mislead.
    const showMissingReasons = !isLoading && !error && missingReasons.length > 0;
    const closeMenu = () => {
        setDialogOpen(false);
    };
    const { runLaunch, launchError } = useSafeLaunch(handleClose, closeMenu);
    const launch3DParams = {
        session,
        view,
        feature,
        selectedTranscript,
        uniprotId,
        url,
        userProvidedTranscriptSequence: userSelectedProteinSequence?.seq,
        alignmentAlgorithm,
    };
    const handleLaunch3DView = runLaunch(() => {
        launch3DProteinView(launch3DParams);
    });
    const { launch1D, launchMsa } = getConditionalProteinLaunches({
        session,
        view,
        feature,
        selectedTranscript,
        uniprotId,
        confidenceUrl,
    });
    const launchOptions = [
        {
            key: '3d',
            title: 'Launch 3D protein structure view',
            description: 'View protein structure with genome-to-structure coordinate mapping',
            onClick: handleLaunch3DView,
        },
        ...(launch1D
            ? [
                {
                    key: '1d',
                    title: 'Launch 1D protein annotation view',
                    description: 'View protein features and annotations as a linear track',
                    onClick: runLaunch(launch1D),
                },
            ]
            : []),
        ...(launchMsa
            ? [
                {
                    key: 'msa',
                    title: 'Launch MSA view',
                    description: 'View AlphaFold a3m multiple sequence alignment',
                    onClick: runLaunch(launchMsa),
                },
                {
                    key: '3d-msa',
                    title: 'Launch 3D structure + MSA view',
                    description: 'Launch both views with AlphaFold a3m MSA',
                    onClick: runLaunch(() => launch3DProteinViewWithMsa(launch3DParams)),
                },
            ]
            : []),
    ];
    return (React.createElement(React.Fragment, null,
        launchError ? React.createElement(ErrorMessage, { error: launchError }) : null,
        sequencesMatch === false ? (React.createElement(SequenceMismatchNotice, { alignmentAlgorithm: alignmentAlgorithm, onAlignmentAlgorithmChange: onAlignmentAlgorithmChange })) : null,
        React.createElement(Tooltip, { title: "Launch settings" },
            React.createElement(IconButton, { size: "small", "aria-label": "Launch settings", onClick: () => {
                    setSettingsOpen(true);
                } },
                React.createElement(SettingsIcon, { fontSize: "small" }))),
        React.createElement(Button, { variant: "contained", color: "secondary", size: "small", onClick: () => {
                handleClose();
            } }, "Cancel"),
        showMissingReasons ? (React.createElement(Typography, { variant: "body2", color: "error", sx: { mr: 2 } }, missingReasons.join('. '))) : null,
        React.createElement(ButtonGroup, { variant: "contained", color: "primary", size: "small" },
            React.createElement(Button, { disabled: !canLaunch, onClick: handleLaunch3DView }, "Launch"),
            React.createElement(Button, { disabled: !canLaunch, onClick: () => {
                    setDialogOpen(true);
                }, "aria-label": "More launch options" },
                React.createElement(ArrowDropDownIcon, null))),
        React.createElement(LaunchOptionsDialog, { open: dialogOpen, onClose: closeMenu, options: launchOptions }),
        React.createElement(LaunchSettingsDialog, { open: settingsOpen, onClose: () => {
                setSettingsOpen(false);
            } })));
}
