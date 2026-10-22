const tails = new WeakMap();
/**
 * Runs `task` after the earlier tasks of the same `lane` on `plugin` finish,
 * so two syncs that reactions start back to back never edit the state tree at
 * once. A failed task does not stop the next.
 */
export function serialPerPlugin(plugin, lane, task) {
    let lanes = tails.get(plugin);
    if (!lanes) {
        lanes = new Map();
        tails.set(plugin, lanes);
    }
    const previous = lanes.get(lane) ?? Promise.resolve();
    const run = previous.then(task);
    lanes.set(lane, run.catch(() => { }));
    return run;
}
