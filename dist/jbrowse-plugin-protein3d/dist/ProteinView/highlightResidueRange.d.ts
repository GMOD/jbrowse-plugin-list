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
