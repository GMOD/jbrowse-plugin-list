import { AlignmentDomainColorThemeProvider } from './alignmentDomainColorTheme';
import { ExonColorThemeProvider } from './exonColorTheme';
import { KyteDoolittleColorThemeProvider } from './kyteDoolittleColorTheme';
import { MappedChainColorThemeProvider } from './mappedChainColorTheme';
import { AlphaMissenseColorThemeProvider, ClinVarColorThemeProvider, GenomeTrackColorThemeProvider, ResidueValuesColorThemeProvider, } from './variantEffectColorTheme';
export function registerColorThemes(plugin) {
    const registry = plugin.representation.structure.themes.colorThemeRegistry;
    registry.add(MappedChainColorThemeProvider);
    registry.add(KyteDoolittleColorThemeProvider);
    registry.add(AlphaMissenseColorThemeProvider);
    registry.add(ClinVarColorThemeProvider);
    registry.add(GenomeTrackColorThemeProvider);
    registry.add(ResidueValuesColorThemeProvider);
    registry.add(AlignmentDomainColorThemeProvider);
    registry.add(ExonColorThemeProvider);
}
