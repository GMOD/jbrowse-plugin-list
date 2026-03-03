export async function copyToClipboard(text, onSuccess, onError) {
    try {
        await navigator.clipboard.writeText(text);
        onSuccess?.();
    }
    catch (e) {
        console.error(e);
        onError?.(e);
    }
}
export function downloadAsFile(content, filename, onSuccess, onError) {
    try {
        const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.append(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        onSuccess?.();
    }
    catch (e) {
        console.error(e);
        onError?.(e);
    }
}
//# sourceMappingURL=clipboard.js.map