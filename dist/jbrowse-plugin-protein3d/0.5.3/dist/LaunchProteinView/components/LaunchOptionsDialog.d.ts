import React from 'react';
interface LaunchOption {
    key: string;
    title: string;
    description: string;
    onClick: () => void;
}
export default function LaunchOptionsDialog({ open, onClose, options, }: {
    open: boolean;
    onClose: () => void;
    options: LaunchOption[];
}): React.JSX.Element;
export {};
