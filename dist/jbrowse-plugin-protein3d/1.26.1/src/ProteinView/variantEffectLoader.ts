import type { VariantEffectRequest } from './variantEffectSource'
import type { VariantEffectValues } from './variantEffects'

/**
 * Whether a structure can ask the view's variant-effect source anything yet:
 * `waiting` while what the request is built from is still on its way (SIFTS
 * for a PDB entry), `unavailable` when it never can be, with the reason.
 */
export type VariantEffectAsk =
  | { status: 'waiting' }
  | { status: 'unavailable'; reason: string }
  | { status: 'ready'; request: VariantEffectRequest }

/** The key of a structure's request to a variant-effect source, and its answer */
export interface VariantEffectState {
  key: string
  values?: VariantEffectValues
  error?: unknown
}

/** `variantEffectAsk` is undefined while the view colors by no source */
export interface VariantEffectHost {
  readonly variantEffectAsk: VariantEffectAsk | undefined
  readonly variantEffects: VariantEffectState | undefined
  setVariantEffects(state: VariantEffectState | undefined): void
}

/**
 * Builds the body of the autorun that fetches the values the view's
 * variant-effect scheme colors a structure by, once the structure can say
 * what to ask for. An answer that arrives after the request changed, or after
 * the structure left the view, is dropped, and the request it answered is
 * aborted: the function's `cancel` does the same for the structure leaving.
 *
 * Leaving the variant-effect schemes forgets the answer, so choosing one again
 * asks again: a failure is retried then, and a success comes from the
 * source's cache. A failure is not retried while the scheme stays, since
 * recording it reruns this autorun.
 */
export function makeVariantEffectLoader(
  host: VariantEffectHost,
  isAlive: () => boolean,
  fetchValues: (
    request: VariantEffectRequest,
    signal: AbortSignal,
  ) => Promise<VariantEffectValues>,
) {
  let inFlight: AbortController | undefined
  function cancel() {
    inFlight?.abort()
    inFlight = undefined
  }
  function loadVariantEffects() {
    const ask = host.variantEffectAsk
    const current = host.variantEffects
    if (ask?.status !== 'ready') {
      cancel()
      if (current) {
        host.setVariantEffects(undefined)
      }
      return
    }
    if (current?.key === ask.request.key) {
      return
    }
    cancel()
    const { request } = ask
    const { key } = request
    const controller = new AbortController()
    inFlight = controller
    host.setVariantEffects({ key })
    const answer = (result: Omit<VariantEffectState, 'key'>) => {
      if (
        !controller.signal.aborted &&
        isAlive() &&
        host.variantEffects?.key === key
      ) {
        host.setVariantEffects({ key, ...result })
      }
    }
    fetchValues(request, controller.signal).then(
      values => {
        answer({ values })
      },
      (error: unknown) => {
        answer({ error })
      },
    )
  }
  return Object.assign(loadVariantEffects, { cancel })
}
