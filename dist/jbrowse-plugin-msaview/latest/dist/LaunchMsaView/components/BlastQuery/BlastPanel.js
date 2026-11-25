import React, { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton, Tooltip } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import { DEFAULT_EBI_EMAIL, EBI_EMAIL_STORAGE_KEY, } from '../../../utils/ebiJobDispatcher';
import { useLocalStorage } from '../../../utils/useLocalStorage';
import TabPanel from '../TabPanel';
import BlastAutomaticPanel from './BlastAutomaticPanel';
import BlastManualPanel from './BlastManualPanel';
import BlastMethodSelector from './BlastMethodSelector';
import BlastSettingsDialog from './BlastSettingsDialog';
const useStyles = makeStyles()({
    settingsButton: {
        float: 'right',
    },
});
const BlastPanel = observer(function BlastPanel({ handleClose, model, feature, preferredTranscriptId, }) {
    const [lookupMethod, setLookupMethod] = useState('automatic');
    const [ebiEmail, setEbiEmail] = useLocalStorage(EBI_EMAIL_STORAGE_KEY, DEFAULT_EBI_EMAIL);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const { classes } = useStyles();
    const methodSelector = (React.createElement(BlastMethodSelector, { lookupMethod: lookupMethod, setLookupMethod: setLookupMethod }));
    return (React.createElement(React.Fragment, null,
        lookupMethod === 'automatic' ? (React.createElement(Tooltip, { title: `EBI settings — jobs are submitted with ${ebiEmail.trim() || DEFAULT_EBI_EMAIL}` },
            React.createElement(IconButton, { className: classes.settingsButton, "aria-label": "EBI settings", size: "small", onClick: () => {
                    setSettingsOpen(true);
                } },
                React.createElement(SettingsIcon, null)))) : null,
        React.createElement(TabPanel, { value: lookupMethod, index: "automatic" },
            React.createElement(BlastAutomaticPanel, { model: model, feature: feature, handleClose: handleClose, preferredTranscriptId: preferredTranscriptId }, methodSelector)),
        React.createElement(TabPanel, { value: lookupMethod, index: "manual" },
            React.createElement(BlastManualPanel, { model: model, feature: feature, handleClose: handleClose, preferredTranscriptId: preferredTranscriptId }, methodSelector)),
        settingsOpen ? (React.createElement(BlastSettingsDialog, { ebiEmail: ebiEmail, handleClose: settings => {
                if (settings) {
                    setEbiEmail(settings.ebiEmail);
                }
                setSettingsOpen(false);
            } })) : null));
});
export default BlastPanel;
