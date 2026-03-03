import React from 'react';
import type { UniProtEntry } from '../services/lookupMethods';
interface UniProtResultsTableProps {
    entries: UniProtEntry[];
    selectedAccession?: string;
    onSelect: (accession: string) => void;
}
export default function UniProtResultsTable({ entries, selectedAccession, onSelect, }: UniProtResultsTableProps): React.JSX.Element | null;
export {};
