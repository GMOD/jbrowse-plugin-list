import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { HubFile } from '@gmod/ucsc-hub';
import { SanitizedHTML } from '@jbrowse/core/ui';
import { openLocation } from '@jbrowse/core/util/io';
import EmailIcon from '@mui/icons-material/Email';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Card, CardActions, CardContent, CardHeader, IconButton, LinearProgress, Typography, } from '@mui/material';
function HubDetails(props) {
    const [hubFile, setHubFile] = useState();
    const [error, setError] = useState();
    const { hub } = props;
    const { url: hubUrl, longLabel, shortLabel } = hub;
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        ;
        (async () => {
            try {
                const hubHandle = openLocation({
                    uri: hubUrl,
                    locationType: 'UriLocation',
                });
                const hubTxt = await hubHandle.readFile('utf8');
                setHubFile(new HubFile(hubTxt));
            }
            catch (error) {
                console.error(error);
                setError(error);
            }
        })();
    }, [hubUrl]);
    if (error) {
        return (_jsx(Card, { children: _jsx(CardContent, { children: _jsx(Typography, { color: "error", children: `${error}` }) }) }));
    }
    if (hubFile) {
        const email = hubFile.data.email;
        const descriptionUrl = hubFile.data.descriptionUrl;
        return (_jsxs(Card, { children: [_jsx(CardHeader, { title: shortLabel }), _jsx(CardContent, { children: _jsx(SanitizedHTML, { html: longLabel }) }), _jsxs(CardActions, { children: [_jsx(IconButton, { href: `mailto:${email}`, rel: "noopener noreferrer", target: "_blank", color: "secondary", children: _jsx(EmailIcon, {}) }), descriptionUrl ? (_jsx(IconButton, { href: new URL(descriptionUrl, new URL(hubUrl)).href, rel: "noopener noreferrer", target: "_blank", children: _jsx(OpenInNewIcon, { color: "secondary" }) })) : null] })] }));
    }
    return _jsx(LinearProgress, { variant: "query" });
}
export default HubDetails;
//# sourceMappingURL=HubDetails.js.map