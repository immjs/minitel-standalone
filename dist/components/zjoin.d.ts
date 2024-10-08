import { MinitelObject } from '../abstract/minitelobject.js';
import { LocationDescriptor } from '../locationdescriptor.js';
import { RichCharGrid } from '../richchargrid.js';
import { Align, MinitelObjectAttributes } from '../types.js';
import type { Minitel } from './minitel.js';
export declare class ZJoin extends MinitelObject<ZJoinAttributes> {
    static defaultAttributes: ZJoinAttributes;
    defaultAttributes: ZJoinAttributes;
    constructor(children: MinitelObject[], attributes: Partial<ZJoinAttributes>, minitel: Minitel);
    getDimensions(attributes: ZJoinAttributes, inheritMe: Partial<ZJoinAttributes>): {
        width: number;
        height: number;
    };
    mapLocation(attributes: ZJoinAttributes, inheritMe: Partial<ZJoinAttributes>, nextNode: MinitelObject, nodes: MinitelObject[], weAt: number): LocationDescriptor;
    render(attributes: ZJoinAttributes, inheritMe: Partial<ZJoinAttributes>): RichCharGrid;
}
export interface ZJoinAttributes extends MinitelObjectAttributes {
    widthAlign: Align;
    heightAlign: Align;
    inheritTransparency: boolean;
}
