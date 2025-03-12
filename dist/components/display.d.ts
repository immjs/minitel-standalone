import { MinitelObject } from '../abstract/minitelobject.js';
import { Align, MinitelObjectAttributes } from '../types.js';
import type { Minitel } from './minitel.js';
import { RichCharGrid } from '../richchargrid.js';
export declare class Display extends MinitelObject<DisplayAttributes> {
    static defaultAttributes: DisplayAttributes;
    defaultAttributes: DisplayAttributes;
    constructor(children: MinitelObject<MinitelObjectAttributes, Record<string, any[]>>[] | undefined, attributes: Partial<DisplayAttributes>, minitel: Minitel);
    getDimensions(attributes: DisplayAttributes, inheritMe: Partial<DisplayAttributes>): {
        width: number;
        height: number;
    };
    render(attributes: DisplayAttributes, inheritMe: Partial<DisplayAttributes>): RichCharGrid;
}
export interface DisplayAttributes extends MinitelObjectAttributes {
    grid: RichCharGrid;
    widthAlign: Align;
    heightAlign: Align;
}
