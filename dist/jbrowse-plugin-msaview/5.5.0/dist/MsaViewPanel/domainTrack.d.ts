import type { ConnectedDomain } from './connectedDomains';
export declare function domainTrackId(viewId: string): string;
/**
 * A session FeatureTrack drawing `domains` on the genome: one feature per
 * domain, one subfeature per region, so a domain spanning exons draws as boxes
 * joined across the intron. Each feature paints the `color` it carries, and
 * the key names each color with its domain.
 */
export declare function domainTrackConf({ viewId, assemblyName, name, strand, domains, }: {
    viewId: string;
    assemblyName: string;
    name: string;
    strand?: number;
    domains: ConnectedDomain[];
}): {
    type: string;
    trackId: string;
    name: string;
    assemblyNames: string[];
    adapter: {
        type: string;
        features: ({
            type: string;
            name: string;
            accession: string;
            color: string;
            subfeatures: ({
                type: string;
                strand?: undefined;
                uniqueId: string;
                refName: string;
                start: number;
                end: number;
            } | {
                type: string;
                strand: number;
                uniqueId: string;
                refName: string;
                start: number;
                end: number;
            })[];
            strand?: undefined;
            uniqueId: string;
            refName: string;
            start: number;
            end: number;
        } | {
            type: string;
            name: string;
            accession: string;
            color: string;
            subfeatures: ({
                type: string;
                strand?: undefined;
                uniqueId: string;
                refName: string;
                start: number;
                end: number;
            } | {
                type: string;
                strand: number;
                uniqueId: string;
                refName: string;
                start: number;
                end: number;
            })[];
            strand: number;
            uniqueId: string;
            refName: string;
            start: number;
            end: number;
        })[];
    };
    displays: {
        type: string;
        displayId: string;
        color: {
            field: string;
            domain: string[];
            range: string[];
            labels: string[];
            title: string;
        };
    }[];
};
