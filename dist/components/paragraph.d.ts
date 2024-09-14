import { MinitelObject } from '../abstract/minitelobject.js';
import { RichCharGrid } from '../richchargrid.js';
import { MinitelObjectAttributes } from '../types.js';
import { TextNode } from '../abstract/textnode.js';
import type { Minitel } from './minitel.js';
import { Span } from './span.js';
import { LocationDescriptor } from '../locationdescriptor.js';
export declare class Paragraph extends MinitelObject {
    children: (TextNode | Span)[];
    constructor(children: TextNode[], attributes: Partial<MinitelObjectAttributes>, minitel: Minitel);
    getDimensions(attributes: MinitelObjectAttributes, inheritMe: Partial<MinitelObjectAttributes>): {
        width: number;
        height: number;
    };
    mapLocation(attributes: MinitelObjectAttributes, inheritMe: Partial<MinitelObjectAttributes>, nextNode: MinitelObject<MinitelObjectAttributes, Record<string, any[]>>, nodes: MinitelObject<MinitelObjectAttributes, Record<string, any[]>>[], weAt: number): LocationDescriptor;
    render(attributes: MinitelObjectAttributes, inheritMe: Partial<MinitelObjectAttributes>): RichCharGrid;
}
