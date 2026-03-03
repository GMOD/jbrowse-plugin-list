import React, { useState } from 'react';
import { readConfObject } from '@jbrowse/core/configuration';
import { ErrorMessage, LoadingEllipses, SanitizedHTML } from '@jbrowse/core/ui';
import { getContainingView, getEnv, getSession, } from '@jbrowse/core/util';
import { Button, DialogActions, DialogContent, MenuItem } from '@mui/material';
import { observer } from 'mobx-react';
import useSWR from 'swr';
import { makeStyles } from 'tss-react/mui';
import TextField2 from '../../../components/TextField2';
import { getGeneDisplayName } from '../../util';
import TranscriptSelector from '../TranscriptSelector';
import { useTranscriptSelection } from '../useTranscriptSelection';
import { swrFlags } from './consts';
import { fetchMSA, fetchMSAList } from './fetchMSAData';
import { preCalculatedLaunchView } from './preCalculatedLaunchView';
const useStyles = makeStyles()({
    dialogContent: {
        width: '80em',
    },
});
const PreLoadedMSA = observer(function PreLoadedMSA2({ model, feature, handleClose, }) {
    const session = getSession(model);
    const view = getContainingView(model);
    const { classes } = useStyles();
    const { pluginManager } = getEnv(model);
    const { assemblyNames } = view;
    const [viewError, setViewError] = useState();
    const { jbrowse } = session;
    const datasets = readConfObject(jbrowse, ['msa', 'datasets']);
    const [selectedDatasetId, setSelectedDatasetId] = useState(datasets?.[0]?.datasetId);
    const selectedDataset = datasets?.find(d => d.datasetId === selectedDatasetId);
    const { data: msaList, isLoading: msaListLoading, error: msaListFetchError, } = useSWR(selectedDatasetId ? `${selectedDatasetId}-msa-list` : 'none-msa-list', () => selectedDataset
        ? fetchMSAList({
            config: selectedDataset.adapter,
            pluginManager,
        })
        : undefined, swrFlags);
    const { options: transcripts, selectedId, setSelectedId, selectedTranscript, proteinSequence, error: proteinSequenceError, validSet, } = useTranscriptSelection({ feature, view, validIds: msaList });
    const { data: msaData, isLoading: msaDataLoading, error: msaDataFetchError, } = useSWR(selectedId && selectedDatasetId
        ? `${selectedId}-${selectedId}-${msaList?.length}-msa`
        : 'none-msa', () => selectedId && selectedDataset && msaList
        ? fetchMSA({
            msaId: selectedId,
            config: selectedDataset.adapter,
            pluginManager,
        })
        : undefined, swrFlags);
    const e = msaListFetchError ?? msaDataFetchError ?? proteinSequenceError ?? viewError;
    if (e) {
        console.error(e);
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, { className: classes.dialogContent },
            e ? React.createElement(ErrorMessage, { error: e }) : null,
            React.createElement(TextField2, { select: true, label: "Select MSA dataset", value: selectedDatasetId, onChange: event => {
                    setSelectedDatasetId(event.target.value);
                } }, datasets?.map(d => (React.createElement(MenuItem, { key: d.datasetId, value: d.datasetId }, d.name)))),
            selectedDataset ? (React.createElement("div", { style: { marginTop: 50 } },
                !msaListLoading && msaDataLoading ? (React.createElement(LoadingEllipses, { variant: "h6", message: `Loading MSA for (${selectedId})` })) : null,
                msaListLoading ? (React.createElement(LoadingEllipses, { variant: "h6", message: `Loading available MSAs for (${selectedDataset.name})` })) : null,
                msaList ? (React.createElement("div", null,
                    React.createElement(SanitizedHTML, { html: selectedDataset.description }),
                    React.createElement(TranscriptSelector, { feature: feature, options: transcripts, selectedId: selectedId, selectedTranscript: selectedTranscript, onTranscriptChange: setSelectedId, proteinSequence: proteinSequence, validSet: validSet }))) : null)) : null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { color: "primary", variant: "contained", disabled: !selectedTranscript || !msaData?.length, onClick: () => {
                    try {
                        if (!selectedTranscript || !msaData) {
                            return;
                        }
                        const querySeqName = `${selectedId}_${assemblyNames[0]}`;
                        preCalculatedLaunchView({
                            session,
                            newViewTitle: getGeneDisplayName(selectedTranscript),
                            view,
                            querySeqName,
                            feature: selectedTranscript,
                            data: {
                                msa: msaData
                                    .map(r => `>${r.get('refName')}\n${r.get('seq')}`)
                                    .join('\n'),
                            },
                        });
                        handleClose();
                    }
                    catch (e) {
                        setViewError(e);
                    }
                } }, "Submit"),
            React.createElement(Button, { color: "secondary", variant: "contained", onClick: () => {
                    handleClose();
                } }, "Cancel"))));
});
export default PreLoadedMSA;
//# sourceMappingURL=PreLoadedMSADataPanel.js.map