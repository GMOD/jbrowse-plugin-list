export declare function myfetch(url: string, args?: RequestInit): Promise<Response>;
export declare function jsonfetch<T = unknown>(url: string, args?: RequestInit): Promise<T>;
export declare function timeout(time: number): Promise<unknown>;
