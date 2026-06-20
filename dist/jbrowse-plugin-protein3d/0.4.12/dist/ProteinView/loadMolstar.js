let cached;
export default function loadMolstar() {
    cached ??= import('./molstarExports');
    return cached;
}
