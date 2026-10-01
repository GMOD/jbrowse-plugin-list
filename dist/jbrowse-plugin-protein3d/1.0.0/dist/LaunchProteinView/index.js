import { getContainingTrack, getSession, isGeneLikeType, } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import { isCodingFeature } from './codingFeature';
import LaunchProteinViewDialog from './components/LaunchProteinViewDialog';
function isDisplay(elt) {
    return elt.name === 'LinearBasicDisplay';
}
export function resolveTarget(self) {
    const info = self.contextMenuInfo;
    if (!info) {
        return undefined;
    }
    const { item, subfeature, displayedRegionIndex } = info;
    const type = subfeature ? subfeature.type : item.type;
    // The parent gene, not the clicked isoform: the dialog picks the transcript
    // itself and needs every CDS record, which only the whole feature carries.
    const parentId = subfeature ? subfeature.parentFeatureId : item.featureId;
    return type === undefined
        ? undefined
        : {
            type,
            fetchFeature: () => self.fetchFullFeature(parentId, displayedRegionIndex),
            preferredTranscriptId: subfeature?.featureId,
        };
}
function launchProteinView(self, target) {
    const track = getContainingTrack(self);
    const session = getSession(track);
    const { preferredTranscriptId } = target;
    const openDialog = (feature) => {
        session.queueDialog(handleClose => [
            LaunchProteinViewDialog,
            { model: track, handleClose, feature, preferredTranscriptId },
        ]);
    };
    target
        .fetchFeature()
        .then(feature => {
        if (!feature) {
            session.notify('Could not load feature for protein view', 'warning');
        }
        else if (!isCodingFeature(feature)) {
            session.notify(`${feature.get('name') ?? feature.get('id') ?? 'This feature'} has no coding sequence, so there is no protein to show`, 'info');
        }
        else {
            openDialog(feature);
        }
    })
        .catch((e) => {
        console.error(e);
        session.notifyError(`${e}`, e);
    });
}
function extendStateModel(stateModel) {
    return stateModel.views((self) => {
        const superContextMenuItems = self.contextMenuItems;
        return {
            contextMenuItems() {
                const target = resolveTarget(self);
                return [
                    ...superContextMenuItems(),
                    ...(target && isGeneLikeType(target.type)
                        ? [
                            {
                                label: 'Launch protein view',
                                icon: AddIcon,
                                onClick: () => {
                                    launchProteinView(self, target);
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
            elt.extendStateModel(extendStateModel);
        }
        return elt;
    });
}
