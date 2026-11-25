import React from 'react';
interface BlastSettings {
    ebiEmail: string;
}
declare const BlastSettingsDialog: ({ handleClose, ebiEmail, }: {
    handleClose: (arg?: BlastSettings) => void;
    ebiEmail: string;
}) => React.JSX.Element;
export default BlastSettingsDialog;
