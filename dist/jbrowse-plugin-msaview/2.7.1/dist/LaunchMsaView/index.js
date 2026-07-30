import { getContainingTrack, getSession } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import LaunchMsaViewDialog from './components/LaunchMsaViewDialog';
function isDisplay(elt) {
    return elt.name === 'LinearBasicDisplay';
}
function extendStateModel(stateModel) {
    return stateModel.views((self) => {
        const superContextMenuItems = self.contextMenuItems;
        return {
            contextMenuItems() {
                const track = getContainingTrack(self);
                const session = getSession(track);
                const info = self.contextMenuInfo;
                const showMsaMenuItem = info && self.isGeneLike;
                return [
                    ...superContextMenuItems(),
                    ...(showMsaMenuItem
                        ? [
                            {
                                label: 'Launch MSA view',
                                icon: AddIcon,
                                onClick: () => {
                                    self
                                        .fetchFullFeature(info.item.featureId, info.displayedRegionIndex)
                                        .then(feature => {
                                        if (feature) {
                                            session.queueDialog(handleClose => [
                                                LaunchMsaViewDialog,
                                                { model: track, handleClose, feature },
                                            ]);
                                        }
                                        else {
                                            session.notify('Could not load feature for MSA view', 'warning');
                                        }
                                    })
                                        .catch((e) => {
                                        session.notifyError(`${e}`, e);
                                    });
                                },
                            },
                        ]
                        : []),
                ];
            },
        };
    });
}
export default function LaunchMsaViewF(pluginManager) {
    pluginManager.addToExtensionPoint('Core-extendPluggableElement', (elt) => {
        if (isDisplay(elt)) {
            elt.stateModel = extendStateModel(elt.stateModel);
        }
        return elt;
    });
}
