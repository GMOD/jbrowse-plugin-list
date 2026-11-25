/**
 * EBI asks for a contact address on every submission so they can reach whoever
 * is generating the load. The default is the project's mailbox; a deployment
 * that sends real volume should name its own maintainer in the BLAST settings
 * dialog.
 */
export declare const EBI_EMAIL_STORAGE_KEY = "msa-ebiContactEmail";
export declare const DEFAULT_EBI_EMAIL = "jbrowse2@berkeley.edu";
export declare function getEbiEmail(): string;
/**
 * A status check that could not reach EBI at all says nothing about the job, so
 * it is not a reason to abandon one. A job the server has accepted keeps running
 * whatever happens to the poller's connection, and EBI's cluster has answered
 * status checks with a 502 for ten minutes on jobs that then finished (see
 * agent-docs/blast-design.md).
 *
 * So the poll gives up only once checks have failed without a break for this
 * long: an endpoint that has genuinely gone away must not be polled forever.
 */
export declare const STATUS_FAILURE_BUDGET_MS: number;
export declare function waitForEbiJob({ tool, jobId, intervalSeconds, onCountdown, signal, }: {
    tool: string;
    jobId: string;
    intervalSeconds?: number;
    onCountdown: (secondsRemaining: number) => void;
    signal?: AbortSignal;
}): Promise<void>;
export declare function runEbiJob({ tool, label, params, onProgress, onRid, signal, }: {
    tool: string;
    label: string;
    params: Record<string, string>;
    onProgress: (arg: string) => void;
    onRid?: (jobId: string) => void;
    signal?: AbortSignal;
}): Promise<{
    jobId: string;
    result: (type: string, { retry }?: {
        retry?: boolean | undefined;
    }) => Promise<string>;
}>;
