import { ungzip } from 'pako-esm2';
export async function handleFetch(url, args) {
    const response = await fetch(url, args);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${url} ${await response.text()}`);
    }
    return response;
}
export async function textfetch(url, args) {
    const response = await handleFetch(url, args);
    return response.text();
}
export async function jsonfetch(url, args) {
    const response = await handleFetch(url, args);
    return response.json();
}
export function timeout(time) {
    return new Promise(res => setTimeout(res, time));
}
export async function fetchWithLocalStorageCache(key, fetchFn) {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
        try {
            return JSON.parse(cachedData);
        }
        catch (error) {
            console.error(`Error parsing cached data for ${key}:`, error);
            // Continue to fetch fresh data if parsing fails
            localStorage.removeItem(key);
        }
    }
    const data = await fetchFn();
    localStorage.setItem(key, JSON.stringify(data));
    return data;
}
export async function unzipfetch(url, arg) {
    const res = await handleFetch(url, arg);
    return ungzip(await res.arrayBuffer(), { to: 'string' });
}
//# sourceMappingURL=fetch.js.map