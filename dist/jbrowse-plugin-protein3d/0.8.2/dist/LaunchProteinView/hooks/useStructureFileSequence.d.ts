export default function useStructureFileSequence({ file, url, }: {
    file?: File;
    url?: string;
}): {
    error: any;
    isLoading: boolean;
    isValidating: boolean;
    sequences: string[] | undefined;
};
