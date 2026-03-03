import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from '@mui/material';
export default function ExternalLink(props) {
    const { children, ...rest } = props;
    return (React.createElement(Link, { ...rest, target: "_blank", rel: "noreferrer" },
        children,
        " ",
        React.createElement(OpenInNewIcon, { fontSize: "small" })));
}
//# sourceMappingURL=ExternalLink.js.map