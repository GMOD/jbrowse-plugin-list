import React from 'react';
interface LaunchOption {
    key: string;
    title: string;
    description: string;
    onClick: () => void;
}
export default function LaunchOptionsMenu({ anchorEl, onClose, options, }: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
    options: LaunchOption[];
}): React.JSX.Element;
export {};
