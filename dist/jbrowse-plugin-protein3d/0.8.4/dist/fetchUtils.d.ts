export declare function myfetch(url: string, args?: RequestInit): Promise<Response>;
export declare function jsonfetch<T = unknown>(url: string, args?: RequestInit): Promise<T>;
/**
 * An AbortSignal's reason as a real Error. `signal.reason` is `any` — usually a
 * DOMException, but a caller can abort with anything at all — and throwing a
 * non-Error loses the stack and breaks `instanceof Error` checks in the UI's
 * error rendering. Normalize at every throw site.
 */
export declare function abortError(signal: AbortSignal): Error;
export declare function timeout(time: number, signal?: AbortSignal): Promise<void>;
