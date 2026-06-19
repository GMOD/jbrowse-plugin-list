import { getContainingTrack, getSession } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import LaunchProteinViewDialog from './components/LaunchProteinViewDialog';
function isDisplay(elt) {
    return elt.name === 'LinearBasicDisplay';
}
function extendStateModel(stateModel) {
    return stateModel.views((self) => {
        const superContextMenuItems = self.contextMenuItems;
        return {
            contextMenuItems() {
                const feature = self.contextMenuFeature;
                const showProteinMenuItem = feature !== undefined &&
                    ['gene', 'mRNA', 'transcript'].includes(feature.get('type'));
                return [
                    ...superContextMenuItems(),
                    ...(showProteinMenuItem
                        ? [
                            {
                                label: 'Launch protein view',
                                icon: AddIcon,
                                onClick: () => {
                                    const track = getContainingTrack(self);
                                    const session = getSession(track);
                                    session.queueDialog(handleClose => [
                                        LaunchProteinViewDialog,
                                        { model: track, handleClose, feature },
                                    ]);
                                },
                            },
                        ]
                        : []),
                ];
            },
        };
    });
}
export default function LaunchProteinViewF(pluginManager) {
    pluginManager.addToExtensionPoint('Core-extendPluggableElement', (elt) => {
        if (isDisplay(elt)) {
            elt.stateModel = extendStateModel(elt.stateModel);
        }
        return elt;
    });
}
