import { addViewMenuItems } from '@jbrowse/core/pluggableElementTypes';
import { getContainingTrack, getContainingView, getSession, } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import { alignmentsTrackIds, isGenomeView, launchTView, regionLaunch, } from './launch';
const VISIBLE_REGION_LABEL = 'Launch tview for visible region';
const SELECTION_LABEL = 'Tview of all alignments tracks';
function isDisplay(elt) {
    return elt.name === 'LinearAlignmentsDisplay';
}
function launchItem({ label, launch, session, tracks, connectedViewId, }) {
    return {
        label,
        icon: AddIcon,
        disabled: launch.reason !== undefined,
        subLabel: launch.reason,
        onClick: () => {
            if (launch.reason === undefined) {
                launchTView(session, { ...launch, tracks, connectedViewId });
            }
        },
    };
}
function extendStateModel(stateModel) {
    return stateModel.views((self) => {
        const superTrackMenuItems = self.trackMenuItems;
        return {
            trackMenuItems() {
                const session = getSession(self);
                const view = getContainingView(self);
                const track = getContainingTrack(self);
                return [
                    ...superTrackMenuItems(),
                    launchItem({
                        label: VISIBLE_REGION_LABEL,
                        launch: isGenomeView(view)
                            ? regionLaunch(session, view.visibleWholeBaseRegions)
                            : { reason: 'Not in a linear genome view' },
                        session,
                        tracks: [track.configuration.trackId],
                        connectedViewId: view.id,
                    }),
                ];
            },
        };
    });
}
export default function LaunchTViewF(pluginManager) {
    pluginManager.addToExtensionPoint('Core-extendPluggableElement', (elt) => {
        if (isDisplay(elt)) {
            elt.stateModel = extendStateModel(elt.stateModel);
        }
        return elt;
    });
    addViewMenuItems(pluginManager, 'LinearGenomeView', {
        menu: 'rubberBandLaunchMenuItems',
        items: self => {
            const tracks = alignmentsTrackIds(self.tracks);
            return tracks.length
                ? launchItem({
                    label: SELECTION_LABEL,
                    launch: regionLaunch(getSession(self), self.getSelectedRegions(self.leftOffset, self.rightOffset)),
                    session: getSession(self),
                    tracks,
                    connectedViewId: self.id,
                })
                : undefined;
        },
    });
}
//# sourceMappingURL=index.js.map