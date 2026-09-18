import React, { useState } from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { getContainingView, getSession } from '@jbrowse/core/util';
import { Tab, Tabs } from '@mui/material';
import AlphaFoldDBSearch from './AlphaFoldDBSearch';
import FoldseekSearch from './FoldseekSearch';
import HelpButton from './HelpButton';
import PdbSearch from './PdbSearch';
import TabPanel from './TabPanel';
import UserProvidedStructure from './UserProvidedStructure';
import useUniProtIdLookup from '../hooks/useUniProtIdLookup';
import { getLaunchSideBySide, setLaunchSideBySide } from '../utils/sideBySide';
export default function LaunchProteinViewDialog({ handleClose, feature, model, }) {
    const [choice, setChoice] = useState(0);
    const session = getSession(model);
    const view = getContainingView(model);
    // One lookup for the whole dialog: the tabs stay mounted once visited, so a
    // lookup per tab meant the same UniProt search ran twice and a row picked on
    // one tab left the other pointing at a different gene.
    const lookup = useUniProtIdLookup({ feature, view });
    // Also the dialog's, for the same reason: a tab that has been mounted since
    // before the user changed this would otherwise launch with its own stale copy.
    const [sideBySide, setSideBySide] = useState(() => getLaunchSideBySide());
    const changeSideBySide = (value) => {
        setSideBySide(value);
        setLaunchSideBySide(value);
    };
    return (React.createElement(Dialog, { "data-testid": "launch-protein-view-dialog", maxWidth: "xl", title: "Launch protein view", titleNode: React.createElement(React.Fragment, null,
            "Launch protein view ",
            React.createElement(HelpButton, null)), open: true, onClose: handleClose },
        React.createElement(Tabs, { value: choice, onChange: (_, val) => {
                setChoice(val);
            } },
            React.createElement(Tab, { value: 0, label: "AlphaFoldDB search" }),
            React.createElement(Tab, { value: 1, label: "PDB search" }),
            React.createElement(Tab, { value: 2, label: "Foldseek search" }),
            React.createElement(Tab, { value: 3, label: "File or URL" })),
        React.createElement(TabPanel, { value: choice, index: 0 },
            React.createElement(AlphaFoldDBSearch, { session: session, view: view, feature: feature, handleClose: handleClose, lookup: lookup, sideBySide: sideBySide, onSideBySideChange: changeSideBySide })),
        React.createElement(TabPanel, { value: choice, index: 1 },
            React.createElement(PdbSearch, { session: session, view: view, feature: feature, handleClose: handleClose, lookup: lookup, sideBySide: sideBySide, onSideBySideChange: changeSideBySide })),
        React.createElement(TabPanel, { value: choice, index: 2 },
            React.createElement(FoldseekSearch, { session: session, view: view, feature: feature, handleClose: handleClose })),
        React.createElement(TabPanel, { value: choice, index: 3 },
            React.createElement(UserProvidedStructure, { session: session, view: view, feature: feature, handleClose: handleClose }))));
}
