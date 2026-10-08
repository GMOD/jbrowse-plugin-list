import React, { useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, ButtonGroup, Typography } from '@mui/material';
import LaunchOptionsMenu from './LaunchOptionsMenu';
import SequenceMismatchNotice from './SequenceMismatchNotice';
import { useSafeLaunch } from '../hooks/useSafeLaunch';
import { getLaunchMissingReasons } from '../utils/launchHelpers';
import { PROTEIN_LAUNCH_LABELS, getConditionalProteinLaunches, launch3DProteinView, } from '../utils/launchViewUtils';
export default function ProteinViewActions({ handleClose, uniprotId, userSelectedProteinSequence, selectedTranscript, url, pdbId, confidenceUrl, feature, view, session, sideBySide, onSideBySideChange, sequencesMatch, isLoading, error, }) {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const missingReasons = getLaunchMissingReasons({
        uniprotId,
        userSelectedProteinSequence,
        selectedTranscript,
        url,
        pdbId,
    });
    // Loading or errored, SWR's keepPreviousData can still hold the previous
    // accession's structure, which Launch would open under the new name.
    const canLaunch = !isLoading && !error && missingReasons.length === 0;
    // Suppress the derived reasons while loading or while a real upstream error
    // is displayed above via <ErrorMessage> — a duplicate hint would mislead.
    const showMissingReasons = !isLoading && !error && missingReasons.length > 0;
    const closeMenu = () => {
        setMenuAnchor(null);
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
        sideBySide,
    };
    const handleLaunch3DView = runLaunch(() => {
        launch3DProteinView(launch3DParams);
    });
    const { launch1D } = getConditionalProteinLaunches({
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
            title: PROTEIN_LAUNCH_LABELS['3d'],
            description: 'View protein structure with genome-to-structure coordinate mapping',
            onClick: handleLaunch3DView,
        },
        ...(launch1D
            ? [
                {
                    key: '1d',
                    title: PROTEIN_LAUNCH_LABELS['1d'],
                    description: 'View protein features and annotations as a linear track',
                    onClick: runLaunch(launch1D),
                },
            ]
            : []),
    ];
    return (React.createElement(React.Fragment, null,
        launchError ? React.createElement(ErrorMessage, { error: launchError }) : null,
        sequencesMatch === false ? React.createElement(SequenceMismatchNotice, null) : null,
        React.createElement(Button, { variant: "contained", color: "secondary", size: "small", onClick: () => {
                handleClose();
            } }, "Cancel"),
        showMissingReasons ? (React.createElement("div", { style: { marginRight: 16 } }, missingReasons.map(reason => (React.createElement(Typography, { key: reason, variant: "body2", color: "error" }, reason))))) : null,
        React.createElement(ButtonGroup, { variant: "contained", color: "primary", size: "small" },
            React.createElement(Button, { "data-testid": "protein-launch-button", disabled: !canLaunch, onClick: handleLaunch3DView }, "Launch"),
            React.createElement(Button, { "data-testid": "protein-launch-options-button", disabled: !canLaunch, onClick: event => {
                    setMenuAnchor(event.currentTarget);
                }, "aria-label": "More launch options" },
                React.createElement(ArrowDropDownIcon, null))),
        React.createElement(LaunchOptionsMenu, { anchorEl: menuAnchor, onClose: closeMenu, options: launchOptions, sideBySide: sideBySide, onSideBySideChange: onSideBySideChange })));
}
