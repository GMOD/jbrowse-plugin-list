let cached;
// A failed chunk load is forgotten so the next caller retries it
export default function loadMolstar() {
    cached ??= import('./molstarExports').catch((e) => {
        cached = undefined;
        throw e;
    });
    return cached;
}
