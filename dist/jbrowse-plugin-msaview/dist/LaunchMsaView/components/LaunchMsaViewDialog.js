import React, { useState } from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { getSession } from '@jbrowse/core/util';
import { Tab, Tabs } from '@mui/material';
import ManualMSALoader from './ManualMSALoader/ManualMSALoader';
import NCBIBlastPanel from './NCBIBlastQuery/NCBIBlastPanel';
import PreLoadedMSA from './PreLoadedMSA/PreLoadedMSADataPanel';
import { readMsaDatasets } from './PreLoadedMSA/types';
import TabPanel from './TabPanel';
export default function LaunchMsaViewDialog({ handleClose, feature, model, }) {
    const session = getSession(model);
    const datasets = readMsaDatasets(session.jbrowse);
    const hasPreloadedDatasets = !!datasets?.length;
    const [value, setValue] = useState('ncbi_blast');
    const handleChange = (_event, newValue) => {
        setValue(newValue);
    };
    return (React.createElement(Dialog, { maxWidth: "xl", title: "Launch MSA view", open: true, onClose: handleClose },
        React.createElement(Tabs, { value: value, onChange: handleChange },
            React.createElement(Tab, { label: "NCBI BLAST query", value: "ncbi_blast" }),
            hasPreloadedDatasets ? (React.createElement(Tab, { label: "Pre-loaded MSA datasets", value: "preloaded_msa" })) : null,
            React.createElement(Tab, { label: "Manual upload", value: "manual_msa" })),
        React.createElement(TabPanel, { value: value, index: "ncbi_blast" },
            React.createElement(NCBIBlastPanel, { handleClose: handleClose, feature: feature, model: model })),
        hasPreloadedDatasets ? (React.createElement(TabPanel, { value: value, index: "preloaded_msa" },
            React.createElement(PreLoadedMSA, { model: model, feature: feature, handleClose: handleClose }))) : null,
        React.createElement(TabPanel, { value: value, index: "manual_msa" },
            React.createElement(ManualMSALoader, { model: model, feature: feature, handleClose: handleClose }))));
}
//# sourceMappingURL=LaunchMsaViewDialog.js.map