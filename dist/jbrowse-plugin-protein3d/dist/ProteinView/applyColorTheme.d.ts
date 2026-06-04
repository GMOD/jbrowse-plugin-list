import type { PluginContext } from 'molstar/lib/mol-plugin/context';
/**
 * Color schemes offered in the protein view menu. The `value`s are molstar
 * color-theme names: all are built-in except `plddt-confidence`, which is
 * registered by the MAQualityAssessment behavior (see useProteinView) and reads
 * the per-residue pLDDT scores parsed from AlphaFold mmCIF files.
 */
export declare const COLOR_SCHEMES: readonly [{
    readonly value: "default";
    readonly label: "Default (element/chain)";
}, {
    readonly value: "plddt-confidence";
    readonly label: "pLDDT confidence (AlphaFold)";
}, {
    readonly value: "chain-id";
    readonly label: "Chain";
}, {
    readonly value: "secondary-structure";
    readonly label: "Secondary structure";
}, {
    readonly value: "hydrophobicity";
    readonly label: "Hydrophobicity (Kyte-Doolittle)";
}, {
    readonly value: "residue-name";
    readonly label: "Residue type";
}, {
    readonly value: "uncertainty";
    readonly label: "B-factor / uncertainty";
}, {
    readonly value: "molecule-type";
    readonly label: "Molecule type";
}];
export type ProteinColorScheme = (typeof COLOR_SCHEMES)[number]['value'];
export declare const COLOR_SCHEME_VALUES: ("uncertainty" | "hydrophobicity" | "chain-id" | "molecule-type" | "residue-name" | "secondary-structure" | "default" | "plddt-confidence")[];
export declare function applyColorTheme({ plugin, colorScheme, }: {
    plugin: PluginContext;
    colorScheme: ProteinColorScheme;
}): Promise<void>;
