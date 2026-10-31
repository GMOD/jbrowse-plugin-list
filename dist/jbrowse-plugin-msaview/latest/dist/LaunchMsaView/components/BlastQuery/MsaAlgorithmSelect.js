import React from 'react';
import { MenuItem } from '@mui/material';
import { observer } from 'mobx-react';
import TextField2 from '../../../components/TextField2';
import { msaAlgorithmLabels, msaAlgorithms } from './consts';
const MsaAlgorithmSelect = observer(function MsaAlgorithmSelect({ value, onChange, className, }) {
    return (React.createElement(TextField2, { variant: "outlined", label: "MSA Algorithm", className: className, select: true, value: value, helperText: value === 'browser'
            ? 'no EBI job; rows aligned to the query'
            : undefined, onChange: event => {
            onChange(event.target.value);
        } }, msaAlgorithms.map(val => (React.createElement(MenuItem, { value: val, key: val }, msaAlgorithmLabels[val])))));
});
export default MsaAlgorithmSelect;
