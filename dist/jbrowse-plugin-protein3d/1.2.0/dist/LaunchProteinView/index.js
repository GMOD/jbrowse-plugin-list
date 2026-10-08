import { getContainingTrack, getContainingView, getSession, isGeneLikeType, } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import { isCodingFeature } from './codingFeature';
import LaunchProteinViewDialog from './components/LaunchProteinViewDialog';
import { resolveGeneLaunch, sessionGeneLaunchHost } from './resolveGeneLaunch';
import { launch3DProteinView } from './utils/launchViewUtils';
import { getGeneDisplayName } from './utils/util';
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
    const track = getContainingTrack(self);
    getSession(self).queueDialog(handleClose => [
        LaunchProteinViewDialog,
        {
            model: track,
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
function firstAssemblyName(view) {
    const names = 'assemblyNames' in view ? view.assemblyNames : undefined;
    const first = Array.isArray(names) ? names[0] : undefined;
    return typeof first === 'string' ? first : undefined;
}
// The dialog's defaults without the dialog. Where they name no single
// structure, a gene two UniProt entries answer to or one AlphaFold has not
// folded, the dialog opens for the choice only a person can make.
function openAlphaFoldStructure(self, target) {
    const session = getSession(self);
    const view = getContainingView(self);
    const assemblyName = firstAssemblyName(view);
    withCodingFeature(self, target, async (feature) => {
        const name = getGeneDisplayName(feature);
        if (!assemblyName) {
            openDialog(self, target, feature);
            return;
        }
        session.notify(`Looking up the AlphaFold structure of ${name}`, 'info');
        const { transcript, userProvidedTranscriptSequence, uniprotId, url } = await resolveGeneLaunch({
            host: sessionGeneLaunchHost(session, assemblyName),
            feature,
            preferredTranscriptId: target.preferredTranscriptId,
        });
        if (url) {
            launch3DProteinView({
                session,
                view,
                feature,
                selectedTranscript: transcript,
                uniprotId,
                url,
                userProvidedTranscriptSequence,
            });
        }
        else {
            session.notify(uniprotId
                ? `AlphaFold DB has no model for ${uniprotId}`
                : `No single UniProt entry found for ${name}`, 'info');
            openDialog(self, target, feature);
        }
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
