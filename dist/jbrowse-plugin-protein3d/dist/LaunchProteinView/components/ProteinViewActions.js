import React, { useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, ButtonGroup, Typography } from '@mui/material';
import LaunchOptionsDialog from './LaunchOptionsDialog';
import SequenceMismatchNotice from './SequenceMismatchNotice';
import { getLaunchMissingReasons, safeLaunch } from '../utils/launchHelpers';
import { hasMsaViewPlugin, launch1DProteinView, launch3DProteinView, launch3DProteinViewWithMsa, launchMsaView, } from '../utils/launchViewUtils';
export default function ProteinViewActions({ handleClose, uniprotId, userSelectedProteinSequence, selectedTranscript, url, confidenceUrl, feature, view, session, alignmentAlgorithm, onAlignmentAlgorithmChange, sequencesMatch, isLoading, error, }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [launchError, setLaunchError] = useState();
    // Disable launch while loading — SWR's keepPreviousData would otherwise let
    // a user click Launch on stale results (wrong UniProt ID) during a refetch.
    const canLaunch = !isLoading &&
        !!uniprotId &&
        !!userSelectedProteinSequence &&
        !!selectedTranscript;
    const missingReasons = getLaunchMissingReasons({
        uniprotId,
        userSelectedProteinSequence,
        selectedTranscript,
        isLoading,
        error,
    });
    const closeMenu = () => {
        setDialogOpen(false);
    };
    const baseParams = {
        session,
        view,
        feature,
        selectedTranscript,
        uniprotId,
    };
    const launch3DParams = {
        ...baseParams,
        url,
        userProvidedTranscriptSequence: userSelectedProteinSequence?.seq,
        alignmentAlgorithm,
    };
    const runLaunch = (fn) => () => {
        closeMenu();
        void safeLaunch(fn, handleClose, setLaunchError);
    };
    const handleLaunch3DView = runLaunch(() => {
        if (selectedTranscript) {
            launch3DProteinView(launch3DParams);
        }
    });
    const handleLaunch1DView = runLaunch(async () => {
        if (uniprotId && selectedTranscript) {
            await launch1DProteinView({ ...baseParams, confidenceUrl });
        }
    });
    const handleLaunchMsa = runLaunch(() => {
        if (selectedTranscript && uniprotId) {
            launchMsaView(baseParams);
        }
    });
    const handleLaunch3DWithMsa = runLaunch(() => {
        if (selectedTranscript && uniprotId) {
            launch3DProteinViewWithMsa(launch3DParams);
        }
    });
    const launchOptions = [
        {
            key: '3d',
            title: 'Launch 3D protein structure view',
            description: 'View protein structure with genome-to-structure coordinate mapping',
            onClick: handleLaunch3DView,
        },
        {
            key: '1d',
            title: 'Launch 1D protein annotation view',
            description: 'View protein features and annotations as a linear track',
            onClick: handleLaunch1DView,
        },
        ...(hasMsaViewPlugin()
            ? [
                {
                    key: 'msa',
                    title: 'Launch MSA view',
                    description: 'View AlphaFold a3m multiple sequence alignment',
                    onClick: handleLaunchMsa,
                },
                {
                    key: '3d-msa',
                    title: 'Launch 3D structure + MSA view',
                    description: 'Launch both views with AlphaFold a3m MSA',
                    onClick: handleLaunch3DWithMsa,
                },
            ]
            : []),
    ];
    return (React.createElement(React.Fragment, null,
        launchError ? React.createElement(ErrorMessage, { error: launchError }) : null,
        sequencesMatch === false ? (React.createElement(SequenceMismatchNotice, { alignmentAlgorithm: alignmentAlgorithm, onAlignmentAlgorithmChange: onAlignmentAlgorithmChange })) : null,
        React.createElement(Button, { variant: "contained", color: "secondary", size: "small", onClick: () => {
                handleClose();
            } }, "Cancel"),
        !canLaunch && missingReasons.length > 0 ? (React.createElement(Typography, { variant: "body2", color: "error", sx: { mr: 2 } }, missingReasons.join('. '))) : null,
        React.createElement(ButtonGroup, { variant: "contained", color: "primary", size: "small" },
            React.createElement(Button, { disabled: !canLaunch, onClick: handleLaunch3DView }, "Launch"),
            React.createElement(Button, { disabled: !canLaunch, onClick: () => {
                    setDialogOpen(true);
                }, "aria-label": "More launch options" },
                React.createElement(ArrowDropDownIcon, null))),
        React.createElement(LaunchOptionsDialog, { open: dialogOpen, onClose: closeMenu, options: launchOptions })));
}
