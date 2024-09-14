export interface RealCharAttributes {
    fg: number;
    bg: number;
    underline: boolean;
    doubleHeight: boolean;
    doubleWidth: boolean;
    noBlink: boolean;
    invert: boolean;
    charset: number;
}
export type CharAttributes = Omit<RealCharAttributes, 'doubleHeight' | 'doubleWidth'>;
export type ApplicableCharAttributes = Omit<CharAttributes, 'charset'>;
export type Align = 'start' | 'middle' | 'end';
export interface MinitelObjectAttributes extends Partial<ApplicableCharAttributes> {
    fillChar: string;
    width: number | null;
    height: number | null;
    textAlign: Align;
    wrap: 'clip' | 'word-wrap' | 'word-break';
    flexGrow: number | boolean;
    pad: Padding;
    visible: boolean;
}
export interface RenderLinesAttributes extends MinitelObjectAttributes {
    forcedIndent?: number;
}
export type FullPadding = [number, number, number, number];
export type Padding = number | [number, number] | FullPadding;
