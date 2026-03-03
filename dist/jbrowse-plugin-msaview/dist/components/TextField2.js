import React from 'react';
import { TextField } from '@mui/material';
function TextField2({ children, ...rest }) {
    return (React.createElement("div", null,
        React.createElement(TextField, { ...rest }, children)));
}
export default TextField2;
//# sourceMappingURL=TextField2.js.map