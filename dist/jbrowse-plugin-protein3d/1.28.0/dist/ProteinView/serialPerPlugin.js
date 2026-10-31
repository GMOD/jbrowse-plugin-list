const tails = new WeakMap();
/**
 * Runs `task` after every earlier task on `plugin` finishes. Mol* replays a
 * builder's actions onto the tree as it stands at commit, but each sync picks
 * what to delete or update when it starts: two highlight syncs that overlap
 * both delete the same old cells and both add new ones, and a fade built over
 * a surface another edit is replacing fails on a parent that is gone. A failed
 * task does not stop the next, and a task must not await another one, which
 * would wait on itself.
 */
export function serialPerPlugin(plugin, task) {
    const run = (tails.get(plugin) ?? Promise.resolve()).then(task);
    tails.set(plugin, run.catch(() => { }));
    return run;
}
