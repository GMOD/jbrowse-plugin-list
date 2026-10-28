import React from 'react';
import { observer } from 'mobx-react';
import { DIFFERENT_RESIDUE_COLOR, SIMILAR_RESIDUE_COLOR } from '../constants';
import { mismatchRuns } from '../mismatchRuns';
const MismatchShading = observer(function MismatchShading({ model, }) {
    const { alignment, columnWidth } = model;
    return alignment
        ? mismatchRuns(alignment).map(run => (React.createElement("div", { key: run.start, style: {
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: run.start * columnWidth,
                width: (run.end - run.start) * columnWidth,
                background: run.kind === 'similar'
                    ? SIMILAR_RESIDUE_COLOR
                    : DIFFERENT_RESIDUE_COLOR,
            } })))
        : null;
});
export default MismatchShading;
