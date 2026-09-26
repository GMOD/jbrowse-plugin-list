export const literalNaming = {
    canonicalRefName: r => r,
    isAssembly: () => true,
};
/**
 * `initialized` gates getCanonicalRefName, which throws on every host until
 * the aliases load; until then the raw name is the whole answer. An unknown
 * assembly accepts no named hover, since nothing says which genome it meant.
 */
export function assemblyNaming(assemblyManager, assemblyName) {
    const assembly = assemblyName ? assemblyManager.get(assemblyName) : undefined;
    return {
        canonicalRefName: r => (assembly?.initialized ? assembly.getCanonicalRefName(r) : undefined) ??
            r,
        isAssembly: name => name === undefined ||
            (!!assembly && assemblyManager.get(name)?.name === assembly.name),
    };
}
export function checkHovered(hovered) {
    return (!!hovered &&
        typeof hovered === 'object' &&
        'hoverPosition' in hovered &&
        !!hovered.hoverPosition &&
        typeof hovered.hoverPosition === 'object' &&
        'coord' in hovered.hoverPosition &&
        'refName' in hovered.hoverPosition);
}
/**
 * A genome hover, resolved to a 0-based transcript (protein) position.
 *
 * `session.hovered` is global — it is set by whichever LinearGenomeView the
 * cursor was last over, on any assembly — and its `coord` is 1-based display
 * (see pxToBp), hence `coord - 1`. `g2p` is keyed by 0-based genome position on
 * the transcript's *own* refName, so the refName gate is load-bearing: without
 * it the same numeric coordinate on an unrelated chromosome matches a key and
 * reports a residue for a different locus.
 *
 * The two sides name the chromosome independently, so the gate has to compare
 * canonical names. The view reports the assembly's own (`1` on jbrowse.org's
 * hg38), while the mapping carries the feature's, straight out of the file
 * (`chr1` in GENCODE) — equal strings only by luck of which pair of files a
 * config happens to use. Compared raw, every hover on such a config silently
 * missed, which is how it shipped: nothing throws, the residue just never
 * lights up. The same coordinate on another assembly's same-named chromosome
 * is a different locus, so the hover's assembly is gated too.
 */
export function genomeHoverToTranscriptPos(hovered, mapping, naming = literalNaming) {
    if (!mapping || !checkHovered(hovered)) {
        return undefined;
    }
    const { coord, refName, assemblyName } = hovered.hoverPosition;
    const { canonicalRefName, isAssembly } = naming;
    return isAssembly(assemblyName) &&
        canonicalRefName(refName) === canonicalRefName(mapping.refName)
        ? mapping.g2p[coord - 1]
        : undefined;
}
/** What a thrown value says, for a status line. A plain object stringifies to
 * "[object Object]", which tells the reader nothing, so it is spelled out. */
export function errorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return typeof error === 'string' ? error : JSON.stringify(error);
}
