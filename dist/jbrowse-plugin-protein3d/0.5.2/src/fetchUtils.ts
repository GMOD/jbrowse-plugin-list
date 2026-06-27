export async function myfetch(url: string, args?: RequestInit) {
  const response = await fetch(url, args)

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} fetching ${url} ${await response.text()}`,
    )
  }

  return response
}

export async function jsonfetch<T = unknown>(
  url: string,
  args?: RequestInit,
): Promise<T> {
  const response = await myfetch(url, args)
  return response.json()
}

function abortError(signal: AbortSignal) {
  return signal.reason instanceof Error
    ? signal.reason
    : new Error('Aborted', { cause: signal.reason })
}

export function timeout(time: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError(signal))
    } else {
      const id = setTimeout(resolve, time)
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(id)
          reject(abortError(signal))
        },
        { once: true },
      )
    }
  })
}
