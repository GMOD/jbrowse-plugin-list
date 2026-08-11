import React, { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import BlastAutomaticPanel from './BlastAutomaticPanel';
import BlastManualPanel from './BlastManualPanel';
import BlastMethodSelector from './BlastMethodSelector';
import BlastSettingsDialog from './BlastSettingsDialog';
import { DEFAULT_EBI_EMAIL, EBI_EMAIL_STORAGE_KEY, } from '../../../utils/ebiJobDispatcher';
import { useLocalStorage } from '../../../utils/useLocalStorage';
const useStyles = makeStyles()({
    settingsButton: {
        float: 'right',
    },
});
const panelMap = {
    automatic: BlastAutomaticPanel,
    manual: BlastManualPanel,
};
export default function BlastPanel({ handleClose, model, feature, }) {
    const [lookupMethod, setLookupMethod] = useState('automatic');
    const [ebiEmail, setEbiEmail] = useLocalStorage(EBI_EMAIL_STORAGE_KEY, DEFAULT_EBI_EMAIL);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const { classes } = useStyles();
    const Panel = panelMap[lookupMethod];
    return (React.createElement(React.Fragment, null,
        React.createElement(IconButton, { className: classes.settingsButton, size: "small", onClick: () => {
                setSettingsOpen(true);
            } },
            React.createElement(SettingsIcon, null)),
        React.createElement(Panel, { model: model, feature: feature, handleClose: handleClose },
            React.createElement(BlastMethodSelector, { lookupMethod: lookupMethod, setLookupMethod: setLookupMethod })),
        settingsOpen ? (React.createElement(BlastSettingsDialog, { ebiEmail: ebiEmail, handleClose: settings => {
                if (settings) {
                    setEbiEmail(settings.ebiEmail);
                }
                setSettingsOpen(false);
            } })) : null));
}
