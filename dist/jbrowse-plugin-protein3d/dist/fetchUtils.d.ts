export declare function myfetch(url: string, args?: RequestInit): Promise<Response>;
export declare function textfetch(url: string, args?: RequestInit): Promise<string>;
export declare function jsonfetch(url: string, args?: RequestInit): Promise<any>;
export declare function abfetch(url: string): Promise<ArrayBuffer>;
export declare function timeout(time: number): Promise<unknown>;
