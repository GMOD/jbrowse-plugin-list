import { getContainingTrack, getSession } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import LaunchProteinViewDialog from './components/LaunchProteinViewDialog';
function isDisplay(elt) {
    return (elt.name === 'LinearBasicDisplay' || elt.name === 'LinearFeatureDisplay');
}
function extendStateModel(stateModel) {
    return stateModel.views((self) => {
        const superContextMenuItems = self.contextMenuItems;
        return {
            contextMenuItems() {
                const feature = self.contextMenuFeature;
                const track = getContainingTrack(self);
                // DO NOT DELETE: contextMenuInfo must be captured here, not inside
                // onClick. The canvas display clears contextMenuInfo when the context
                // menu closes, which happens before onClick fires. Capturing it here
                // in the view ensures the regionNumber is available in the closure.
                const contextMenuInfo = self.contextMenuInfo;
                const showProteinMenuItem = feature &&
                    ['gene', 'mRNA', 'transcript'].includes(feature.get('type'));
                return [
                    ...superContextMenuItems(),
                    ...(showProteinMenuItem
                        ? [
                            {
                                label: 'Launch protein view',
                                icon: AddIcon,
                                onClick: () => {
                                    const session = getSession(track);
                                    const openDialog = (f) => {
                                        session.queueDialog(handleClose => [
                                            LaunchProteinViewDialog,
                                            { model: track, handleClose, feature: f },
                                        ]);
                                    };
                                    if (self.fetchFullFeature && contextMenuInfo) {
                                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                        ;
                                        (async () => {
                                            const fullFeature = await self.fetchFullFeature(feature.id(), contextMenuInfo.regionNumber);
                                            if (fullFeature) {
                                                openDialog(fullFeature);
                                            }
                                        })();
                                    }
                                    else {
                                        openDialog(feature);
                                    }
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
//# sourceMappingURL=index.js.map