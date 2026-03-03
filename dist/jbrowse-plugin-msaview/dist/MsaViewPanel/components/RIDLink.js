import React from 'react';
import { Typography } from '@mui/material';
import ExternalLink from '../../components/ExternalLink';
function RIDLink({ baseUrl, rid }) {
    return (React.createElement(Typography, null,
        "RID ",
        rid,
        " (",
        React.createElement(ExternalLink, { href: `${baseUrl}?CMD=Get&RID=${rid}` }, "see status"),
        ")"));
}
export default RIDLink;
//# sourceMappingURL=RIDLink.js.map