export default function getSearchDescription({ selectedQueryId, recognizedIds, geneName, joinWord, }: {
    selectedQueryId: string;
    recognizedIds: string[];
    geneName?: string;
    joinWord?: 'and' | 'or';
}): string;
