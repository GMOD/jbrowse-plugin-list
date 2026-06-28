import { openDB } from 'idb';
const DB_NAME = 'jbrowse-msaview-domain-cache';
const STORE_NAME = 'domains';
const DB_VERSION = 1;
async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'accession' });
            }
        },
    });
}
export async function getCachedDomains(accessions) {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const results = await Promise.all(accessions.map(accession => tx.store.get(accession)));
    await tx.done;
    return results;
}
export async function saveDomains(entries) {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const entry of entries) {
        await tx.store.put(entry);
    }
    await tx.done;
}
