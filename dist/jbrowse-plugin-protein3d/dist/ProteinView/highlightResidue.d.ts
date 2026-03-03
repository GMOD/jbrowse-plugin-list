import type { Structure } from 'molstar/lib/mol-model/structure';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
export default function highlightResidue({ structure, selectedResidue, plugin, }: {
    structure: Structure;
    selectedResidue: number;
    plugin: PluginContext;
}): Promise<void>;
