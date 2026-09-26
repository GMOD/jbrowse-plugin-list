import React from 'react';
import { getSession } from '@jbrowse/core/util';
import { Button, Checkbox, DialogActions, FormControlLabel, } from '@mui/material';
import { readLaunchPlacement, sessionSupportsPlacement, writeLaunchPlacement, } from '../../utils/workspaces';
import { useLaunchPlacement } from './launchPlacement';
/**
 * Where the launch puts the view, offered wherever a launch is submitted.
 *
 * A checkbox rather than a menu of the three placements: the choice a reader
 * has at this point is "beside the genome view or under it", and `newTab` is a
 * spec's to state, not a thing to pick before you have seen the alignment.
 *
 * Absent entirely on a host that cannot tile — an embedded session, or a
 * release that places views its own way — because the box would do nothing
 * there and every launch would quietly ignore it.
 */
function PlacementToggle({ checked, onChange, }) {
    return (React.createElement(FormControlLabel, { label: "Open beside the genome view", control: React.createElement(Checkbox, { checked: checked, onChange: event => {
                onChange(event.target.checked);
            } }) }));
}
export default function SubmitCancelActions({ onSubmit, onCancel, submitDisabled, hint, submitLabel = 'Submit', cancelLabel = 'Cancel', model, }) {
    const [sideBySide, setSideBySide] = useLaunchPlacement();
    // The stored value is what the next dialog opens on, so it is written on
    // submit rather than on the click: a dialog the user backed out of must not
    // move where every future launch lands.
    const offerPlacement = !!model && sessionSupportsPlacement(getSession(model));
    return (React.createElement(DialogActions, { sx: { flexWrap: 'wrap', rowGap: 1 } },
        offerPlacement ? (React.createElement(PlacementToggle, { checked: sideBySide, onChange: setSideBySide })) : null,
        React.createElement("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginLeft: 'auto',
            } },
            hint,
            React.createElement(Button, { sx: { flexShrink: 0 }, color: "primary", variant: "contained", disabled: submitDisabled, onClick: () => {
                    if (offerPlacement) {
                        const placement = sideBySide ? 'splitRight' : 'stack';
                        writeLaunchPlacement(placement);
                        onSubmit(placement);
                    }
                    else {
                        onSubmit(readLaunchPlacement());
                    }
                } }, submitLabel),
            React.createElement(Button, { sx: { flexShrink: 0 }, color: "secondary", variant: "contained", onClick: () => {
                    onCancel();
                } }, cancelLabel))));
}
