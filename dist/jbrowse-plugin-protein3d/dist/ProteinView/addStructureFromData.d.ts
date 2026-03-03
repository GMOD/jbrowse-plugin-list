import type { PluginContext } from 'molstar/lib/mol-plugin/context';
import type { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
export interface LoadStructureOptions {
    representationParams?: StructureRepresentationPresetProvider.CommonParams;
}
export declare function addStructureFromData({ data, format, options, plugin, }: {
    data: string;
    format?: BuiltInTrajectoryFormat;
    options?: LoadStructureOptions & {
        label?: string;
        dataLabel?: string;
    };
    plugin: PluginContext;
}): Promise<{
    model: import("molstar/lib/mol-state").StateObjectSelector<import("molstar/lib/mol-plugin-state/objects").PluginStateObject.Molecule.Model, import("molstar/lib/mol-state").StateTransformer<import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, any>>;
}>;
