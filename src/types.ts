// import { InputAttributes } fr``om './components/input.js';
// import { ScrollableAttributes } from './components/scrollable.js';
// import { XJoinAttributes } from './components/xjoin.js';
// import { YJoinAttributes } from './components/yjoin.js';
// import { ZJoinAttributes } fr``om './components/zjoin.js';

export interface CharAttributes {
    fg: number;
    bg: number;
    underline: boolean;
    doubleHeight: boolean;
    doubleWidth: boolean;
    noBlink: boolean;
    invert: boolean;
    charset: number;
}
export type CharAttributesWithoutDouble = Omit<CharAttributes, 'doubleHeight' | 'doubleWidth'>;
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
    disabled: boolean;
}
export interface RenderLinesAttributes extends MinitelObjectAttributes {
    forcedIndent?: number;
}

// type MiniProps<T> = Partial<T & { children: React.ReactNode | React.ReactNode[]; key: React.Key }>;

// declare module 'react/jsx-runtime' {
//     namespace JSX {
//         interface IntrinsicElements {
//             xjoin: MiniProps<XJoinAttributes>;
//             yjoin: MiniProps<YJoinAttributes>;
//             zjoin: MiniProps<ZJoinAttributes>;
//             para: MiniProps<MinitelObjectAttributes>;
//             cont: MiniProps<MinitelObjectAttributes>;
//             input: MiniProps<InputAttributes>;
//             scroll: MiniProps<ScrollableAttributes>;
//         }
//     }
// }

export type FullPadding = [number, number, number, number];
export type Padding = number | [number, number] | FullPadding;
