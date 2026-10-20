import { extractStructureSequences } from 'p2s_mapper';
import useSWR from 'swr';
import { STATIC_SWR_OPTIONS } from './swrOptions';
import { parseStructureTrajectory } from '../../ProteinView/structurePipeline';
import { withTemporaryMolstarPlugin } from '../../ProteinView/withTemporaryMolstarPlugin';
import { readStructureFile } from '../utils/readStructureFile';
// Only the model is built here, never a representation: the dialog wants the
// sequences, and the format detection is the same one the view applies later.
async function fetchSequences({ file, url }) {
    const data = file ? await readStructureFile(file) : undefined;
    return withTemporaryMolstarPlugin(async (plugin) => {
        const trajectory = await parseStructureTrajectory({ plugin, data, url });
        const model = await plugin.builders.structure.createModel(trajectory);
        return extractStructureSequences(model);
    });
}
// Extract protein sequences from a structure given either a local File or a
// remote URL (exactly one is expected).
export default function useStructureFileSequence({ file, url, }) {
    const key = file
        ? ['structure-file', file.name, file.size, file.lastModified]
        : url
            ? ['structure-url', url]
            : null;
    const { data, error, isLoading } = useSWR(key, async () => {
        const seq = await fetchSequences({ file, url });
        if (!seq?.length) {
            throw new Error('No protein sequence found in this structure');
        }
        return seq;
    }, STATIC_SWR_OPTIONS);
    return { error, isLoading, sequences: data };
}
