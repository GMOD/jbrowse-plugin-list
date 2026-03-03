export default function useLocalStructureFileSequence({ file, }: {
    file?: File;
}): {
    error: any;
    isLoading: boolean;
    sequences: string[] | undefined;
};
