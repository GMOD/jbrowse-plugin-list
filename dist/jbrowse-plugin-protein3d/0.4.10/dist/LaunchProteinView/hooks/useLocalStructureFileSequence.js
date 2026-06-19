import useSWR from 'swr';
import { addStructureFromData } from '../../ProteinView/addStructureFromData';
import { extractStructureSequences } from '../../ProteinView/extractStructureSequences';
import { withTemporaryMolstarPlugin } from '../../ProteinView/withTemporaryMolstarPlugin';
function detectStructureFormat(fileName) {
    const dot = fileName.lastIndexOf('.');
    const ext = dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : '';
    if (ext === 'cif' || ext === 'mmcif' || ext === 'bcif') {
        return 'mmcif';
    }
    return 'pdb';
}
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
        const seq = await structureFileSequenceFetcher(file, detectStructureFormat(file.name));
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
