import { MinitelObject } from '../abstract/minitelobject.js';
import { Align, MinitelObjectAttributes } from '../types.js';
import type { Minitel } from './minitel.js';
import { RichCharGrid } from '../richchargrid.js';
export declare class Display<T extends DisplayAttributes = DisplayAttributes, U extends Record<string, any[]> = Record<string, any[]>> extends MinitelObject<T, U> {
    static defaultAttributes: DisplayAttributes;
    defaultAttributes: T;
    constructor(children: MinitelObject<MinitelObjectAttributes, Record<string, any[]>>[] | undefined, attributes: Partial<T>, minitel: Minitel);
    getDimensions(attributes: T, inheritMe: Partial<T>): {
        width: number;
        height: number;
    };
    render(attributes: T, inheritMe: Partial<T>): RichCharGrid;
}
export interface DisplayAttributes extends MinitelObjectAttributes {
    grid: RichCharGrid;
    widthAlign: Align;
    heightAlign: Align;
}
