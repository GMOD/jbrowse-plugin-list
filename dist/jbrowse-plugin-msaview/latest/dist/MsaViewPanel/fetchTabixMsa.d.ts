export declare function fetchTabixMsa({ location, indexLocation, msaId, refName, start, end, }: {
    location: {
        uri: string;
    };
    indexLocation?: {
        uri: string;
    };
    msaId: string;
    refName: string;
    start: number;
    end: number;
}): Promise<string | undefined>;
