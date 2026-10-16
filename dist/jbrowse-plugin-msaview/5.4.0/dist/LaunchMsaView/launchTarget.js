import { isGeneLikeType } from '@jbrowse/core/util';
// Read off the clicked item rather than off the display: LinearBasicDisplay's
// `isGeneLike` getter was inlined into its own `contextMenuItems`
// (jbrowse-components 684142b3), and gating on it silently took the item off
// every gene track.
export function launchTarget(self) {
    const info = self.contextMenuInfo;
    return info && isGeneLikeType(info.item.type)
        ? {
            fetchFeature: () => self.fetchFullFeature(info.item.featureId, info.displayedRegionIndex),
            preferredTranscriptId: info.subfeature?.featureId,
        }
        : undefined;
}
