import React, { useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import { Button, Menu, MenuItem } from '@mui/material';
import { caCoordsToPdb, hasValidCaCoords } from '../utils/caCoordsToPdb';
import { safeLaunch } from '../utils/launchHelpers';
import { getConfidenceUrlFromTarget, getUniprotIdFromAlphaFoldTarget, hasMsaViewPlugin, launch1DProteinView, launch3DProteinView, launchMsaView, } from '../utils/launchViewUtils';
export default function FoldseekActionMenu({ hit, session, view, feature, selectedTranscript, userProvidedTranscriptSequence, onClose, }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [launchError, setLaunchError] = useState();
    const open = Boolean(anchorEl);
    const uniprotId = getUniprotIdFromAlphaFoldTarget(hit.target);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const baseParams = { session, view, feature, selectedTranscript, uniprotId };
    const runLaunch = (fn) => () => {
        handleMenuClose();
        void safeLaunch(fn, onClose, setLaunchError);
    };
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
    const handleLaunch1D = runLaunch(async () => {
        await launch1DProteinView({
            ...baseParams,
            confidenceUrl: getConfidenceUrlFromTarget(hit.target),
        });
    });
    const handleLaunchMSA = runLaunch(() => {
        launchMsaView(baseParams);
    });
    const canLoad = hit.structureUrl ?? hasValidCaCoords(hit.tCa, hit.tSeq);
    if (!canLoad) {
        return React.createElement("span", null, "-");
    }
    return (React.createElement(React.Fragment, null,
        launchError ? React.createElement(ErrorMessage, { error: launchError }) : null,
        React.createElement(Button, { size: "small", variant: "outlined", onClick: handleClick }, "Load"),
        React.createElement(Menu, { anchorEl: anchorEl, open: open, onClose: handleMenuClose },
            React.createElement(MenuItem, { onClick: handleLaunch3D }, "Launch 3D protein view"),
            uniprotId ? (React.createElement(MenuItem, { onClick: handleLaunch1D }, "Launch 1D protein annotation view")) : null,
            uniprotId && hasMsaViewPlugin() ? (React.createElement(MenuItem, { onClick: handleLaunchMSA }, "Launch MSA view (AlphaFoldDB a3m)")) : null)));
}
