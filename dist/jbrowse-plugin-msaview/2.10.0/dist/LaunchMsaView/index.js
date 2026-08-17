import { getContainingTrack, getSession } from '@jbrowse/core/util';
import AddIcon from '@mui/icons-material/Add';
import LaunchMsaViewDialog from './components/LaunchMsaViewDialog';
function isDisplay(elt) {
    return elt.name === 'LinearBasicDisplay';
}
// Read off the clicked item rather than off the display.
//
// LinearBasicDisplay used to publish an `isGeneLike` getter and this gated on
// it. jbrowse-components 684142b3 (2026-08-16) inlined that getter into its own
// `contextMenuItems`, and every host built after it returns `undefined` here --
// so the gate was never satisfied, `onClick` stayed undefined, and the item
// silently left the right-click menu on every gene track. Nothing failed loudly:
// the display still had contextMenuInfo and fetchFullFeature, and the menu still
// opened with its own items in it.
//
// A predicate over the type we were already given cannot go the same way, and it
// costs one comparison. Deliberately the same loose case-insensitive test the
// host applies (`isGeneLikeType` in collapseIntronsMenu.ts): real GFFs carry
// 'mRNA', 'lnc_RNA', 'protein_coding_gene', 'transcript'.
function isGeneLikeType(type) {
    const t = (type ?? '').toLowerCase();
    return t.includes('gene') || t.includes('rna') || t.includes('transcript');
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
                const onClick = info && fetchFullFeature && isGeneLikeType(info.item.type)
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
