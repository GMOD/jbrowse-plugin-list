import type { LoadStructureOptions } from './structurePipeline';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
/** Format defaults to what the content itself says. It used to default to
 * 'pdb', so an mmCIF opened via the file dialog previewed correctly (that path
 * detected the format) and then loaded into the view as a zero-entity model. */
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
    structure: import("molstar/lib/mol-model/structure").Structure | undefined;
}>;
export { type LoadStructureOptions } from './structurePipeline';
