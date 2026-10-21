export function isLaunchingGenomeView(view) {
    return ('id' in view &&
        typeof view.id === 'string' &&
        'assemblyNames' in view &&
        Array.isArray(view.assemblyNames) &&
        view.assemblyNames.every(name => typeof name === 'string'));
}
