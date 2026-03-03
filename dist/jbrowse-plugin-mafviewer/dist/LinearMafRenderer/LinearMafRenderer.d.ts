import { FeatureRendererType } from '@jbrowse/core/pluggableElementTypes';
import { RenderArgsDeserialized } from '@jbrowse/core/pluggableElementTypes/renderers/BoxRendererType';
import { Region } from '@jbrowse/core/util';
import type { Sample } from '../types';
interface RenderArgs extends RenderArgsDeserialized {
    samples: Sample[];
    rowHeight: number;
    rowProportion: number;
    showAllLetters: boolean;
    mismatchRendering: boolean;
    statusCallback?: (arg: string) => void;
    showAsUpperCase: boolean;
    highResolutionScaling?: number;
}
export default class LinearMafRenderer extends FeatureRendererType {
    getExpandedRegion(region: Region): {
        start: number;
        end: number;
        refName: string;
        reversed?: boolean | undefined;
        assemblyName: string;
    };
    render(renderProps: RenderArgs): Promise<{
        imageData: unknown;
        flatbush: ArrayBufferLike;
        items: import("./rendering").RenderedBase[];
        samples: Sample[];
        features: Map<any, any>;
        width: number;
        height: number;
        containsNoTransferables: boolean;
    }>;
}
export {};
