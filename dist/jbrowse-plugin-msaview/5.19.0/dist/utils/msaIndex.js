import { BgzfFilehandle } from '@gmod/bgzf-filehandle';
export function parseMsaIndex(text) {
    return text.split('\n').flatMap(line => {
        const [name, offset, length] = line.split('\t');
        return name && offset && length
            ? [{ name, offset: Number(offset), length: Number(length) }]
            : [];
    });
}
export async function readMsaBlock({ entry, ...filehandles }) {
    const bytes = await new BgzfFilehandle(filehandles).read(entry.length, entry.offset);
    return new TextDecoder().decode(bytes).trim();
}
