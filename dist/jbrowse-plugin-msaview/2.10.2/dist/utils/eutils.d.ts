export declare const NCBI_TOOL = "jbrowse-plugin-msaview";
export declare const NCBI_EMAIL = "colin.diesh@gmail.com";
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
