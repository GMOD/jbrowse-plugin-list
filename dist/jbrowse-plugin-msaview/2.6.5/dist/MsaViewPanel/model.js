import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes';
import { getSession } from '@jbrowse/core/util';
import { addDisposer, types } from '@jbrowse/mobx-state-tree';
import { genomeToTranscriptSeqMapping } from 'g2p_mapper';
import { autorun } from 'mobx';
import { MSAModelF } from 'react-msaview';
import { autoLoadProteinDomains, launchBlastIfNeeded, loadStoredData, observeProteinHighlights, processInit, runCleanup, storeDataToIndexedDB, syncGenomeHoverToMsaColumn, } from './afterCreateAutoruns';
import { msaCoordToGenomeCoord } from './msaCoordToGenomeCoord';
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
        /**
         * #volatile
         * guards the one-shot auto-fetch of protein domains so it doesn't refire
         * when NCBI returns no domains (leaving interProAnnotations undefined)
         */
        domainsRequested: false,
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
        setDomainsRequested(arg) {
            self.domainsRequested = arg;
        },
        /**
         * #action
         */
        handleMsaClick(coord) {
            const { connectedView, zoomToBaseLevel } = self;
            const r2 = msaCoordToGenomeCoord({ model: self, coord });
            if (!r2 || !connectedView) {
                return;
            }
            // Use the genome coord's own refName for both nav paths — it matches the
            // connected view's displayed regions. Canonicalizing (e.g. "chr17"->"17")
            // can miss a view whose regions are an alias (same as the bpToPx path).
            if (zoomToBaseLevel) {
                connectedView.navTo(r2);
            }
            else {
                connectedView.centerAt(r2.start, r2.refName);
            }
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
                autoLoadProteinDomains,
            ]) {
                addDisposer(self, autorun(() => {
                    fn(self);
                }));
            }
            // these two keep per-reaction state across runs (a "did I set it?" flag),
            // so they're factories returning the autorun body rather than plain fns
            addDisposer(self, autorun(syncGenomeHoverToMsaColumn(self)));
            addDisposer(self, autorun(observeProteinHighlights(self)));
        },
    }));
}
export function isMsaView(view) {
    return view.type === 'MsaView';
}
