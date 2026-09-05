import React from 'react';
import type { TviewPlanResult } from '../TviewGetPlanRpc';
/**
 * What the reads say about the arrays before the view is opened, since the
 * number is often the whole reason for opening it and a picture of 400 columns
 * is a slow way to read one off.
 */
export default function ArrayReport({ data }: {
    data: TviewPlanResult;
}): React.JSX.Element | null;
