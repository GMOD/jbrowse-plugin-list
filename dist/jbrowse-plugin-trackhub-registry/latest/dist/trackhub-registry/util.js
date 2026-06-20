export async function mfetch(url, request) {
    const response = await fetch(url, request);
    if (!response.ok) {
        throw new Error(`HTTP
          ${response.status}: ${await response.text()} from
          ${url}`);
    }
    return response.json();
}
export async function post_with_params(url, params = {}, options = {}) {
    const urlParams = Object.keys(params)
        .map((param) => `${param}=${params[param]}`)
        .join('&');
    return mfetch(`${url}${urlParams ? `?${urlParams}` : ''}`, {
        ...options,
        method: 'POST',
    });
}
//# sourceMappingURL=util.js.map