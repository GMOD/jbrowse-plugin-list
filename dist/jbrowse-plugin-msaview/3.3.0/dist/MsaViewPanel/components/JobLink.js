import React from 'react';
import { Typography } from '@mui/material';
import ExternalLink from '../../components/ExternalLink';
import { ebiBlastResultUrl } from '../../utils/ebiBlast';
function JobLink({ jobId }) {
    return (React.createElement(Typography, null,
        "Job ",
        jobId,
        " (",
        React.createElement(ExternalLink, { href: ebiBlastResultUrl(jobId) }, "see status"),
        ")"));
}
export default JobLink;
