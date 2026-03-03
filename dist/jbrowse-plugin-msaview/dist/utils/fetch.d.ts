export declare function handleFetch(url: string, args?: RequestInit): Promise<Response>;
export declare function textfetch(url: string, args?: RequestInit): Promise<string>;
export declare function jsonfetch<T>(url: string, args?: RequestInit): Promise<T>;
export declare function timeout(time: number): Promise<unknown>;
export declare function fetchWithLocalStorageCache<T>(key: string, fetchFn: () => Promise<T>): Promise<T>;
export declare function unzipfetch(url: string, arg?: RequestInit): Promise<any>;
