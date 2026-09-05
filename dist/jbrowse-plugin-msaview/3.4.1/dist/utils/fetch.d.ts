export declare function handleFetch(url: string, args?: RequestInit): Promise<Response>;
export declare function textfetch(url: string, args?: RequestInit): Promise<string>;
export declare function jsonfetch<T>(url: string, args?: RequestInit): Promise<T>;
export declare function timeout(time: number, signal?: AbortSignal): Promise<void>;
/**
 * A cancelled launch has to be told apart from a failed one: it must not render
 * the "failed" panel, and it must not touch a model that may already be gone.
 * `fetch` and the sleep above both reject with a DOMException named AbortError,
 * which subclasses Error.
 */
export declare function isAbortError(e: unknown): boolean;
