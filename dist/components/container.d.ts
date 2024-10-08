import { MinitelObject } from '../abstract/minitelobject.js';
import { Align, MinitelObjectAttributes } from '../types.js';
import type { Minitel } from './minitel.js';
export declare class Container<T extends ContainerAttributes = ContainerAttributes, U extends Record<string, any[]> = Record<string, any[]>> extends MinitelObject<T, U> {
    static defaultAttributes: ContainerAttributes;
    defaultAttributes: T;
    constructor(children: MinitelObject<MinitelObjectAttributes, Record<string, any[]>>[] | undefined, attributes: Partial<T>, minitel: Minitel);
    getDimensions(attributes: T, inheritMe: Partial<T>): {
        width: number;
        height: number;
    };
    render(attributes: T, inheritMe: Partial<T>): import("../richchargrid.js").RichCharGrid;
}
export interface ContainerAttributes extends MinitelObjectAttributes {
    widthAlign: Align;
    heightAlign: Align;
}
