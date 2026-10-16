import React from 'react';
import { LoadingEllipses } from '@jbrowse/core/ui';
import { Typography } from '@mui/material';
/**
 * Why Submit is grey. The query row is the selected transcript's translation,
 * and fetching and translating it takes a round trip to the sequence adapter,
 * so the button starts disabled on every panel — with nothing to distinguish
 * "wait a moment" from "this gene has no protein and never will".
 *
 * An error says so through the panel's own ErrorMessage, so this stays quiet
 * for that one rather than saying it twice.
 */
export default function SequenceStatusMessage({ status, }) {
    return status === 'loading' ? (React.createElement(LoadingEllipses, { message: "Translating transcript" })) : status === 'missing' ? (React.createElement(Typography, { color: "textSecondary", variant: "body2" }, "no coding sequence to align")) : null;
}
