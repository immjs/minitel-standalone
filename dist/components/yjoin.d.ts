import { MinitelObject } from '../abstract/minitelobject.js';
import { LocationDescriptor } from '../locationdescriptor.js';
import { RichCharGrid } from '../richchargrid.js';
import { Align, MinitelObjectAttributes } from '../types.js';
import type { Minitel } from './minitel.js';
export declare class YJoin extends MinitelObject<YJoinAttributes> {
    static defaultAttributes: YJoinAttributes;
    defaultAttributes: YJoinAttributes;
    constructor(children: MinitelObject[], attributes: Partial<YJoinAttributes>, minitel: Minitel);
    getDimensions(attributes: YJoinAttributes, inheritMe: Partial<YJoinAttributes>): {
        width: number;
        height: number;
    };
    mapLocation(attributes: YJoinAttributes, inheritMe: Partial<YJoinAttributes>, nextNode: MinitelObject<MinitelObjectAttributes, Record<string, any[]>>, nodes: MinitelObject[], weAt: number): LocationDescriptor;
    render(attributes: YJoinAttributes, inheritMe: Partial<YJoinAttributes>): RichCharGrid;
}
export interface YJoinAttributes extends MinitelObjectAttributes {
    gap: number | 'space-between' | 'space-around' | 'space-evenly';
    widthAlign: Align | 'stretch';
    heightAlign: Align;
}
