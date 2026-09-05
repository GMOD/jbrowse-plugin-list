import React from 'react';
import { type FoldseekDatabaseId } from '../services/foldseekApi';
export default function FoldseekDatabaseSelector({ selected, onChange, disabled, }: {
    selected: FoldseekDatabaseId[];
    onChange: (databases: FoldseekDatabaseId[]) => void;
    disabled?: boolean;
}): React.JSX.Element;
