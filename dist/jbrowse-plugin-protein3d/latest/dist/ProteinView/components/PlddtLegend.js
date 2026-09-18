import React from 'react';
import Typography from '@mui/material/Typography';
import { PLDDT_BINS, plddtColor } from '../residueTracks';
export default function PlddtLegend() {
    return (React.createElement(Typography, { variant: "caption", color: "textSecondary", component: "div", "data-testid": "track-legend", style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            fontSize: 9,
            paddingLeft: 8,
        } },
        "pLDDT:",
        PLDDT_BINS.map(bin => (React.createElement("span", { key: bin.label, style: { display: 'inline-flex', alignItems: 'center', gap: 3 } },
            React.createElement("span", { style: {
                    width: 8,
                    height: 8,
                    background: plddtColor(bin.score),
                    border: '1px solid rgba(0,0,0,0.3)',
                } }),
            bin.label)))));
}
