import React from 'react';
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui';
import { Button, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { makeStyles } from 'tss-react/mui';
import JobLink from './JobLink';
const useStyles = makeStyles()({
    margin: {
        padding: 20,
    },
    progressRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
});
/**
 * What a view shows while it is still building its alignment, and what it shows
 * when that fails.
 *
 * Every launch that resolves something leaves its request on the model until it
 * succeeds -- `blastParams`, `orthologParams`, `init` -- so one still being
 * there IS "no alignment yet", and the error a failed launch records is only
 * readable here. This used to key on `blastParams` alone, which left an ortholog
 * launch rendering an empty MSAView for the minutes its alignment takes and, on
 * failure, forever: the error was set and nothing drew it.
 */
const LaunchProgress = observer(function LaunchProgress2({ model, }) {
    const { blastParams, orthologParams, progress, rid, error } = model;
    const { classes } = useStyles();
    const message = blastParams
        ? 'Running EBI BLAST'
        : orthologParams
            ? 'Building ortholog alignment'
            : 'Loading alignment';
    return (React.createElement("div", { className: classes.margin }, error ? (React.createElement(React.Fragment, null,
        React.createElement(Typography, { variant: "h5" },
            message,
            " failed"),
        rid ? React.createElement(JobLink, { jobId: rid }) : null,
        React.createElement(ErrorMessage, { error: error }))) : (React.createElement(React.Fragment, null,
        React.createElement(LoadingEllipses, { message: message, variant: "h5" }),
        rid ? React.createElement(JobLink, { jobId: rid }) : null,
        React.createElement("div", { className: classes.progressRow },
            React.createElement(Typography, null, progress || 'Initializing'),
            React.createElement(Button, { variant: "outlined", size: "small", onClick: () => {
                    model.cancelLaunch();
                } }, "Cancel"))))));
});
export default LaunchProgress;
