import type { Structure } from 'molstar/lib/mol-model/structure';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
import type { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
import type { StateObjectSelector } from 'molstar/lib/mol-state';
export interface LoadStructureOptions {
    representationParams?: StructureRepresentationPresetProvider.CommonParams;
}
/** Download or ingest a structure and parse it into a trajectory, with the
 * format sniffed from the content or the url unless the caller says otherwise.
 * Needs no renderer, so a headless plugin can run it to read sequences. */
export declare function parseStructureTrajectory({ plugin, data, url, format, dataLabel, }: {
    plugin: PluginContext;
    data?: string;
    url?: string;
    format?: BuiltInTrajectoryFormat;
    dataLabel?: string;
}): Promise<StateObjectSelector<import("molstar/lib/mol-plugin-state/objects").PluginStateObject.Molecule.Trajectory, import("molstar/lib/mol-state").StateTransformer<import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, any>>>;
export declare function applyStructurePreset({ plugin, trajectory, options, }: {
    plugin: PluginContext;
    trajectory: StateObjectSelector;
    options?: LoadStructureOptions;
}): Promise<{
    model: StateObjectSelector<import("molstar/lib/mol-plugin-state/objects").PluginStateObject.Molecule.Model, import("molstar/lib/mol-state").StateTransformer<import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, any>>;
    structure: Structure | undefined;
}>;
