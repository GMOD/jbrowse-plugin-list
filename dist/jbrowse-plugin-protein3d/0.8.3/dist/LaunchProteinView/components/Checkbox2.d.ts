import React from 'react';
export default function Checkbox2({ checked, disabled, label, onChange, }: {
    checked: boolean;
    disabled?: boolean;
    label: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}): React.JSX.Element;
