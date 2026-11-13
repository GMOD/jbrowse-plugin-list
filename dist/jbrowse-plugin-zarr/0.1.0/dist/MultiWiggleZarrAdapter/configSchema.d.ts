import type { Instance } from '@jbrowse/mobx-state-tree';
/**
 * #config MultiWiggleZarrAdapter
 * #trackType MultiQuantitativeTrack
 * #fileFormat quantitative | Zarr signal matrix
 * #gotcha The store is a directory, not a file: point `uri` at the `.zarr`
 * root (the level containing `zarr.json`), with no trailing slash and no
 * `/zarr.json` suffix.
 *
 * reads a samples-by-bins quantitative matrix from a Zarr v3 store, so a
 * multi-sample signal track costs a couple of chunk requests instead of one
 * indexed read per sample. Built by `the build_signal_zarr.ts converter`; the sample
 * list, bin size and resolution levels come from the store's own metadata, so
 * the config is just the location.
 *
 * #example
 * ```js
 * {
 *   type: 'MultiWiggleZarrAdapter',
 *   uri: 'https://example.com/cohort_cnv.zarr',
 * }
 * ```
 */
export declare function normalizeSnapshot(snap: Record<string, unknown>): Record<string, unknown>;
declare const MultiWiggleZarrAdapter: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    readonly zarrLocation: {
        type: "fileLocation";
    } & {
        defaultValue: unknown;
    };
    readonly resolutionMultiplier: {
        type: "number";
    } & {
        defaultValue: number;
    };
    type: {
        type: "string";
    } & {
        defaultValue: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined, true, import("@jbrowse/core/configuration").ConfigurationSchemaRequirement<Partial<Record<string, string[]>>, string>, any>>;
export type MultiWiggleZarrAdapterConfig = Instance<typeof MultiWiggleZarrAdapter>;
export default MultiWiggleZarrAdapter;
