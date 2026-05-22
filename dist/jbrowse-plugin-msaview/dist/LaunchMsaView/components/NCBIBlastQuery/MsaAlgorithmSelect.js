import React from 'react';
import { MenuItem } from '@mui/material';
import { msaAlgorithms } from './consts';
import TextField2 from '../../../components/TextField2';
export default function MsaAlgorithmSelect({ value, onChange, className, }) {
    return (React.createElement(TextField2, { variant: "outlined", label: "MSA Algorithm", className: className, select: true, value: value, onChange: event => {
            onChange(event.target.value);
        } }, msaAlgorithms.map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))));
}
//# sourceMappingURL=MsaAlgorithmSelect.js.map