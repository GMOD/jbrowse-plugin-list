export declare function parseLineByLine<T>(buffer: Uint8Array, cb: (line: string) => T | undefined): T[];
export declare function countNonGapBases(seq: string): number;
