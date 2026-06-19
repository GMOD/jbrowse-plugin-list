export function hasHoverPosition(hovered) {
    return (!!hovered &&
        typeof hovered === 'object' &&
        'hoverPosition' in hovered &&
        !!hovered.hoverPosition);
}
export function getCanonicalRefName({ assemblyManager, assemblyNames, refName, }) {
    const assemblyName = assemblyNames?.[0];
    if (assemblyName) {
        return (assemblyManager.get(assemblyName)?.getCanonicalRefName(refName) ?? refName);
    }
    return refName;
}
/**
 * Extracts UniProt ID from an AlphaFold URL
 * Examples:
 * - https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v6.cif -> P12345
 * - https://alphafold.ebi.ac.uk/files/msa/AF-P12345-F1-msa_v6.a3m -> P12345
 */
export function getUniprotIdFromAlphaFoldUrl(url) {
    const match = /AF-([A-Z0-9]+)-F\d+/.exec(url);
    return match?.[1];
}
