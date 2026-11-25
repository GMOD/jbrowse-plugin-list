import type PluginManager from '@jbrowse/core/PluginManager';
import type { AbstractSessionModel } from '@jbrowse/core/util';
/**
 * `LaunchView-TView`, so a session spec URL can open one.
 *
 * A spec view is flat arguments to this launcher, while a config or
 * defaultSession view is MST state with the locus under `init`, so the spec
 *
 *     { type: 'TView', assembly: 'hg19', loc: 'chrX:1..2', tracks: ['HG002'] }
 *
 * and the config
 *
 *     { type: 'TView', init: { assembly: 'hg19', loc: '…', tracks: […] } }
 *
 * are the same view. Every other key is passed through as a view prop.
 */
export type LaunchTViewArgs = {
    session: AbstractSessionModel;
} & Record<string, unknown>;
export default function LaunchTViewF(pluginManager: PluginManager): void;
