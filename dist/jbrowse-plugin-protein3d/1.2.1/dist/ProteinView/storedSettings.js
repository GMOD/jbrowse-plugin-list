import { readStoredJson, writeStorage } from '../storage';
const SETTINGS_KEY = 'proteinView-settings';
/**
 * What a reader's last choice should still be true of the next view: how the
 * panel is laid out. Deliberately not what a click or a highlight does —
 * `zoomToBaseLevel` and `showHighlight` change behavior, and carrying a
 * behavior from one session's view into another's leaves a reader wondering
 * why the same click does something different.
 */
export const PERSISTED_SETTINGS = [
    'showAlignment',
    'showProteinTracks',
    'showControls',
    'autoScrollAlignment',
    'compactTracks',
    'showAllFeatureTracks',
];
/**
 * A stored preference fills in only what the snapshot leaves unsaid. Comparing
 * against the property defaults instead, as this used to, cannot tell a spec
 * that declares the default value from one that says nothing, so a stored
 * `showAlignment: false` overrode a spec's explicit `true`. A re-hydrated
 * session snapshot names every setting, so it keeps exactly what it saved.
 */
export function withStoredSettings(snapshot, stored) {
    if (!stored) {
        return snapshot;
    }
    const filled = { ...snapshot };
    for (const key of PERSISTED_SETTINGS) {
        if (filled[key] === undefined && stored[key] !== undefined) {
            filled[key] = stored[key];
        }
    }
    return filled;
}
/**
 * The stored settings that are booleans. Anything else in storage (an older
 * format, a hand edit) is dropped: copied into the snapshot it fails MST's
 * type check and the view never opens.
 */
export function readStoredSettings() {
    const stored = readStoredJson(SETTINGS_KEY);
    if (typeof stored !== 'object' || stored === null) {
        return undefined;
    }
    const settings = {};
    for (const key of PERSISTED_SETTINGS) {
        const value = Reflect.get(stored, key);
        if (typeof value === 'boolean') {
            settings[key] = value;
        }
    }
    return settings;
}
/** Remembers one choice, leaving the other stored settings as they were. */
export function storeSetting(key, value) {
    writeStorage(SETTINGS_KEY, JSON.stringify({ ...readStoredSettings(), [key]: value }));
}
