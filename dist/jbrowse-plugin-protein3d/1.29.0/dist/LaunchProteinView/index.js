import { lazy } from 'react';
import { getContainingTrack, getContainingView, getSession, isGeneLikeType, } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import { isCodingFeature } from './codingFeature';
import { isLaunchingGenomeView } from './utils/genomeView';
import { getGeneDisplayName } from './utils/util';
// the menu items register at boot; what they open loads on the first click
const LaunchProteinViewDialog = lazy(() => import('./components/LaunchProteinViewDialog'));
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
function withCodingFeature(self, target, then) {
    const session = getSession(self);
    target
        .fetchFeature()
        .then(feature => {
        if (!feature) {
            session.notify('Could not load feature for protein view', 'warning');
            return undefined;
        }
        else if (!isCodingFeature(feature)) {
            session.notify(`${feature.get('name') ?? feature.get('id') ?? 'This feature'} has no coding sequence, so there is no protein to show`, 'info');
            return undefined;
        }
        else {
            return then(feature);
        }
    })
        .catch((e) => {
        console.error(e);
        session.notifyError(`${e}`, e);
    });
}
function openDialog(self, target, feature) {
    const session = getSession(self);
    const view = getContainingView(self);
    if (!isLaunchingGenomeView(view)) {
        session.notify(`A protein view launches from a genome view, not a ${view.type}`, 'warning');
        return;
    }
    session.queueDialog(handleClose => [
        LaunchProteinViewDialog,
        {
            model: getContainingTrack(self),
            view,
            handleClose,
            feature,
            preferredTranscriptId: target.preferredTranscriptId,
        },
    ]);
}
function launchProteinView(self, target) {
    withCodingFeature(self, target, feature => {
        openDialog(self, target, feature);
    });
}
const lookingUp = new Set();
// The dialog's defaults without the dialog. Where they name no single
// structure, a gene two UniProt entries answer to or one AlphaFold has not
// folded, the dialog opens for the choice only a person can make.
function openAlphaFoldStructure(self, target) {
    const session = getSession(self);
    const view = getContainingView(self);
    withCodingFeature(self, target, async (feature) => {
        const name = getGeneDisplayName(feature);
        const genomeView = isLaunchingGenomeView(view) ? view : undefined;
        const assemblyName = genomeView?.assemblyNames[0];
        if (!genomeView || !assemblyName) {
            openDialog(self, target, feature);
            return;
        }
        const key = `${genomeView.id}:${feature.id()}:${target.preferredTranscriptId}`;
        if (lookingUp.has(key)) {
            session.notify(`Still looking up the AlphaFold structure of ${name}`, 'info');
            return;
        }
        lookingUp.add(key);
        try {
            session.notify(`Looking up the AlphaFold structure of ${name}`, 'info');
            const [{ describeMissingStructure, resolveGeneLaunch, sessionGeneLaunchHost }, { launch3DProteinView },] = await Promise.all([
                import('./resolveGeneLaunch'),
                import('./utils/launchViewUtils'),
            ]);
            const launch = await resolveGeneLaunch({
                host: sessionGeneLaunchHost(session, assemblyName),
                feature,
                preferredTranscriptId: target.preferredTranscriptId,
            });
            const { transcript, userProvidedTranscriptSequence, uniprotId, url } = launch;
            if (url) {
                await launch3DProteinView({
                    session,
                    view: genomeView,
                    feature,
                    selectedTranscript: transcript,
                    uniprotId,
                    url,
                    userProvidedTranscriptSequence,
                });
            }
            else {
                session.notify(describeMissingStructure(name, launch), launch.lookupError === undefined ? 'info' : 'warning');
                openDialog(self, target, feature);
            }
        }
        finally {
            lookingUp.delete(key);
        }
    });
}
function proteinMenuItems(self) {
    const target = resolveTarget(self);
    return target && isGeneLikeType(target.type)
        ? [
            {
                label: 'Open AlphaFold structure',
                icon: AddIcon,
                onClick: () => {
                    openAlphaFoldStructure(self, target);
                },
            },
            {
                label: 'Launch protein view',
                icon: AddIcon,
                onClick: () => {
                    launchProteinView(self, target);
                },
            },
        ]
        : [];
}
// `contextMenuInfo` is the host's shape and changes between releases; a throw
// while reading it would take the host's whole context menu down with it
export function withProteinMenuItems(self, hostItems) {
    try {
        return [...hostItems, ...proteinMenuItems(self)];
    }
    catch (e) {
        console.error('Protein view menu items failed', e);
        return hostItems;
    }
}
function extendStateModel(stateModel) {
    return stateModel.views((self) => {
        const superContextMenuItems = self.contextMenuItems;
        return {
            contextMenuItems() {
                return withProteinMenuItems(self, superContextMenuItems());
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
