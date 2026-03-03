import { IdeogramViewModel } from './model';
export declare const regions: string[];
export declare const allChromosomes: string[];
export declare const tierLegend: {
    name: string;
    rows: {
        name: string;
        color: string;
        shape: string;
    }[];
}[];
export declare function openReactomeView(pwId: string, pathways: any, pwName: string, geneName: string, model: IdeogramViewModel): Promise<void>;
export declare function navToAnnotation(locString: string, model: IdeogramViewModel): Promise<void>;
export declare function populateAnnotations(model: any): Promise<void>;
