import React, { useState } from 'react';
import { useLocalStorage } from '@jbrowse/core/util';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton } from '@mui/material';
import NCBIBlastAutomaticPanel from './NCBIBlastAutomaticPanel';
import NCBIBlastManualPanel from './NCBIBlastManualPanel';
import NCBIBlastMethodSelector from './NCBIBlastMethodSelector';
import NCBIBlastRIDPanel from './NCBIBlastRIDPanel';
import NCBISettingsDialog from './NCBISettingsDialog';
import { BASE_BLAST_URL } from './consts';
const panelMap = {
    automatic: NCBIBlastAutomaticPanel,
    rid: NCBIBlastRIDPanel,
    manual: NCBIBlastManualPanel,
};
export default function NCBIBlastPanel({ handleClose, model, feature, }) {
    const [lookupMethod, setLookupMethod] = useState('automatic');
    const [baseUrl, setBaseUrl] = useLocalStorage('msa-blastRootUrl', BASE_BLAST_URL);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const Panel = panelMap[lookupMethod];
    return (React.createElement(React.Fragment, null,
        React.createElement(IconButton, { style: { float: 'right' }, size: "small", onClick: () => {
                setSettingsOpen(true);
            } },
            React.createElement(SettingsIcon, null)),
        React.createElement(Panel, { model: model, feature: feature, handleClose: handleClose, baseUrl: baseUrl },
            React.createElement(NCBIBlastMethodSelector, { lookupMethod: lookupMethod, setLookupMethod: setLookupMethod })),
        settingsOpen ? (React.createElement(NCBISettingsDialog, { baseUrl: baseUrl, handleClose: newUrl => {
                if (newUrl) {
                    setBaseUrl(newUrl);
                }
                setSettingsOpen(false);
            } })) : null));
}
//# sourceMappingURL=NCBIBlastPanel.js.map