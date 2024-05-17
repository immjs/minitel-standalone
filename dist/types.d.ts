export interface CharAttributes {
    fg: number;
    bg: number;
    underline: boolean;
    doubleHeight: boolean;
    doubleWidth: boolean;
    noBlink: boolean;
    invert: boolean;
}
export type Align = 'start' | 'middle' | 'end';
export interface MinitelObjectAttributes extends Partial<CharAttributes> {
    fillChar: string;
    width: number | null;
    height: number | null;
    textAlign: Align;
    wrap: 'clip' | 'word-wrap' | 'word-break';
    flexGrow: number | boolean;
    pad: Padding;
}
export interface RenderLinesAttributes extends MinitelObjectAttributes {
    forcedIndent?: number;
}
export type FullPadding = [number, number, number, number];
export type Padding = number | [number, number] | FullPadding;
