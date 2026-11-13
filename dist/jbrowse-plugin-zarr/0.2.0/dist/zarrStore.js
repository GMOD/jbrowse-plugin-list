import { isUriLocation } from '@jbrowse/core/util';
import { getFetcher, resolveUriLocation } from '@jbrowse/core/util/io';
// One load of zarrita for the whole plugin. The module that imports this is
// itself behind the adapter's `getAdapterClass` dynamic import, so the laziness
// that matters has already happened by the time anything here runs — repeating
// `await import('zarrita')` at each call site only obscured that.
export const zarritaP = import('zarrita');
// zarrita's FetchStore resolves every key with `new URL(root)`, which needs an
// absolute URL, where `fetch()` would have resolved a relative one against the
// document. jbrowse-web stamps `baseUri` onto config URIs (addRelativeUris), so
// the normal path arrives absolute already and this only covers a store added by
// hand or injected as an object — where the alternative is a bare "Invalid URL"
// thrown from inside zarrita with no mention of which track caused it.
function absoluteUrl(uri, adapterName) {
    const base = typeof location === 'undefined' ? undefined : location.href;
    try {
        return new URL(uri, base).href;
    }
    catch (_a) {
        throw new Error(`${adapterName}: "${uri}" is not an absolute URL and there is nothing to resolve it against. Give the store a full https:// URL.`);
    }
}
// Opening the root of a Zarr v3 store through JBrowse's fetcher, so an
// authenticated internet account still applies. `open.v3` explicitly rather
// than the auto-detecting `open`: that probes for v2 metadata first, which is
// two 404 round trips before anything is read. Request count is the whole
// reason this store format exists.
// Deliberately NOT using zarrita's consolidated metadata here, though the
// sibling vcf-zarr plugin does. It would fold the per-level array metadata into
// the root read, but that is 2 requests saved once per track, against a store
// without it paying an extra root read on every open — including the published
// demo store. A VCF Zarr has 17 arrays to open and the trade goes the other way.
export async function openZarrGroup({ adapterName, location, pluginManager, }) {
    const zarr = await zarritaP;
    if (!isUriLocation(location)) {
        throw new Error(`${adapterName} needs a URI: a Zarr store is a directory of chunk files, which only an HTTP(S) location can serve`);
    }
    const resolved = resolveUriLocation(location);
    const fetcher = getFetcher(resolved, pluginManager);
    const store = new zarr.FetchStore(absoluteUrl(resolved.uri, adapterName).replace(/\/+$/, ''), {
        // An explicit init rather than `fetcher(request)`. An internet account's
        // fetcher rebuilds `init.headers` and calls `fetch(input, init)`, and a
        // present `init.headers` *replaces* the Request's own header list rather
        // than merging into it — so handing it the request with no init drops
        // whatever zarrita set. Passing the request's own headers through as the
        // init is what keeps a Range header (sharded stores) and the abort signal
        // alive across the auth wrapper.
        fetch: request => fetcher(request.url, {
            method: request.method,
            headers: request.headers,
            signal: request.signal,
        }),
    });
    return zarr.open.v3(store, { kind: 'group' });
}
//# sourceMappingURL=zarrStore.js.map