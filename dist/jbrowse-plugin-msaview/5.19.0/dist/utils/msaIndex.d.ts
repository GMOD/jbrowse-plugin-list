import { BgzfFilehandle } from '@gmod/bgzf-filehandle';
export interface MsaIndexEntry {
    name: string;
    offset: number;
    length: number;
}
export declare function parseMsaIndex(text: string): {
    name: string;
    offset: number;
    length: number;
}[];
export declare function readMsaBlock({ entry, ...filehandles }: ConstructorParameters<typeof BgzfFilehandle>[0] & {
    entry: MsaIndexEntry;
}): Promise<string>;
