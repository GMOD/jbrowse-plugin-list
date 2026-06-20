import React from 'react';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()(theme => ({
    tooltip: {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 1000,
        backgroundColor: theme.palette.grey[800],
        color: theme.palette.common.white,
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12,
        whiteSpace: 'nowrap',
    },
    insertion: {
        color: theme.palette.warning.light,
        fontStyle: 'italic',
    },
}));
export default function SequenceTooltip({ x, y, sample, base, genomicPos, }) {
    const { classes } = useStyles();
    // An insertion is when we have a base but no genomic position
    // (the reference has a gap at this column)
    const isInsertion = base !== undefined && genomicPos === undefined;
    return (React.createElement("div", { className: classes.tooltip, style: {
            left: x + 12,
            top: y + 12,
        } },
        React.createElement("div", null,
            React.createElement("strong", null, sample.label)),
        base && (React.createElement("div", null,
            "Base: ",
            base,
            genomicPos !== undefined
                ? ` | Pos: ${(genomicPos + 1).toLocaleString('en-US')}`
                : null)),
        isInsertion && (React.createElement("div", { className: classes.insertion }, "Insertion (not in reference)"))));
}
//# sourceMappingURL=SequenceTooltip.js.map