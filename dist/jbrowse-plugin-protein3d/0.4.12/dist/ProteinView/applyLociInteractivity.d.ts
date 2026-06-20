import type { Structure } from 'molstar/lib/mol-model/structure';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
type InteractivityMode = 'highlight' | 'select' | 'clear';
export declare function applyLociInteractivityMultiple({ structure, residues, plugin, mode, }: {
    structure: Structure;
    residues: number[];
    plugin: PluginContext;
    mode: InteractivityMode;
}): Promise<void>;
export declare function applyLociInteractivity({ structure, startResidue, endResidue, plugin, mode, }: {
    structure: Structure;
    startResidue: number;
    endResidue: number;
    plugin: PluginContext;
    mode: InteractivityMode;
}): Promise<void>;
export declare function applyLociInteractivitySingle({ structure, selectedResidue, plugin, mode, }: {
    structure: Structure;
    selectedResidue: number;
    plugin: PluginContext;
    mode: InteractivityMode;
}): Promise<void>;
export {};
