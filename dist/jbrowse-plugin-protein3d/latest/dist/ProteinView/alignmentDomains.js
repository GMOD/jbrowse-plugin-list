import { colord } from '@jbrowse/core/util/colord';
import { placeValues } from './variantEffects';
function rgbNumber(css) {
    const { r, g, b } = colord(css).toRgb();
    return (r << 16) | (g << 8) | b;
}
/**
 * The domain each transcript residue falls in, as an index into `domains`. A
 * residue takes the last domain in order with a base of its codon inside, so
 * a site painted after the domain holding it lands on top.
 */
export function domainIndexByTranscriptPos(domains, mapping, { canonicalRefName }) {
    const refName = canonicalRefName(mapping.refName);
    const byPos = new Map();
    domains.forEach(({ regions }, index) => {
        for (const region of regions) {
            if (canonicalRefName(region.refName) === refName) {
                for (let base = region.start; base < region.end; base++) {
                    const pos = mapping.g2p[base];
                    if (pos !== undefined) {
                        byPos.set(pos, index);
                    }
                }
            }
        }
    });
    return byPos;
}
/**
 * The domains of the first alignment connected to the structure's genome view
 * that shows any, placed on the mapped entity through the genome: region →
 * transcript residue (`g2p`) → structure residue. Waits, with no message, for
 * the structure's alignment to the transcript.
 */
export function alignmentDomainStatus({ views, connectedViewId, mapping, naming, entity, transcriptToStructure, }) {
    const alignments = connectedViewId
        ? views.filter(v => v.type === 'MsaView' && v.connectedViewId === connectedViewId)
        : [];
    const connected = alignments.find(v => !!v.connectedDomains?.length)?.connectedDomains ?? [];
    const domains = connected.map(({ name, color }) => ({
        name,
        color: rgbNumber(color),
    }));
    if (!connectedViewId) {
        return {
            domains,
            message: 'No genome view to read alignment domains through',
        };
    }
    if (alignments.length === 0) {
        return {
            domains,
            message: "No alignment is connected to this structure's genome view",
        };
    }
    if (connected.length === 0) {
        return { domains, message: 'The connected alignment shows no domains' };
    }
    if (!mapping) {
        return { domains, message: 'No transcript to place alignment domains on' };
    }
    const byPos = domainIndexByTranscriptPos(connected, mapping, naming);
    if (byPos.size === 0) {
        return {
            domains,
            message: "None of the alignment's domains fall on this transcript",
        };
    }
    return {
        domains,
        placed: entity && transcriptToStructure
            ? placeValues(byPos, pos => transcriptToStructure[pos], entity)
            : undefined,
    };
}
