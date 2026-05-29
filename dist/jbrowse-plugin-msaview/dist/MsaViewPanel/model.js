import { lazy } from 'react';
import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes';
import { getSession } from '@jbrowse/core/util';
import { addDisposer, types } from '@jbrowse/mobx-state-tree';
import { genomeToTranscriptSeqMapping } from 'g2p_mapper';
import { autorun } from 'mobx';
import { MSAModelF } from 'react-msaview';
import { autoConnectStructures, highlightConnectedStructures, launchBlastIfNeeded, loadStoredData, observeProteinHighlights, processInit, runCleanup, storeDataToIndexedDB, syncGenomeHoverToMsaColumn, } from './afterCreateAutoruns';
import { msaCoordToGenomeCoord } from './msaCoordToGenomeCoord';
import { buildAlignmentMaps, runPairwiseAlignment } from './pairwiseAlignment';
import { getProteinViews } from './structureConnection';
import { getCanonicalRefName } from './util';
const ConnectStructureDialog = lazy(() => import('./components/ConnectStructureDialog'));
/**
 * #stateModel MsaViewPlugin
 * extends
 * - MSAModel from https://github.com/GMOD/react-msaview
 */
export default function stateModelFactory() {
    return types
        .compose(BaseViewModel, MSAModelF(), types.model('MsaView', {
        /**
         * #property
         */
        connectedViewId: types.maybe(types.string),
        /**
         * #property
         */
        connectedFeature: types.frozen(),
        /**
         * #property
         */
        /**
         * #property
         */
        blastParams: types.frozen(),
        /**
         * #property
         */
        querySeqName: 'QUERY',
        /**
         * #property
         */
        uniprotId: types.maybe(types.string),
        /**
         * #property
         */
        zoomToBaseLevel: false,
        /**
         * #property
         */
        init: types.frozen(),
        /**
         * #property
         */
        connectedStructures: types.array(types.frozen()),
        /**
         * #property
         */
        dataStoreId: types.maybe(types.string),
        /**
         * #property
         */
        mafRegion: types.frozen(),
    }))
        .volatile(() => ({
        /**
         * #volatile
         */
        rid: undefined,
        /**
         * #volatile
         */
        progress: '',
        /**
         * #volatile
         */
        error: undefined,
        /**
         * #volatile
         */
        loadingStoredData: false,
        /**
         * #volatile
         */
        isStoringData: false,
    }))
        .views(self => ({
        /**
         * #method
         */
        getRowByName(rowName) {
            return self.rows.find(r => r[0] === rowName);
        },
        /**
         * #method
         */
        getSequenceByRowName(rowName) {
            return self.rows.find(r => r[0] === rowName)?.[1];
        },
    }))
        .views(self => ({
        /**
         * #getter
         */
        get transcriptToMsaMap() {
            return self.connectedFeature
                ? genomeToTranscriptSeqMapping(self.connectedFeature)
                : undefined;
        },
        /**
         * #getter
         */
        get connectedView() {
            const { views } = getSession(self);
            return views.find(f => f.id === self.connectedViewId);
        },
        /**
         * #getter
         */
        get connectedProteinViews() {
            const proteinViews = getProteinViews(getSession(self).views);
            const result = [];
            for (const conn of self.connectedStructures) {
                const proteinView = proteinViews.find(v => v.id === conn.proteinViewId);
                if (proteinView) {
                    result.push({ ...conn, proteinView });
                }
            }
            return result;
        },
    }))
        .views(self => ({
        /**
         * #getter
         */
        get connectedHighlights() {
            const { mouseCol, mouseClickCol } = self;
            return [
                mouseCol === undefined
                    ? undefined
                    : msaCoordToGenomeCoord({ model: self, coord: mouseCol }),
                mouseClickCol === undefined
                    ? undefined
                    : msaCoordToGenomeCoord({ model: self, coord: mouseClickCol }),
            ].filter((r) => r !== undefined);
        },
    }))
        .actions(self => ({
        /**
         * #action
         */
        setZoomToBaseLevel(arg) {
            self.zoomToBaseLevel = arg;
        },
        /**
         * #action
         */
        setError(e) {
            self.error = e;
        },
        /**
         * #action
         */
        setProgress(arg) {
            self.progress = arg;
        },
        /**
         * #action
         */
        setRid(arg) {
            self.rid = arg;
        },
        /**
         * #action
         */
        setBlastParams(args) {
            self.blastParams = args;
        },
        /**
         * #action
         */
        setInit(arg) {
            self.init = arg;
        },
        /**
         * #action
         */
        setQuerySeqName(arg) {
            self.querySeqName = arg;
        },
        /**
         * #action
         */
        setUniprotId(arg) {
            self.uniprotId = arg;
        },
        /**
         * #action
         */
        setDataStoreId(arg) {
            self.dataStoreId = arg;
        },
        /**
         * #action
         */
        setMafRegion(arg) {
            self.mafRegion = arg;
        },
        /**
         * #action
         */
        setLoadingStoredData(arg) {
            self.loadingStoredData = arg;
        },
        /**
         * #action
         */
        setIsStoringData(arg) {
            self.isStoringData = arg;
        },
        /**
         * #action
         */
        handleMsaClick(coord) {
            const { connectedView, zoomToBaseLevel } = self;
            const { assemblyManager } = getSession(self);
            const r2 = msaCoordToGenomeCoord({ model: self, coord });
            if (!r2 || !connectedView) {
                return;
            }
            if (zoomToBaseLevel) {
                connectedView.navTo(r2);
            }
            else {
                const r = getCanonicalRefName({
                    assemblyManager,
                    assemblyNames: connectedView.assemblyNames,
                    refName: r2.refName,
                });
                connectedView.centerAt(r2.start, r);
            }
        },
        /**
         * #action
         */
        connectToStructure(proteinViewId, structureIdx, msaRowName) {
            const rowName = msaRowName ?? self.querySeqName;
            const msaSequence = self.getSequenceByRowName(rowName);
            if (!msaSequence) {
                throw new Error(`MSA row "${rowName}" not found`);
            }
            const ungappedMsaSequence = msaSequence.replaceAll('-', '');
            const proteinView = getProteinViews(getSession(self).views).find(v => v.id === proteinViewId);
            if (!proteinView) {
                throw new Error(`ProteinView "${proteinViewId}" not found`);
            }
            const structure = proteinView.structures[structureIdx];
            if (!structure) {
                throw new Error(`Structure at index ${structureIdx} not found`);
            }
            const structureSequence = structure.structureSequences?.[0];
            if (!structureSequence) {
                throw new Error('Structure sequence not available');
            }
            const alignment = runPairwiseAlignment(ungappedMsaSequence, structureSequence);
            const { seq1ToSeq2 } = buildAlignmentMaps(alignment);
            const connection = {
                proteinViewId,
                structureIdx,
                msaRowName: rowName,
                msaToStructure: Object.fromEntries(seq1ToSeq2),
            };
            self.connectedStructures.push(connection);
        },
        /**
         * #action
         */
        disconnectFromStructure(proteinViewId, structureIdx) {
            const idx = self.connectedStructures.findIndex(c => c.proteinViewId === proteinViewId &&
                c.structureIdx === structureIdx);
            if (idx !== -1) {
                self.connectedStructures.splice(idx, 1);
            }
        },
        /**
         * #action
         */
        disconnectAllStructures() {
            self.connectedStructures.clear();
        },
    }))
        .actions(self => {
        const superSetMouseClickPos = self.setMouseClickPos.bind(self);
        return {
            /**
             * #action
             */
            setMouseClickPos(col, row) {
                superSetMouseClickPos(col, row);
                if (col !== undefined) {
                    self.handleMsaClick(col);
                }
            },
        };
    })
        .views(self => ({
        /**
         * #method
         */
        extraViewMenuItems() {
            return [
                {
                    label: 'Zoom to base level on click?',
                    checked: self.zoomToBaseLevel,
                    type: 'checkbox',
                    onClick: () => {
                        self.setZoomToBaseLevel(!self.zoomToBaseLevel);
                    },
                },
                {
                    label: 'Connect to protein structure...',
                    onClick: () => {
                        getSession(self).queueDialog(handleClose => [
                            ConnectStructureDialog,
                            {
                                model: self,
                                handleClose,
                            },
                        ]);
                    },
                },
                ...(self.connectedStructures.length > 0
                    ? [
                        {
                            label: 'Disconnect from protein structures',
                            onClick: () => {
                                self.disconnectAllStructures();
                            },
                        },
                    ]
                    : []),
            ];
        },
    }))
        .actions(self => ({
        afterCreate() {
            runCleanup();
            for (const fn of [
                loadStoredData,
                storeDataToIndexedDB,
                launchBlastIfNeeded,
                processInit,
                highlightConnectedStructures,
                autoConnectStructures,
                observeProteinHighlights,
            ]) {
                addDisposer(self, autorun(() => {
                    fn(self);
                }));
            }
            addDisposer(self, autorun(syncGenomeHoverToMsaColumn(self)));
        },
    }));
}
export function isMsaView(view) {
    return view.type === 'MsaView';
}
