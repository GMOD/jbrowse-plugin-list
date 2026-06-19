import { FileLocation } from '@jbrowse/core/util/types';
interface response {
    [key: string]: unknown;
    success: boolean;
    occurances: string[];
    type: number;
    message: string;
}
/**
 * generates annotations in the form of two objects, one for the ideogram and one for the widget
 *  using a provided location of a TSV file
 *  the widget and ideo members differ in that the widget object has properties required by the ideogram
 *  library to render the annotations properly and the ideo object has properties formatted and
 *  distributed in a way that reads better for the IdeogramFeatureWidget when clicked
 * @param location - the location of the TSV file to be turned into annotations on the ideogram
 * @param withReactome - whether to cross reference the provided annots with reactome data
 * @returns widget object, ideo object, from the TSV provided information, and response for error display
 */
export declare function generateAnnotations(location: FileLocation, withReactome: boolean): Promise<{
    widget: any;
    ideo: any;
    pathways: any;
    res: response;
}>;
export {};
