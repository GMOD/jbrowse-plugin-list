export declare function hasHoverPosition(hovered: unknown): hovered is {
    hoverPosition: {
        coord: number;
        refName: string;
    };
};
interface AssemblyManagerLike {
    get: (name: string) => {
        getCanonicalRefName: (r: string) => string | undefined;
    } | undefined;
}
export declare function getCanonicalRefName({ assemblyManager, assemblyNames, refName, }: {
    assemblyManager: AssemblyManagerLike;
    assemblyNames: string[] | undefined;
    refName: string;
}): string;
/**
 * Extracts UniProt ID from an AlphaFold URL
 * Examples:
 * - https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v6.cif -> P12345
 * - https://alphafold.ebi.ac.uk/files/msa/AF-P12345-F1-msa_v6.a3m -> P12345
 */
export declare function getUniprotIdFromAlphaFoldUrl(url: string): string | undefined;
export {};
