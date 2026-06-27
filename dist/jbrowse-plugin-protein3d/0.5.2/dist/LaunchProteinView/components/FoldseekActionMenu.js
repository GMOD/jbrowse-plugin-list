import React, { useState } from 'react';
import { ErrorMessage } from '@jbrowse/core/ui';
import { isSessionWithAddTracks } from '@jbrowse/core/util';
import { Button, Menu, MenuItem } from '@mui/material';
import { useSafeLaunch } from '../hooks/useSafeLaunch';
import { caCoordsToPdb, hasValidCaCoords } from '../utils/caCoordsToPdb';
import { getConfidenceUrlFromTarget, getUniprotIdFromAlphaFoldTarget, hasMsaViewPlugin, launch1DProteinView, launch3DProteinView, launchMsaView, } from '../utils/launchViewUtils';
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
    const handleLaunchMSA = runLaunch(() => {
        launchMsaView(baseParams);
    });
    const canLoad = !!hit.structureUrl || hasValidCaCoords(hit.tCa, hit.tSeq);
    if (!canLoad) {
        return React.createElement("span", null, "-");
    }
    // 1D launch needs an add-tracks session and a uniprotId; narrowing both here
    // gates the menu item and types its handler from a single condition.
    const addTracksSession = isSessionWithAddTracks(session) ? session : undefined;
    return (React.createElement(React.Fragment, null,
        launchError ? React.createElement(ErrorMessage, { error: launchError }) : null,
        React.createElement(Button, { size: "small", variant: "outlined", onClick: handleClick }, "Load"),
        React.createElement(Menu, { anchorEl: anchorEl, open: open, onClose: handleMenuClose },
            React.createElement(MenuItem, { onClick: handleLaunch3D }, "Launch 3D protein view"),
            addTracksSession && uniprotId ? (React.createElement(MenuItem, { onClick: runLaunch(() => launch1DProteinView({
                    session: addTracksSession,
                    view,
                    feature,
                    selectedTranscript,
                    uniprotId,
                    confidenceUrl: getConfidenceUrlFromTarget(hit.target),
                })) }, "Launch 1D protein annotation view")) : null,
            uniprotId && hasMsaViewPlugin() ? (React.createElement(MenuItem, { onClick: handleLaunchMSA }, "Launch MSA view (AlphaFoldDB a3m)")) : null)));
}
