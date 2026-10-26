import { isAlive } from '@jbrowse/mobx-state-tree';
/**
 * Logs a failure, and shows it on `host` only while `plugin` is still the one
 * `host` draws with: a disposed plugin's failure is not the reader's error.
 */
export function reportPluginFailure(host, plugin) {
    return (error) => {
        console.error(error);
        if (isAlive(host) && host.molstarPluginContext === plugin) {
            host.setError(error);
        }
    };
}
