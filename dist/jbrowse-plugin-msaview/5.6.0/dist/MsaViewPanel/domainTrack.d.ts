import type { ConnectedDomains } from './connectedDomains';
export declare function domainTrackId(viewId: string): string;
/**
 * A session FeatureTrack drawing `domains` on the genome: one feature per
 * domain, one subfeature per region, so a domain spanning exons draws as boxes
 * joined across the intron. The display's color is the domains' color object,
 * a categorical scale over each feature's `accession`, so its key names each
 * color with its domain.
 */
export declare function domainTrackConf({ viewId, assemblyName, name, strand, domains, }: {
    viewId: string;
    assemblyName: string;
    name: string;
    strand?: number;
    domains: ConnectedDomains;
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
            title: string;
            field: "accession";
            domain: string[];
            range: string[];
            labels: string[];
        };
    }[];
};
