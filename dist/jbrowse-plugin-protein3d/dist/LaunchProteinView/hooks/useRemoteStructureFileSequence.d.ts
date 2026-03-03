export default function useRemoteStructureFileSequence({ url, }: {
    url?: string;
}): {
    error: any;
    isLoading: boolean;
    sequences: string[] | undefined;
};
