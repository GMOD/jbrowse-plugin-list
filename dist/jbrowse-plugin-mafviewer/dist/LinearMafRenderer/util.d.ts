import type { Theme } from '@mui/material';
export declare function getContrastBaseMap(theme: Theme): {
    [k: string]: string;
};
export declare function getColorBaseMap(theme: Theme): {
    a: string;
    c: string;
    g: string;
    t: string;
};
export declare function fillRect(ctx: CanvasRenderingContext2D, l: number, t: number, w: number, h: number, cw: number, color?: string): void;
export declare function getCharWidthHeight(): {
    charWidth: number;
    charHeight: number;
};
