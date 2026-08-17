import React, { useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import { Button, Menu, MenuItem } from '@mui/material';
import { useSafeLaunch } from '../hooks/useSafeLaunch';
import { caCoordsToPdb, hasValidCaCoords } from '../utils/caCoordsToPdb';
import { PROTEIN_LAUNCH_LABELS, getConditionalProteinLaunches, launch3DProteinView, } from '../utils/launchViewUtils';
import { getConfidenceUrlFromTarget, getUniprotIdFromAlphaFoldTarget, } from '../utils/structureUrls';
export default function FoldseekActionMenu({ hit, session, view, feature, selectedTranscript, userProvidedTranscriptSequence, onClose, }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const uniprotId = getUniprotIdFromAlphaFoldTarget(hit.target);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const { runLaunch, launchError } = useSafeLaunch(onClose, handleMenuClose);
    const baseParams = { session, view, feature, selectedTranscript, uniprotId };
    const handleLaunch3D = runLaunch(() => {
        // Use tCa coordinates to generate PDB data if no URL is available
        const pdbData = !hit.structureUrl && hasValidCaCoords(hit)
            ? caCoordsToPdb(hit.tCa, hit.tSeq, 'A', hit.target)
            : undefined;
        launch3DProteinView({
            ...baseParams,
            url: hit.structureUrl,
            data: pdbData,
            userProvidedTranscriptSequence,
        });
    });
    const { launch1D, launchMsa } = getConditionalProteinLaunches({
        ...baseParams,
        confidenceUrl: getConfidenceUrlFromTarget(hit.target),
    });
    const canLoad = !!hit.structureUrl || hasValidCaCoords(hit);
    if (!canLoad) {
        return React.createElement("span", null, "-");
    }
    return (React.createElement(React.Fragment, null,
        launchError ? React.createElement(ErrorMessage, { error: launchError }) : null,
        React.createElement(Button, { size: "small", variant: "outlined", onClick: handleClick }, "Load"),
        React.createElement(Menu, { anchorEl: anchorEl, open: open, onClose: handleMenuClose },
            React.createElement(MenuItem, { "data-testid": "protein-launch-option-3d", onClick: handleLaunch3D }, PROTEIN_LAUNCH_LABELS['3d']),
            launch1D ? (React.createElement(MenuItem, { "data-testid": "protein-launch-option-1d", onClick: runLaunch(launch1D) }, PROTEIN_LAUNCH_LABELS['1d'])) : null,
            launchMsa ? (React.createElement(MenuItem, { "data-testid": "protein-launch-option-msa", onClick: runLaunch(launchMsa) }, PROTEIN_LAUNCH_LABELS.msa)) : null)));
}
