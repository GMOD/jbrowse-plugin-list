import { KyteDoolittleColorThemeProvider } from './kyteDoolittleColorTheme';
import { MappedChainColorThemeProvider } from './mappedChainColorTheme';
export function registerColorThemes(plugin) {
    const registry = plugin.representation.structure.themes.colorThemeRegistry;
    registry.add(MappedChainColorThemeProvider);
    registry.add(KyteDoolittleColorThemeProvider);
}
