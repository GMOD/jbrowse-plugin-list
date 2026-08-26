import React from 'react';
import { MenuItem } from '@mui/material';
import TextField2 from '../../../components/TextField2';
import { msaAlgorithms } from './consts';
export default function MsaAlgorithmSelect({ value, onChange, className, }) {
    return (React.createElement(TextField2, { variant: "outlined", label: "MSA Algorithm", className: className, select: true, value: value, onChange: event => {
            onChange(event.target.value);
        } }, msaAlgorithms.map(val => (React.createElement(MenuItem, { value: val, key: val }, val)))));
}
