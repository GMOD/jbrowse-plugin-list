import { getContainingTrack, getSession } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import LaunchTViewDialog from './components/LaunchTViewDialog';
function isDisplay(elt) {
    return elt.name === 'LinearAlignmentsDisplay';
}
function extendStateModel(stateModel) {
    return stateModel.views((self) => {
        const superTrackMenuItems = self.trackMenuItems;
        return {
            trackMenuItems() {
                return [
                    ...superTrackMenuItems(),
                    {
                        label: 'Launch tview for visible region',
                        icon: AddIcon,
                        onClick: () => {
                            const track = getContainingTrack(self);
                            getSession(track).queueDialog(handleClose => [
                                LaunchTViewDialog,
                                {
                                    model: track,
                                    handleClose,
                                },
                            ]);
                        },
                    },
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
}
//# sourceMappingURL=index.js.map