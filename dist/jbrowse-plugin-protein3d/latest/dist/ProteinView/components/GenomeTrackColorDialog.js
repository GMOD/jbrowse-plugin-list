import React, { useState } from 'react';
import { readConfObject } from '@jbrowse/core/configuration';
import { getSession, getTrackName } from '@jbrowse/core/util';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography, } from '@mui/material';
import { observer } from 'mobx-react';
import { trackConfigNode } from '../../trackConfigNode';
import { TRACK_STATS } from '../proteinColor';
import { parseCuts, thresholdRange } from '../thresholdPalette';
const STAT_LABELS = {
    mean: 'Mean of the three bases',
    max: 'Highest of the three bases',
    min: 'Lowest of the three bases',
    count: 'How many features fall on the codon',
};
const TRACK_TYPES = new Set([
    'QuantitativeTrack',
    'VariantTrack',
    'FeatureTrack',
]);
const GenomeTrackColorDialog = observer(function GenomeTrackColorDialog({ model, handleClose, }) {
    const session = getSession(model);
    const assemblyName = model.structures.find(s => s.connectedView)
        ?.connectedView?.assemblyNames[0];
    const assembly = assemblyName
        ? session.assemblyManager.get(assemblyName)
        : undefined;
    const assemblyNames = new Set([
        ...(assemblyName ? [assemblyName] : []),
        ...(assembly ? [assembly.name, ...assembly.aliases] : []),
    ]);
    const tracks = session.tracks
        .filter(entry => TRACK_TYPES.has(entry.type))
        .filter(entry => {
        const conf = trackConfigNode(session, entry);
        return (conf !== undefined &&
            (assemblyNames.size === 0 ||
                readConfObject(conf, 'assemblyNames').some((n) => assemblyNames.has(n))));
    })
        .map(entry => ({
        trackId: entry.trackId,
        name: getTrackName(entry, session),
    }))
        .toSorted((a, b) => a.name.localeCompare(b.name));
    const { color } = model;
    const [trackId, setTrackId] = useState(color.field === 'track' ? (color.trackId ?? '') : '');
    const [stat, setStat] = useState(color.field === 'track' ? (color.stat ?? 'mean') : 'mean');
    const [scale, setScale] = useState(color.field === 'track' && color.scale === 'threshold'
        ? 'threshold'
        : 'linear');
    const [cutsText, setCutsText] = useState(color.field === 'track' && color.domain ? color.domain.join(', ') : '');
    const cuts = parseCuts(cutsText);
    const cutsInvalid = scale === 'threshold' && !cuts;
    return (React.createElement(Dialog, { open: true, onClose: handleClose, maxWidth: "sm", fullWidth: true },
        React.createElement(DialogTitle, null, "Color by a genome track"),
        React.createElement(DialogContent, null,
            React.createElement(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 } },
                "Each residue takes the track's scores under its codon on the genome view's assembly",
                assemblyName ? ` (${assemblyName})` : '',
                ".",
                ' ',
                stat === 'count'
                    ? 'A residue no feature falls on reads 0.'
                    : 'Residues with no score are grey.'),
            React.createElement(TextField, { select: true, fullWidth: true, label: "Track", value: trackId, onChange: e => {
                    setTrackId(e.target.value);
                }, helperText: tracks.length === 0
                    ? 'This session has no quantitative, variant or feature track on the genome view’s assembly'
                    : undefined, sx: { mb: 2 } }, tracks.map(t => (React.createElement(MenuItem, { key: t.trackId, value: t.trackId }, t.name)))),
            React.createElement(TextField, { select: true, fullWidth: true, label: "Score per residue", value: stat, onChange: e => {
                    const chosen = TRACK_STATS.find(s => s === e.target.value);
                    if (chosen) {
                        setStat(chosen);
                    }
                } }, TRACK_STATS.map(s => (React.createElement(MenuItem, { key: s, value: s }, STAT_LABELS[s])))),
            React.createElement(TextField, { select: true, fullWidth: true, label: "Scale", value: scale, onChange: e => {
                    setScale(e.target.value);
                }, sx: { mt: 2 } },
                React.createElement(MenuItem, { value: "linear" }, "Continuous, light to dark"),
                React.createElement(MenuItem, { value: "threshold" }, "Thresholds")),
            scale === 'threshold' ? (React.createElement(TextField, { fullWidth: true, label: "Cuts, lowest first", placeholder: "-1.328, -0.748", value: cutsText, error: cutsInvalid, helperText: cutsInvalid
                    ? 'Numbers, each above the last'
                    : 'Red below the first cut, blue above the last', onChange: e => {
                    setCutsText(e.target.value);
                }, sx: { mt: 2 } })) : null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: handleClose }, "Cancel"),
            React.createElement(Button, { variant: "contained", disabled: !trackId || cutsInvalid, onClick: () => {
                    // the same track on the same scale keeps what a session wrote
                    // beside it: its palette, labels, title and domain, and the same
                    // track its filter, and its scoreField, which a count does not read
                    const sameTrack = color.field === 'track' && color.trackId === trackId;
                    const kept = sameTrack &&
                        (color.scale === 'threshold') === (scale === 'threshold')
                        ? color
                        : undefined;
                    const scoreField = sameTrack && stat !== 'count' ? color.scoreField : undefined;
                    const filter = sameTrack ? color.filter : undefined;
                    const sameBands = kept?.range?.length === (cuts?.length ?? 0) + 1;
                    model.setColor(scale === 'threshold' && cuts
                        ? {
                            ...kept,
                            field: 'track',
                            trackId,
                            stat,
                            scoreField,
                            filter,
                            scale,
                            domain: cuts,
                            range: sameBands
                                ? kept.range
                                : thresholdRange(cuts.length + 1),
                            labels: sameBands ? kept.labels : undefined,
                        }
                        : {
                            ...kept,
                            field: 'track',
                            trackId,
                            stat,
                            scoreField,
                            filter,
                        });
                    handleClose();
                } }, "Color"))));
});
export default GenomeTrackColorDialog;
