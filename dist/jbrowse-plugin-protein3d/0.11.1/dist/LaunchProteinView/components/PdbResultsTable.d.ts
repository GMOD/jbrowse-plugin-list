import React from 'react';
import type { PdbStructureEntry } from '../services/pdbeBestStructures';
export default function PdbResultsTable({ entries, selectedPdbId, onSelect, }: {
    entries: PdbStructureEntry[];
    selectedPdbId?: string;
    onSelect: (pdbId: string) => void;
}): React.JSX.Element;
