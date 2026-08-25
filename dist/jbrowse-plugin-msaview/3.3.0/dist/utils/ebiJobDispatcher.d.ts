/**
 * EBI's Job Dispatcher REST services (clustalo, muscle, ncbiblast, ...) all
 * speak the same run/status/result protocol, so the transport lives here and
 * each tool only supplies its own parameters and result types.
 *
 * Unlike NCBI's Blast.cgi these endpoints send `Access-Control-Allow-Origin: *`,
 * which is why the BLAST backend moved here — see docs/blast.md.
 */
export declare const EBI_BASE = "https://www.ebi.ac.uk/Tools/services/rest";
/**
 * EBI asks for a contact address on every submission so they can reach whoever
 * is generating the load. A deployment that sends real volume should point this
 * at its own maintainer via the BLAST settings dialog — otherwise every
 * msaview job in the world is attributed to one person.
 */
export declare const EBI_EMAIL_STORAGE_KEY = "msa-ebiContactEmail";
export declare const DEFAULT_EBI_EMAIL = "colin.diesh@gmail.com";
export declare function getEbiEmail(): string;
export declare function submitEbiJob({ tool, params, }: {
    tool: string;
    params: Record<string, string>;
}): Promise<string>;
export declare function waitForEbiJob({ tool, jobId, intervalSeconds, onCountdown, }: {
    tool: string;
    jobId: string;
    intervalSeconds?: number;
    onCountdown: (secondsRemaining: number) => void;
}): Promise<void>;
export declare function fetchEbiResult({ tool, jobId, type, }: {
    tool: string;
    jobId: string;
    type: string;
}): Promise<string>;
