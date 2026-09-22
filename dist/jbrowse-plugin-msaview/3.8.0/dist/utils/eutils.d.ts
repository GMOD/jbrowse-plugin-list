export declare const NCBI_TOOL = "jbrowse-plugin-msaview";
export declare const NCBI_EMAIL = "colin.diesh@gmail.com";
type Endpoint = 'efetch' | 'esearch' | 'esummary';
export declare function eutilsUrl(endpoint: Endpoint, params: Record<string, string>): string;
export declare function efetchUrl(params: Record<string, string>): string;
/**
 * The same request as a POST body. An `id` list of a few hundred accessions
 * exceeds what a URL carries — 865 of them is ~13KB — and NCBI documents POST
 * as the route above about 200 ids. eutils sends `ACAO: *` on both verbs.
 */
export declare function efetchPost(params: Record<string, string>): readonly ["https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi", {
    readonly method: "POST";
    readonly body: URLSearchParams;
}];
/**
 * eutils allows 3 requests a second without an API key and answers a burst
 * over that with no `Access-Control-Allow-Origin`, which the browser reports as
 * a CORS failure. Every eutils request takes the next start slot, so however
 * many callers ask at once the requests go out under the limit.
 */
export declare const EUTILS_SPACING_MS = 350;
export declare function eutilsText(url: string, init?: RequestInit): Promise<string>;
export declare function eutilsJson<T>(url: string, init?: RequestInit): Promise<T>;
/** Text lifted out of eutils XML still carries its escapes: `5&apos;-3&apos;`. */
export declare function decodeXmlEntities(text: string): string;
export {};
