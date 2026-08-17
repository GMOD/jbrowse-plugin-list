import { getContainingTrack, getSession } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import LaunchProteinViewDialog from './components/LaunchProteinViewDialog';
function isDisplay(elt) {
    return elt.name === 'LinearBasicDisplay';
}
const PROTEIN_FEATURE_TYPES = ['gene', 'mRNA', 'transcript'];
function canvasTarget(info, fetchFullFeature) {
    const { item, subfeature, displayedRegionIndex } = info;
    const type = subfeature ? subfeature.type : item.type;
    // The parent gene, not the clicked isoform: the dialog picks the transcript
    // itself and needs every CDS record, which only the whole feature carries.
    const parentId = subfeature ? subfeature.parentFeatureId : item.featureId;
    return type === undefined
        ? undefined
        : {
            type,
            fetchFeature: () => fetchFullFeature(parentId, displayedRegionIndex),
        };
}
function legacyTarget(feature) {
    const type = feature.get('type');
    return type === undefined ? undefined : { type, feature };
}
function resolveTarget(self) {
    const { contextMenuFeature, contextMenuInfo, fetchFullFeature } = self;
    return contextMenuInfo && fetchFullFeature
        ? canvasTarget(contextMenuInfo, fetchFullFeature)
        : contextMenuFeature
            ? legacyTarget(contextMenuFeature)
            : undefined;
}
function launchProteinView(self, target) {
    const track = getContainingTrack(self);
    const session = getSession(track);
    const openDialog = (feature) => {
        session.queueDialog(handleClose => [
            LaunchProteinViewDialog,
            { model: track, handleClose, feature },
        ]);
    };
    if ('feature' in target) {
        openDialog(target.feature);
    }
    else {
        target
            .fetchFeature()
            .then(feature => {
            if (feature) {
                openDialog(feature);
            }
            else {
                session.notify('Could not load feature for protein view', 'warning');
            }
        })
            .catch((e) => {
            console.error(e);
            session.notifyError(`${e}`, e);
        });
    }
}
function extendStateModel(stateModel) {
    return stateModel.views((self) => {
        // .call(self), not a bare call: the canvas display's own contextMenuItems
        // reads `this.isGeneLike`, so invoking it detached throws on undefined and
        // the ErrorBoundary around the menu swallows it -- the user right-clicks a
        // feature and gets no menu at all, not merely no protein item.
        const superContextMenuItems = self.contextMenuItems;
        return {
            contextMenuItems() {
                const target = resolveTarget(self);
                return [
                    ...superContextMenuItems.call(self),
                    ...(target && PROTEIN_FEATURE_TYPES.includes(target.type)
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
            elt.stateModel = extendStateModel(elt.stateModel);
        }
        return elt;
    });
}
