import { hydrateTrackConfig, isConfigurationModel, } from '@jbrowse/core/configuration';
import { getEnv } from '@jbrowse/core/util';
// A session track is a frozen entry holding only what was written: an adapter
// given as a track-level `uri` and a slot at its default are absent until the
// entry hydrates, so a slot read goes through the node
export function trackConfigNode(session, conf) {
    return isConfigurationModel(conf)
        ? conf
        : hydrateTrackConfig(getEnv(session).pluginManager, conf);
}
