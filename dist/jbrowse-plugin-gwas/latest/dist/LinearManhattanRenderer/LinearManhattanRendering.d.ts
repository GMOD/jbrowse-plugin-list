import React from 'react';
import type { SimpleFeatureSerialized } from '@jbrowse/core/util';
interface Props {
    width: number;
    height: number;
    clickMap: {
        index: ArrayBuffer;
        items: {
            feature: SimpleFeatureSerialized;
        }[];
    };
    onMouseLeave?: (event: React.MouseEvent) => void;
    onMouseMove?: (event: React.MouseEvent, featureId?: string) => void;
    onFeatureClick?: (event: React.MouseEvent, featureId?: string) => void;
    [key: string]: unknown;
}
declare const LinearManhattanRendering: (props: Props) => React.JSX.Element;
export default LinearManhattanRendering;
