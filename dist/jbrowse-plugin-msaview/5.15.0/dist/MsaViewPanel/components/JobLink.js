import React from 'react';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react';
import ExternalLink from '../../components/ExternalLink';
import { ebiBlastResultUrl } from '../../utils/ebiBlast';
import { isPhmmerJobId, phmmerResultUrl } from '../../utils/phmmer';
const JobLink = observer(function JobLink({ jobId }) {
    // read off the job id rather than the launch params, so a link rebuilt for an
    // old cached job still points at the tool that actually ran it
    const url = isPhmmerJobId(jobId)
        ? phmmerResultUrl(jobId)
        : ebiBlastResultUrl(jobId);
    return (React.createElement(Typography, null,
        "Job ",
        jobId,
        " (",
        React.createElement(ExternalLink, { href: url }, "see status"),
        ")"));
});
export default JobLink;
