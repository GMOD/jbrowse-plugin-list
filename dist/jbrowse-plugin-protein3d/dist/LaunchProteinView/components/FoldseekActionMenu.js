import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
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
    const handleLaunch3D = () => {
        handleMenuClose();
        // Use tCa coordinates to generate PDB data if no URL is available
        const pdbData = !hit.structureUrl && hasValidCaCoords(hit.tCa, hit.tSeq)
            ? caCoordsToPdb(hit.tCa, hit.tSeq, 'A', hit.target)
            : undefined;
        launch3DProteinView({
            session,
            view,
            feature,
            selectedTranscript,
            uniprotId,
            url: hit.structureUrl,
            data: pdbData,
            userProvidedTranscriptSequence,
        });
        onClose();
    };
    const handleLaunch1D = async () => {
        handleMenuClose();
        try {
            await launch1DProteinView({
                session,
                view,
                feature,
                selectedTranscript,
                uniprotId,
                confidenceUrl: getConfidenceUrlFromTarget(hit.target),
            });
        }
        catch (e) {
            console.error(e);
            session.notifyError(`${e}`, e);
        }
        onClose();
    };
    const handleLaunchMSA = () => {
        handleMenuClose();
        launchMsaView({
            session,
            view,
            feature,
            selectedTranscript,
            uniprotId,
        });
        onClose();
    };
    const canLoad = hit.structureUrl ?? hasValidCaCoords(hit.tCa, hit.tSeq);
    if (!canLoad) {
        return React.createElement("span", null, "-");
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, { size: "small", variant: "outlined", onClick: handleClick }, "Load"),
        React.createElement(Menu, { anchorEl: anchorEl, open: open, onClose: handleMenuClose },
            React.createElement(MenuItem, { onClick: handleLaunch3D }, "Launch 3D protein view"),
            uniprotId ? (React.createElement(MenuItem, { onClick: () => {
                    handleLaunch1D().catch((e) => {
                        console.error(e);
                    });
                } }, "Launch 1D protein annotation view")) : null,
            uniprotId && hasMsaViewPlugin() ? (React.createElement(MenuItem, { onClick: handleLaunchMSA }, "Launch MSA view (AlphaFoldDB a3m)")) : null)));
}
//# sourceMappingURL=FoldseekActionMenu.js.map