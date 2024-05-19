import { MinitelObject } from '../abstract/minitelobject.js';
import { RichCharGrid } from '../richchargrid.js';
import { MinitelObjectAttributes } from '../types.js';
import { TextNode } from '../abstract/textnode.js';
import type { Minitel } from './minitel.js';
import { Span } from './span.js';
export declare class Paragraph extends MinitelObject {
    children: (TextNode | Span)[];
    constructor(children: TextNode[], attributes: Partial<MinitelObjectAttributes>, minitel: Minitel);
    render(attributes: MinitelObjectAttributes, inheritMe: Partial<MinitelObjectAttributes>): RichCharGrid;
}
