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
                const feature = self.contextMenuFeature;
                const track = getContainingTrack(self);
                const featureType = feature?.get('type');
                const showMsaMenuItem = feature && ['gene', 'mRNA', 'transcript'].includes(featureType);
                return [
                    ...superContextMenuItems(),
                    ...(showMsaMenuItem
                        ? [
                            {
                                label: 'Launch MSA view',
                                icon: AddIcon,
                                onClick: () => {
                                    getSession(track).queueDialog(handleClose => [
                                        LaunchMsaViewDialog,
                                        {
                                            model: track,
                                            handleClose,
                                            feature,
                                        },
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
export default function LaunchMsaViewF(pluginManager) {
    pluginManager.addToExtensionPoint('Core-extendPluggableElement', (elt) => {
        if (isDisplay(elt)) {
            elt.stateModel = extendStateModel(elt.stateModel);
        }
        return elt;
    });
}
//# sourceMappingURL=index.js.map