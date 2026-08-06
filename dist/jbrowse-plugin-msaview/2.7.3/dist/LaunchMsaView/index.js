import { getContainingTrack, getSession } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import LaunchMsaViewDialog from './components/LaunchMsaViewDialog';
function isDisplay(elt) {
    return elt.name === 'LinearBasicDisplay';
}
const GENE_LIKE_TYPES = new Set(['gene', 'mRNA', 'transcript']);
function extendStateModel(stateModel) {
    return stateModel.views((self) => {
        const superContextMenuItems = self.contextMenuItems;
        return {
            contextMenuItems() {
                const track = getContainingTrack(self);
                const session = getSession(track);
                const launch = (feature) => {
                    session.queueDialog(handleClose => [
                        LaunchMsaViewDialog,
                        { model: track, handleClose, feature },
                    ]);
                };
                const info = self.contextMenuInfo;
                const fetchFullFeature = self.fetchFullFeature;
                const legacyFeature = self.contextMenuFeature;
                const onClick = info && fetchFullFeature && self.isGeneLike
                    ? () => {
                        fetchFullFeature(info.item.featureId, info.displayedRegionIndex)
                            .then(feature => {
                            if (feature) {
                                launch(feature);
                            }
                            else {
                                session.notify('Could not load feature for MSA view', 'warning');
                            }
                        })
                            .catch((e) => {
                            session.notifyError(`${e}`, e);
                        });
                    }
                    : legacyFeature &&
                        GENE_LIKE_TYPES.has(String(legacyFeature.get('type')))
                        ? () => {
                            launch(legacyFeature);
                        }
                        : undefined;
                return [
                    ...superContextMenuItems(),
                    ...(onClick
                        ? [{ label: 'Launch MSA view', icon: AddIcon, onClick }]
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
