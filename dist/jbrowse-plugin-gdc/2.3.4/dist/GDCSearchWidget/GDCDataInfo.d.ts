export interface FileInfo {
    [key: string]: unknown;
    type: string;
    category: string;
    format: string;
}
/**
 * retrieves the config object with appropriate adapter using file info
 *
 * @param fileInfo an array of the format, category, and type of the file
 *
 * @param uri the uri of the data
 *
 * @param indexFileId the fileId of the index file that the data may require
 * (BAM)
 *
 * @returns an object containing the config type and the adapter object
 */
export declare function mapDataInfo(fileInfo: FileInfo, uri?: any, indexFileId?: string, fileBlob?: any): {
    config: {
        type: string;
        adapter: {
            type: string;
        };
        displays?: undefined;
    };
    prefix: string;
} | {
    config: {
        type: string;
        adapter: {
            type: string;
        };
        displays: {
            type: string;
        }[];
    };
    prefix: string;
} | {
    config: {
        type: string;
        adapter: {
            type: string;
        };
        displays?: undefined;
    };
    prefix?: undefined;
} | undefined;
/**
 * creates a specialized config for a GDC explore track using filters that have
 * been parsed from a given url
 *
 * @param category 'GDC Explore' or 'SSM or Gene' indicating what kind of
 * adapter to use
 *
 * @param featureType mutation or gene indicating what kind of feature is being
 * displayed
 *
 * @param adapterPropertyValue filters or data indicating what kind of data has
 * been fed to the function
 *
 * @param trackId the id for the track, needs to be passed in to be specified
 * against the unique identifier
 *
 * @returns a configuration object that will create the track
 */
export declare function mapGDCExploreConfig(category: string, featureType: string, adapterPropertyValue: string, trackId: string): {
    config: {
        type: string;
        adapter: {
            type: string;
        };
        displays?: undefined;
    };
    prefix: string;
} | {
    config: {
        type: string;
        adapter: {
            type: string;
        };
        displays: {
            type: string;
        }[];
    };
    prefix: string;
} | {
    config: {
        type: string;
        adapter: {
            type: string;
        };
        displays?: undefined;
    };
    prefix?: undefined;
} | undefined;
