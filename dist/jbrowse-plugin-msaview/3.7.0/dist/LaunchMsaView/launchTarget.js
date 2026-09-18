import { geneLikeRoot, isGeneLikeType, isKnownNonCoding } from './codingFeature';
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
export { isGeneLikeType };
/**
 * How to get the right-clicked feature, or nothing when there is nothing to
 * launch on. Both host shapes reduce to one target, so the menu item is built
 * and the dialog is opened by one code path — and the same gene test decides
 * both. The strict three-name set the legacy branch used to carry disagreed
 * with the loose one above, so a `lnc_RNA` offered the menu item on a 4.3 host
 * and not on a 3.7 one.
 *
 * Gene-like is not enough on its own: an lncRNA has no protein to align, and
 * accepting it opened a dialog whose Submit never left grey, with nothing
 * saying why. Where the whole feature is in hand the CDS decides here -- but
 * only where there are subfeatures to read it off, since a feature that came
 * with none has not answered the question.
 */
export function launchTarget(self) {
    const info = self.contextMenuInfo;
    const fetchFullFeature = self.fetchFullFeature;
    // exclusive, not a fallthrough: a display publishing contextMenuInfo has
    // already said what was clicked, and reading contextMenuFeature after it
    // rejects the click can only answer with some other feature
    if (info && fetchFullFeature) {
        return isGeneLikeType(info.item.type)
            ? {
                fetchFeature: () => fetchFullFeature(info.item.featureId, info.displayedRegionIndex),
            }
            : undefined;
    }
    const legacy = self.contextMenuFeature;
    if (!legacy) {
        return undefined;
    }
    const root = geneLikeRoot(legacy);
    return isGeneLikeType(root.get('type')) && !isKnownNonCoding(root)
        ? { feature: root, preferredTranscriptId: legacy.id() }
        : undefined;
}
