import React, { useState } from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { getSession } from '@jbrowse/core/util';
import { Tab, Tabs } from '@mui/material';
import { observer } from 'mobx-react';
import FoldseekSearch from './FoldseekSearch';
import GeneStructures from './GeneStructures';
import HelpButton from './HelpButton';
import TabPanel from './TabPanel';
import UserProvidedStructure from './UserProvidedStructure';
import { getGeneDisplayName } from '../utils/util';
const LaunchProteinViewDialog = observer(function LaunchProteinViewDialog({ handleClose, feature, preferredTranscriptId, model, view, }) {
    const [choice, setChoice] = useState(0);
    const session = getSession(model);
    const geneName = getGeneDisplayName(feature) || 'this gene';
    return (React.createElement(Dialog, { "data-testid": "launch-protein-view-dialog", maxWidth: "xl", title: "Launch protein view", titleNode: React.createElement(React.Fragment, null,
            "Launch protein view ",
            React.createElement(HelpButton, null)), open: true, onClose: handleClose },
        React.createElement(Tabs, { value: choice, onChange: (_, val) => {
                setChoice(val);
            } },
            React.createElement(Tab, { value: 0, label: `Structures for ${geneName}` }),
            React.createElement(Tab, { value: 1, label: "Similar structures (Foldseek)" }),
            React.createElement(Tab, { value: 2, label: "Your file or URL" })),
        React.createElement(TabPanel, { value: choice, index: 0 },
            React.createElement(GeneStructures, { session: session, view: view, feature: feature, geneName: geneName, preferredTranscriptId: preferredTranscriptId, handleClose: handleClose })),
        React.createElement(TabPanel, { value: choice, index: 1 },
            React.createElement(FoldseekSearch, { session: session, view: view, feature: feature, preferredTranscriptId: preferredTranscriptId, handleClose: handleClose })),
        React.createElement(TabPanel, { value: choice, index: 2 },
            React.createElement(UserProvidedStructure, { session: session, view: view, feature: feature, preferredTranscriptId: preferredTranscriptId, handleClose: handleClose }))));
});
export default LaunchProteinViewDialog;
