import React from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
export default function NCBIBlastMethodSelector({ lookupMethod, setLookupMethod, }) {
    return (React.createElement(FormControl, { component: "fieldset" },
        React.createElement(RadioGroup, { row: true, value: lookupMethod, onChange: event => {
                setLookupMethod(event.target.value);
            } },
            React.createElement(FormControlLabel, { value: "automatic", control: React.createElement(Radio, null), label: "Automatic" }),
            React.createElement(FormControlLabel, { value: "rid", control: React.createElement(Radio, null), label: "Load from RID" }),
            React.createElement(FormControlLabel, { value: "manual", control: React.createElement(Radio, null), label: "Manual" }))));
}
//# sourceMappingURL=NCBIBlastMethodSelector.js.map