import React from 'react';
import { TextField } from '@mui/material';
import { observer } from 'mobx-react';
const TextField2 = observer(function TextField2({ children, ...rest }) {
    return (React.createElement("div", null,
        React.createElement(TextField, { ...rest }, children)));
});
export default TextField2;
