import { createDbOpener } from './idb';
const DB_NAME = 'jbrowse-msaview-blast-cache';
const STORE_NAME = 'blast-results';
const DB_VERSION = 2;
const getDB = createDbOpener(DB_NAME, DB_VERSION, (db, oldVersion) => {
    if (oldVersion < 2 && db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
    }
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
});
function createCacheKey(proteinSequence, blastDatabase, blastProgram, msaAlgorithm, transcriptId) {
    const idPart = transcriptId ? `:${transcriptId}` : '';
    // msaAlgorithm is part of the key because the stored msa/tree are produced by
    // it — without it, re-running the same query under a different algorithm
    // overwrites the earlier result and drops it from the history list
    return `${blastDatabase}:${blastProgram}:${msaAlgorithm}${idPart}:${proteinSequence}`;
}
export async function saveBlastResult({ proteinSequence, blastDatabase, blastProgram, msaAlgorithm, msa, tree, treeMetadata, rid, geneId, transcriptId, transcriptName, geneName, }) {
    const db = await getDB();
    const id = createCacheKey(proteinSequence, blastDatabase, blastProgram, msaAlgorithm, transcriptId);
    const entry = {
        id,
        proteinSequence,
        blastDatabase,
        blastProgram,
        msaAlgorithm,
        msa,
        tree,
        treeMetadata,
        rid,
        timestamp: Date.now(),
        geneId,
        transcriptId,
        transcriptName,
        geneName,
    };
    await db.put(STORE_NAME, entry);
    return entry;
}
export async function getAllCachedResults() {
    const db = await getDB();
    const results = await db.getAll(STORE_NAME);
    return results.toSorted((a, b) => b.timestamp - a.timestamp);
}
export async function deleteCachedResult(id) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
}
