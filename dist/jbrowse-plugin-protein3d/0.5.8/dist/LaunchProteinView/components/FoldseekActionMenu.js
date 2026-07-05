import React, { useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import { Button, Menu, MenuItem } from '@mui/material';
import { useSafeLaunch } from '../hooks/useSafeLaunch';
import { caCoordsToPdb, hasValidCaCoords } from '../utils/caCoordsToPdb';
import { getConditionalProteinLaunches, getConfidenceUrlFromTarget, getUniprotIdFromAlphaFoldTarget, launch3DProteinView, } from '../utils/launchViewUtils';
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
        const pdbData = !hit.structureUrl && hasValidCaCoords(hit.tCa, hit.tSeq)
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
    const canLoad = !!hit.structureUrl || hasValidCaCoords(hit.tCa, hit.tSeq);
    if (!canLoad) {
        return React.createElement("span", null, "-");
    }
    return (React.createElement(React.Fragment, null,
        launchError ? React.createElement(ErrorMessage, { error: launchError }) : null,
        React.createElement(Button, { size: "small", variant: "outlined", onClick: handleClick }, "Load"),
        React.createElement(Menu, { anchorEl: anchorEl, open: open, onClose: handleMenuClose },
            React.createElement(MenuItem, { onClick: handleLaunch3D }, "Launch 3D protein view"),
            launch1D ? (React.createElement(MenuItem, { onClick: runLaunch(launch1D) }, "Launch 1D protein annotation view")) : null,
            launchMsa ? (React.createElement(MenuItem, { onClick: runLaunch(launchMsa) }, "Launch MSA view (AlphaFoldDB a3m)")) : null)));
}
