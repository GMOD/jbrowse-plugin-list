export async function textfetch(url, arg) {
    const res = await fetch(url, arg);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} from ${url}`);
    }
    return res.text();
}
//# sourceMappingURL=util.js.map