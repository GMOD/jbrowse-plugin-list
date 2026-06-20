/**
 * Query the GDC API for project information related to the given gene
 * @param {String} featureId Gene ID
 */
export declare function getGeneProjectsAsync(featureId: string): Promise<any>;
/**
 * Query the GDC API for project information related to the given mutation
 * @param {String} featureId Mutation ID
 */
export declare function getMutationProjectsAsync(featureId: string): Promise<any>;
