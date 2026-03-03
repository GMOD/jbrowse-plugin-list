import useSWR from 'swr';
import { addStructureFromData } from '../../ProteinView/addStructureFromData';
import { extractStructureSequences } from '../../ProteinView/extractStructureSequences';
import { withTemporaryMolstarPlugin } from '../../ProteinView/withTemporaryMolstarPlugin';
async function structureFileSequenceFetcher(file, format) {
    return withTemporaryMolstarPlugin(async (plugin) => {
        const { model } = await addStructureFromData({
            data: await file.text(),
            plugin,
            format,
        });
        return extractStructureSequences(model);
    });
}
export default function useLocalStructureFileSequence({ file, }) {
    const { data, error, isLoading } = useSWR(file ? ['local-structure', file.name, file.size, file.lastModified] : null, async () => {
        if (!file) {
            return undefined;
        }
        const ext = file.name.slice(file.name.lastIndexOf('.') + 1) || 'pdb';
        const seq = await structureFileSequenceFetcher(file, (ext === 'cif' ? 'mmcif' : ext));
        if (!seq) {
            throw new Error('no sequences detected in file');
        }
        return seq;
    }, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
    });
    return { error, isLoading, sequences: data };
}
//# sourceMappingURL=useLocalStructureFileSequence.js.map