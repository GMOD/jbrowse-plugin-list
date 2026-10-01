import { jsonfetch, textfetch, timeout } from './fetch';
// NCBI asks that programmatic E-utilities requests identify themselves with a
// tool name and contact email so they can reach out before throttling, rather
// than silently rate-limiting. https://www.ncbi.nlm.nih.gov/books/NBK25497/
const NCBI_TOOL = 'jbrowse-plugin-msaview';
const NCBI_EMAIL = 'colin.diesh@gmail.com';
const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
function identified(params) {
    return new URLSearchParams({ ...params, tool: NCBI_TOOL, email: NCBI_EMAIL });
}
export function eutilsUrl(endpoint, params) {
    return `${EUTILS}/${endpoint}.fcgi?${identified(params).toString()}`;
}
export function efetchUrl(params) {
    return eutilsUrl('efetch', params);
}
/**
 * The same request as a POST body. An `id` list of a few hundred accessions
 * exceeds what a URL carries — 865 of them is ~13KB — and NCBI documents POST
 * as the route above about 200 ids. eutils sends `ACAO: *` on both verbs.
 */
export function efetchPost(params) {
    return [
        `${EUTILS}/efetch.fcgi`,
        { method: 'POST', body: identified(params) },
    ];
}
/**
 * eutils allows 3 requests a second without an API key and answers a burst
 * over that with no `Access-Control-Allow-Origin`, which the browser reports as
 * a CORS failure. Every eutils request takes the next start slot, so however
 * many callers ask at once the requests go out under the limit.
 */
export const EUTILS_SPACING_MS = 350;
let nextSlot = 0;
async function eutilsSlot(signal) {
    const now = Date.now();
    const start = Math.max(now, nextSlot);
    nextSlot = start + EUTILS_SPACING_MS;
    if (start > now) {
        try {
            await timeout(start - now, signal ?? undefined);
        }
        catch (e) {
            if (nextSlot === start + EUTILS_SPACING_MS) {
                nextSlot = start;
            }
            throw e;
        }
    }
}
export async function eutilsText(url, init) {
    await eutilsSlot(init?.signal);
    return textfetch(url, init);
}
export async function eutilsJson(url, init) {
    await eutilsSlot(init?.signal);
    return jsonfetch(url, init);
}
const namedEntities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    quot: '"',
};
/** Text lifted out of eutils XML still carries its escapes: `5&apos;-3&apos;`. */
export function decodeXmlEntities(text) {
    return text.replaceAll(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, name) => name.startsWith('#x') || name.startsWith('#X')
        ? String.fromCodePoint(Number.parseInt(name.slice(2), 16))
        : name.startsWith('#')
            ? String.fromCodePoint(Number(name.slice(1)))
            : (namedEntities[name] ?? entity));
}
