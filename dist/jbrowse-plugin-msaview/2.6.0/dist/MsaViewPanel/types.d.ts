export interface MsaViewInitState {
    msaData?: string;
    msaUrl?: string;
    msaTabixLocation?: {
        uri: string;
    };
    msaIndexLocation?: {
        uri: string;
    };
    msaId?: string;
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
