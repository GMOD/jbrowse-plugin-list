import type { LoadStructureOptions } from './structurePipeline';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
export type { LoadStructureOptions };
export declare function addStructureFromURL({ url, format, isBinary, options, plugin, }: {
    url: string;
    format?: BuiltInTrajectoryFormat;
    isBinary?: boolean;
    options?: LoadStructureOptions & {
        label?: string;
    };
    plugin: PluginContext;
}): Promise<{
    model: import("molstar/lib/mol-state").StateObjectSelector<import("molstar/lib/mol-plugin-state/objects").PluginStateObject.Molecule.Model, import("molstar/lib/mol-state").StateTransformer<import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, import("molstar/lib/mol-state").StateObject<any, import("molstar/lib/mol-state").StateObject.Type<any>>, any>>;
}>;
