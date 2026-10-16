/**
 * Builds the body of the autorun that fetches the values the view's
 * variant-effect scheme colours a structure by, once the structure can say
 * what to ask for. An answer that arrives after the request changed, or after
 * the structure left the view, is dropped.
 *
 * Leaving the variant-effect schemes forgets the answer, so choosing one again
 * asks again: a failure is retried then, and a success comes from the
 * source's cache. A failure is not retried while the scheme stays, since
 * recording it reruns this autorun.
 */
export function makeVariantEffectLoader(host, isAlive, fetchValues) {
    return function loadVariantEffects() {
        const ask = host.variantEffectAsk;
        const current = host.variantEffects;
        if (!ask) {
            if (current) {
                host.setVariantEffects(undefined);
            }
            return;
        }
        if (ask.status !== 'ready' || current?.key === ask.request.key) {
            return;
        }
        const { request } = ask;
        const { key } = request;
        host.setVariantEffects({ key });
        const answer = (result) => {
            if (isAlive() && host.variantEffects?.key === key) {
                host.setVariantEffects({ key, ...result });
            }
        };
        fetchValues(request).then(values => {
            answer({ values });
        }, (error) => {
            answer({ error });
        });
    };
}
