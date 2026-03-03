import React, { useState } from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { Tab, Tabs } from '@mui/material';
import AlphaFoldDBSearch from './AlphaFoldDBSearch';
import FoldseekSearch from './FoldseekSearch';
import HelpButton from './HelpButton';
import TabPanel from './TabPanel';
import UserProvidedStructure from './UserProvidedStructure';
import { DEFAULT_ALIGNMENT_ALGORITHM, } from '../../ProteinView/types';
import { useLocalStorage } from '../hooks/useLocalStorage';
export default function LaunchProteinViewDialog({ handleClose, feature, model, }) {
    const [choice, setChoice] = useState(0);
    const [alignmentAlgorithm, setAlignmentAlgorithm] = useLocalStorage('jbrowse-protein3d-alignment-algorithm', DEFAULT_ALIGNMENT_ALGORITHM);
    return (React.createElement(Dialog, { maxWidth: "xl", title: "Launch protein view", titleNode: React.createElement(React.Fragment, null,
            "Launch protein view ",
            React.createElement(HelpButton, null)), open: true, onClose: () => {
            handleClose();
        } },
        React.createElement(Tabs, { value: choice, onChange: (_, val) => {
                setChoice(val);
            } },
            React.createElement(Tab, { value: 0, label: "AlphaFoldDB search" }),
            React.createElement(Tab, { value: 1, label: "Foldseek search" }),
            React.createElement(Tab, { value: 2, label: "Open file manually" })),
        React.createElement(TabPanel, { value: choice, index: 0 },
            React.createElement(AlphaFoldDBSearch, { model: model, feature: feature, handleClose: handleClose, alignmentAlgorithm: alignmentAlgorithm, onAlignmentAlgorithmChange: setAlignmentAlgorithm })),
        React.createElement(TabPanel, { value: choice, index: 1 },
            React.createElement(FoldseekSearch, { model: model, feature: feature, handleClose: handleClose })),
        React.createElement(TabPanel, { value: choice, index: 2 },
            React.createElement(UserProvidedStructure, { model: model, feature: feature, handleClose: handleClose, alignmentAlgorithm: alignmentAlgorithm, onAlignmentAlgorithmChange: setAlignmentAlgorithm }))));
}
//# sourceMappingURL=LaunchProteinViewDialog.js.map