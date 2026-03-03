import { Feature } from '@jbrowse/core/util';
export declare function checkHovered(hovered: unknown): hovered is {
    hoverFeature: Feature;
    hoverPosition: {
        coord: number;
        refName: string;
    };
};
/**
 * Extracts UniProt ID from an AlphaFold URL
 * Examples:
 * - https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v6.cif -> P12345
 * - https://alphafold.ebi.ac.uk/files/msa/AF-P12345-F1-msa_v6.a3m -> P12345
 */
export declare function getUniprotIdFromAlphaFoldUrl(url: string): string | undefined;
