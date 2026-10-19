import { bestEffort, createDbOpener } from './idb';
const DB_NAME = 'jbrowse-msaview-search-cache';
const STORE_NAME = 'searches';
export const MAX_CACHED_SEARCHES = 20;
export const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const getDB = createDbOpener(DB_NAME, 1, db => {
    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
});
export function searchKey({ searchProgram, database, maxHits, querySeqName, query, }) {
    return [searchProgram, database, maxHits ?? '', querySeqName, query].join(':');
}
export function getCachedSearch(id) {
    return bestEffort('search cache read', async () => {
        const entry = await (await getDB()).get(STORE_NAME, id);
        return entry && Date.now() - entry.timestamp < MAX_AGE_MS
            ? entry
            : undefined;
    }, undefined);
}
export function saveSearch(entry) {
    return bestEffort('search cache write', async () => {
        const db = await getDB();
        await db.put(STORE_NAME, { ...entry, timestamp: Date.now() });
        if ((await db.count(STORE_NAME)) > MAX_CACHED_SEARCHES) {
            const all = await db.getAll(STORE_NAME);
            const doomed = all
                .toSorted((a, b) => a.timestamp - b.timestamp)
                .slice(0, all.length - MAX_CACHED_SEARCHES);
            const tx = db.transaction(STORE_NAME, 'readwrite');
            await Promise.all([...doomed.map(e => tx.store.delete(e.id)), tx.done]);
        }
    }, undefined);
}
