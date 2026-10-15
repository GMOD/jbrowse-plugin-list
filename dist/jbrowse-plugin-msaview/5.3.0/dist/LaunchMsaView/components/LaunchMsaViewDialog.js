import React, { useState } from 'react';
import { Dialog } from '@jbrowse/core/ui';
import { getSession } from '@jbrowse/core/util';
import { Tab, Tabs } from '@mui/material';
import BlastPanel from './BlastQuery/BlastPanel';
import HelpButton from './HelpButton';
import ManualMSALoader from './ManualMSALoader/ManualMSALoader';
import OrthologPanel from './OrthologQuery/OrthologPanel';
import PreLoadedMSA from './PreLoadedMSA/PreLoadedMSADataPanel';
import { readMsaDatasets } from './PreLoadedMSA/types';
import TabPanel from './TabPanel';
import { LaunchPlacementProvider } from './launchPlacement';
export default function LaunchMsaViewDialog({ handleClose, feature, model, preferredTranscriptId, }) {
    const session = getSession(model);
    const datasets = readMsaDatasets(session.jbrowse);
    const hasPreloadedDatasets = !!datasets?.length;
    // orthologs first, and the default: it answers the same question in ~10s
    // that BLAST takes 10+ minutes to answer worse (see utils/ncbiOrthologs.ts)
    const [value, setValue] = useState('orthologs');
    return (React.createElement(Dialog, { maxWidth: "xl", title: "Launch MSA view", open: true, onClose: handleClose },
        React.createElement(LaunchPlacementProvider, null,
            React.createElement("div", { style: { display: 'flex', alignItems: 'center' } },
                React.createElement(Tabs, { value: value, onChange: (_event, newValue) => {
                        setValue(newValue);
                    } },
                    React.createElement(Tab, { label: "Orthologs", value: "orthologs" }),
                    React.createElement(Tab, { label: "BLAST query", value: "ncbi_blast" }),
                    hasPreloadedDatasets ? (React.createElement(Tab, { label: "Pre-loaded MSA datasets", value: "preloaded_msa" })) : null,
                    React.createElement(Tab, { label: "Manual upload", value: "manual_msa" })),
                React.createElement(HelpButton, null)),
            React.createElement(TabPanel, { value: value, index: "orthologs" },
                React.createElement(OrthologPanel, { handleClose: handleClose, feature: feature, model: model, preferredTranscriptId: preferredTranscriptId })),
            React.createElement(TabPanel, { value: value, index: "ncbi_blast" },
                React.createElement(BlastPanel, { handleClose: handleClose, feature: feature, model: model, preferredTranscriptId: preferredTranscriptId })),
            hasPreloadedDatasets ? (React.createElement(TabPanel, { value: value, index: "preloaded_msa" },
                React.createElement(PreLoadedMSA, { model: model, feature: feature, handleClose: handleClose, preferredTranscriptId: preferredTranscriptId }))) : null,
            React.createElement(TabPanel, { value: value, index: "manual_msa" },
                React.createElement(ManualMSALoader, { model: model, feature: feature, handleClose: handleClose, preferredTranscriptId: preferredTranscriptId })))));
}
