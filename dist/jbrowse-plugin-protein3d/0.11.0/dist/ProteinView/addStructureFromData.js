import { applyStructurePreset, parseStructureTrajectory, } from './structurePipeline';
/** Format defaults to what the content itself says. It used to default to
 * 'pdb', so an mmCIF opened via the file dialog previewed correctly (that path
 * detected the format) and then loaded into the view as a zero-entity model. */
export async function addStructureFromData({ data, format, options, plugin, }) {
    const trajectory = await parseStructureTrajectory({
        plugin,
        data,
        format,
        dataLabel: options?.dataLabel,
    });
    return applyStructurePreset({ plugin, trajectory, options });
}
