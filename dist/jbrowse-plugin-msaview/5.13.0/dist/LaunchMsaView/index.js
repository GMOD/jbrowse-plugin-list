import { lazy } from 'react';
import { getContainingTrack, getSession } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import { isCodingFeature } from './codingFeature';
import { launchTarget } from './launchTarget';
const LaunchMsaViewDialog = lazy(() => import('./components/LaunchMsaViewDialog'));
function isDisplay(elt) {
    return elt.name === 'LinearBasicDisplay';
}
// Walking to the track and the session at click time, not while the menu is
// built: contextMenuItems runs on every right-click and, on a host whose base
// method reads `this`, is the one place a plugin can take the whole menu down.
// Keeping it to a pure read of the display is also what lets a test call it.
function featureName(feature) {
    return feature.get('name') ?? feature.get('id') ?? 'This feature';
}
function openDialog(self, target) {
    const track = getContainingTrack(self);
    const session = getSession(track);
    const { preferredTranscriptId } = target;
    const open = (feature) => {
        session.queueDialog(handleClose => [
            LaunchMsaViewDialog,
            { model: track, handleClose, feature, preferredTranscriptId },
        ]);
    };
    target
        .fetchFeature()
        .then(feature => {
        if (!feature) {
            session.notify('Could not load feature for MSA view', 'warning');
        }
        else if (!isCodingFeature(feature)) {
            // the canvas hit test carries a type and nothing else, so this is the
            // first point at which the CDS can be looked for. Saying so beats
            // opening a dialog whose Submit never leaves grey.
            session.notify(`${featureName(feature)} has no coding sequence, so there is no protein to align`, 'info');
        }
        else {
            open(feature);
        }
    })
        .catch((e) => {
        session.notifyError(`${e}`, e);
    });
}
export function extendStateModel(stateModel) {
    return stateModel.views((self) => {
        const superContextMenuItems = self.contextMenuItems;
        return {
            contextMenuItems() {
                const target = launchTarget(self);
                return [
                    // a detached call leaves `this` undefined for a host method that
                    // reads it, and the throw takes the host's own rows with it
                    ...superContextMenuItems.call(self),
                    ...(target
                        ? [
                            {
                                label: 'Launch MSA view',
                                icon: AddIcon,
                                onClick: () => {
                                    openDialog(self, target);
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
