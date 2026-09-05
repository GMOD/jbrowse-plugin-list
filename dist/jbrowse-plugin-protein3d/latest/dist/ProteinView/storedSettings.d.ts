export declare const PERSISTED_SETTINGS: readonly ["showAlignment", "showProteinTracks", "showHighlight", "zoomToBaseLevel", "autoScrollAlignment", "compactTracks"];
export type PersistedSettings = Partial<Record<(typeof PERSISTED_SETTINGS)[number], boolean>>;
/**
 * A stored preference fills in only what the snapshot leaves unsaid. Comparing
 * against the property defaults instead, as this used to, cannot tell a spec
 * that declares the default value from one that says nothing, so a stored
 * `zoomToBaseLevel: false` overrode a spec's explicit `true`. A re-hydrated
 * session snapshot names every setting, so it keeps exactly what it saved.
 */
export declare function withStoredSettings<T extends PersistedSettings>(snapshot: T, stored: PersistedSettings | undefined): T;
export declare function readStoredSettings(): PersistedSettings | undefined;
export declare function writeStoredSettings(settings: PersistedSettings): void;
