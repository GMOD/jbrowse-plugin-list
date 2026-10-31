import React from 'react';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { ALIGNMENT_ALGORITHM_LABELS, DEFAULT_ALIGNMENT_ALGORITHM, } from 'p2s_mapper';
const SequenceMismatchNotice = observer(function SequenceMismatchNotice() {
    return (React.createElement(Typography, { variant: "body2", sx: { mr: 2 } },
        "Transcript and structure sequences differ, will run",
        ' ',
        ALIGNMENT_ALGORITHM_LABELS[DEFAULT_ALIGNMENT_ALGORITHM],
        " alignment"));
});
export default SequenceMismatchNotice;
