import type { Structure } from 'molstar/lib/mol-model/structure';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
export default function highlightResidueRange({ structure, startResidue, endResidue, plugin, }: {
    structure: Structure;
    startResidue: number;
    endResidue: number;
    plugin: PluginContext;
}): Promise<void>;
export declare function selectResidueRange({ structure, startResidue, endResidue, plugin, }: {
    structure: Structure;
    startResidue: number;
    endResidue: number;
    plugin: PluginContext;
}): Promise<void>;
export declare function hexToMolstarColor(hex: string): number;
export declare function overpaintResidueRange({ startResidue, endResidue, plugin, color, }: {
    startResidue: number;
    endResidue: number;
    plugin: PluginContext;
    color: string;
}): Promise<void>;
export declare function clearOverpaint(plugin: PluginContext): Promise<void>;
