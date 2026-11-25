import { BgzfFilehandle } from '@gmod/bgzf-filehandle';
export function parseMsaIndex(text) {
    return text.split('\n').flatMap(line => {
        const [name, offset, length] = line.split('\t');
        return name && offset && length
            ? [{ name, offset: Number(offset), length: Number(length) }]
            : [];
    });
}
export async function readMsaEntry(bgzf, entry) {
    const bytes = await bgzf.read(entry.length, entry.offset);
    return new TextDecoder().decode(bytes).trim();
}
export function readMsaBlock({ entry, ...filehandles }) {
    return readMsaEntry(new BgzfFilehandle(filehandles), entry);
}
