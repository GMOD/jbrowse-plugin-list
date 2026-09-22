let cached;
// A failed chunk load is forgotten so the next caller retries it, as the UMD
// build's replacement for this file (see esbuild.mjs) already does
export default function loadMolstar() {
    cached ??= import('./molstarExports').catch((e) => {
        cached = undefined;
        throw e;
    });
    return cached;
}
