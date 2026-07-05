import type { PluginContext } from 'molstar/lib/mol-plugin/context';
import type { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import type { StateObjectSelector } from 'molstar/lib/mol-state';
export interface LoadStructureOptions {
    representationParams?: StructureRepresentationPresetProvider.CommonParams;
}
export declare function applyStructurePreset({ plugin, trajectory, options, }: {
    plugin: PluginContext;
    trajectory: StateObjectSelector;
    options?: LoadStructureOptions;
}): Promise<{
    model: StateObjectSelector<import("molstar/lib/mol-plugin-state/objects").PluginStateObject.Molecule.Model, import("molstar/lib/mol-state").StateTransformer<import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, any>>;
}>;
