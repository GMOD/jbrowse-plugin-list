import React from 'react';
interface IdentifierSelectorProps {
    recognizedIds: string[];
    geneName?: string;
    selectedId: string;
    onSelectedIdChange: (id: string) => void;
}
export default function IdentifierSelector({ recognizedIds, geneName, selectedId, onSelectedIdChange, }: IdentifierSelectorProps): React.JSX.Element | null;
export {};
