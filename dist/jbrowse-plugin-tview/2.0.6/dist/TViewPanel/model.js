import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes';
import { getSession } from '@jbrowse/core/util';
import { addDisposer, types } from '@jbrowse/mobx-state-tree';
import { autorun } from 'mobx';
import { MSAModelF } from 'react-msaview';
import { buildColumnToRefPos, renderedColToMsaCol } from './coords';
import { fetchTviewPlan, findTrackConf, sourceFromConfig, } from '../LaunchTView/fetchTviewPlan';
import { MAX_CELLS } from '../LaunchTView/limits';
import { renderTviewMsa } from '../LaunchTView/tview';
/**
 * #stateModel TViewPlugin
 * extends
 * - MSAModel from https://github.com/GMOD/react-msaview
 */
export default function stateModelFactory() {
    return types
        .compose('TView', BaseViewModel, MSAModelF(), types.model({
        type: types.literal('TView'),
        /**
         * #property
         * LGV this pileup was launched from; drives highlights and click-to-nav
         */
        connectedViewId: types.maybe(types.string),
        /**
         * #property
         * reference region the alignment columns span
         */
        msaRegion: types.frozen(),
        /**
         * #property
         * [refPos, width] for every position where some read has an insertion
         */
        insertionWidths: types.frozen([]),
        /**
         * #property
         * the track the alignment was built from. react-msaview drops data.msa
         * from snapshots over 50kb (it expects a msaFilehandle to reload from,
         * which tview has no equivalent of), so without this a restored session
         * brings the view back empty
         */
        msaSource: types.frozen(),
        /**
         * #property
         */
        zoomToBaseLevel: types.optional(types.boolean, false),
    }))
        .views(self => ({
        /**
         * #getter
         */
        get columnToRefPos() {
            const { msaRegion, insertionWidths } = self;
            return msaRegion
                ? buildColumnToRefPos({ ...msaRegion, insertionWidths })
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
         * the source track's config, which outlives the track being open
         */
        get msaSourceConf() {
            const { msaSource } = self;
            return msaSource
                ? findTrackConf(getSession(self), msaSource.trackId)
                : undefined;
        },
    }))
        .views(self => ({
        /**
         * #method
         */
        colToGenomeRegion(col) {
            const { columnToRefPos, msaRegion, blanks } = self;
            const pos = columnToRefPos?.[renderedColToMsaCol(blanks, col)];
            return msaRegion && pos !== undefined
                ? { refName: msaRegion.refName, start: pos, end: pos + 1 }
                : undefined;
        },
    }))
        .views(self => ({
        /**
         * #getter
         * regions the connected LGV highlights: the hovered column plus the
         * sticky clicked column
         */
        get connectedHighlights() {
            const { mouseCol, mouseClickCol } = self;
            const regions = [mouseCol, mouseClickCol]
                .filter((col) => col !== undefined)
                .map(col => self.colToGenomeRegion(col))
                .filter((r) => r !== undefined);
            // an insertion column and its reference column resolve to the same
            // position, so deduping by column would still stack two identical bands
            return [
                ...new Map(regions.map(r => [`${r.refName}:${r.start}`, r])).values(),
            ];
        },
    }))
        .volatile(() => ({
        /** a rebuild is in flight, or has failed and should not be retried */
        rebuilding: false,
        rebuildFailed: false,
    }))
        .actions(self => ({
        /**
         * #action
         */
        setRebuilding(arg) {
            self.rebuilding = arg;
        },
        /**
         * #action
         */
        setRebuildFailed(arg) {
            self.rebuildFailed = arg;
        },
        /**
         * #action
         */
        setMsaData(msa, insertionWidths) {
            self.data.setMSA(msa);
            self.insertionWidths = insertionWidths;
        },
        /**
         * #action
         */
        setZoomToBaseLevel(arg) {
            self.zoomToBaseLevel = arg;
        },
        /**
         * #action
         */
        navToColumn(col) {
            const { connectedView, zoomToBaseLevel } = self;
            const r = self.colToGenomeRegion(col);
            if (r && connectedView) {
                if (zoomToBaseLevel) {
                    connectedView.navTo(r);
                }
                else {
                    connectedView.centerAt(r.start, r.refName);
                }
            }
        },
    }))
        .actions(self => ({
        /**
         * #action
         * re-runs CoreGetFeatures for msaRegion and rebuilds the alignment
         */
        async rebuildMsa(conf, source) {
            const session = getSession(self);
            self.setRebuilding(true);
            self.setLoadingMSA(true);
            self.setStatus({ msg: 'Rebuilding alignment from track data' });
            try {
                const { plan } = await fetchTviewPlan({
                    session,
                    source: sourceFromConfig(conf),
                    region: { ...self.msaRegion, assemblyName: source.assemblyName },
                });
                if (plan.cellCount > MAX_CELLS) {
                    throw new Error(`alignment is ${plan.cellCount.toLocaleString('en-US')} cells, above the ${MAX_CELLS.toLocaleString('en-US')} limit`);
                }
                self.setMsaData(renderTviewMsa(plan), plan.insertionWidths);
            }
            catch (e) {
                console.error(e);
                self.setRebuildFailed(true);
                session.notify(`Could not rebuild tview alignment: ${e}`, 'error');
            }
            finally {
                self.setLoadingMSA(false);
                self.setStatus(undefined);
                self.setRebuilding(false);
            }
        },
    }))
        .actions(self => ({
        afterCreate() {
            addDisposer(self, autorun(() => {
                const { data, msaRegion, msaSource, msaSourceConf } = self;
                // a restored session arrives with the region and source but no
                // alignment; stays armed if the track config shows up later
                if (!data.msa &&
                    msaRegion &&
                    msaSource &&
                    msaSourceConf &&
                    !self.rebuilding &&
                    !self.rebuildFailed) {
                    // rebuildMsa handles its own failures, so it never rejects
                    void self.rebuildMsa(msaSourceConf, msaSource);
                }
            }));
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
                    self.navToColumn(col);
                }
            },
        };
    })
        .views(self => {
        // react-msaview's extraViewMenuItems() has no caller, in that package or
        // in JBrowse; the view hamburger renders menuItems(), so extend that
        const superMenuItems = self.menuItems.bind(self);
        return {
            /**
             * #method
             * overrides base
             */
            menuItems() {
                return [
                    ...superMenuItems(),
                    {
                        label: 'Zoom to base level on click?',
                        type: 'checkbox',
                        checked: self.zoomToBaseLevel,
                        onClick: () => {
                            self.setZoomToBaseLevel(!self.zoomToBaseLevel);
                        },
                    },
                ];
            },
        };
    });
}
export function isTView(view) {
    return view.type === 'TView';
}
//# sourceMappingURL=model.js.map