import React from 'react';
import { TextField } from '@mui/material';
/**
 * Component to select between different AlphaFold structure entries
 */
export default function AlphaFoldEntrySelector({ predictions, selectedEntryIndex, onSelectionChange, }) {
    // Only show if there are multiple predictions
    if (predictions.length <= 1) {
        return null;
    }
    return (React.createElement("div", null,
        React.createElement(TextField, { select: true, label: "AlphaFold Structure Entry", value: selectedEntryIndex, helperText: "Select an AlphaFold structure entry (isoform)", onChange: e => {
                onSelectionChange(Number(e.target.value));
            } }, predictions
            .sort((a, b) => a.modelEntityId.length - b.modelEntityId.length)
            .map((prediction, index) => (React.createElement("option", { key: index, value: index }, prediction.modelEntityId))))));
}
//# sourceMappingURL=AlphaFoldEntrySelector.js.map