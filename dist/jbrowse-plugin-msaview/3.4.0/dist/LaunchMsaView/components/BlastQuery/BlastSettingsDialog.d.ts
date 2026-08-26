import React from 'react';
export interface BlastSettings {
    ebiEmail: string;
}
export default function BlastSettingsDialog({ handleClose, ebiEmail, }: {
    handleClose: (arg?: BlastSettings) => void;
    ebiEmail: string;
}): React.JSX.Element;
