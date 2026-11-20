export interface MsaViewInitState {
    msaUrl?: string;
    querySeqName?: string;
    msaIndexedLocation?: {
        uri: string;
    };
    msaName?: string;
}
export interface MafRegion {
    refName: string;
    start: number;
    end: number;
    assemblyName: string;
}
