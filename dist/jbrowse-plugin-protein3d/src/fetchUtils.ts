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

export function timeout(time: number) {
  return new Promise(res => setTimeout(res, time))
}
