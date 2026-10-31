import React from 'react';
export interface BlastSettings {
    ebiEmail: string;
}
declare const BlastSettingsDialog: ({ handleClose, ebiEmail, }: {
    handleClose: (arg?: BlastSettings) => void;
    ebiEmail: string;
}) => React.JSX.Element;
export default BlastSettingsDialog;
