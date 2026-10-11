import { KyteDoolittleColorThemeProvider } from './kyteDoolittleColorTheme';
import { MappedChainColorThemeProvider } from './mappedChainColorTheme';
import { AlphaMissenseColorThemeProvider, ClinVarColorThemeProvider, } from './variantEffectColorTheme';
export function registerColorThemes(plugin) {
    const registry = plugin.representation.structure.themes.colorThemeRegistry;
    registry.add(MappedChainColorThemeProvider);
    registry.add(KyteDoolittleColorThemeProvider);
    registry.add(AlphaMissenseColorThemeProvider);
    registry.add(ClinVarColorThemeProvider);
}
