export interface MsaViewInitState {
    msaData?: string;
    msaUrl?: string;
    msaIndexedLocation?: {
        uri: string;
    };
    msaName?: string;
    treeData?: string;
    treeUrl?: string;
    querySeqName?: string;
}
export interface MafRegion {
    refName: string;
    start: number;
    end: number;
    assemblyName: string;
}
