export async function myfetch(url, args) {
    const response = await fetch(url, args);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${url} ${await response.text()}`);
    }
    return response;
}
export async function textfetch(url, args) {
    const response = await myfetch(url, args);
    return response.text();
}
export async function jsonfetch(url, args) {
    const response = await myfetch(url, args);
    return response.json();
}
export async function abfetch(url) {
    const res = await myfetch(url);
    return res.arrayBuffer();
}
export function timeout(time) {
    return new Promise(res => setTimeout(res, time));
}
//# sourceMappingURL=fetchUtils.js.map