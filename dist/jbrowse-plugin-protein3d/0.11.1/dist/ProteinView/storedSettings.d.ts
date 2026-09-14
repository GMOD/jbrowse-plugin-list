export declare const PERSISTED_SETTINGS: readonly ["showAlignment", "showProteinTracks", "showHighlight", "zoomToBaseLevel", "autoScrollAlignment", "compactTracks"];
export type PersistedSetting = (typeof PERSISTED_SETTINGS)[number];
export type PersistedSettings = Partial<Record<PersistedSetting, boolean>>;
/**
 * A stored preference fills in only what the snapshot leaves unsaid. Comparing
 * against the property defaults instead, as this used to, cannot tell a spec
 * that declares the default value from one that says nothing, so a stored
 * `zoomToBaseLevel: false` overrode a spec's explicit `true`. A re-hydrated
 * session snapshot names every setting, so it keeps exactly what it saved.
 */
export declare function withStoredSettings<T extends PersistedSettings>(snapshot: T, stored: PersistedSettings | undefined): T;
export declare function readStoredSettings(): PersistedSettings | undefined;
/** Remembers one choice, leaving the other stored settings as they were. */
export declare function storeSetting(key: PersistedSetting, value: boolean): void;
