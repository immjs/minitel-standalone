import { MinitelObject } from "../abstract/minitelobject.js";
import { TextNode } from "../abstract/textnode.js";
import { RichCharGrid } from "../richchargrid.js";
import { MinitelObjectAttributes, RenderLinesAttributes } from "../types.js";
import { Minitel } from "./minitel.js";
export declare class Span extends MinitelObject {
    children: (TextNode | Span)[];
    constructor(children: (TextNode | Span)[], attributes: Partial<MinitelObjectAttributes>, minitel: Minitel);
    getDimensions(attributes: MinitelObjectAttributes, inheritMe: Partial<MinitelObjectAttributes>): {
        width: number;
        height: number;
    };
    render(attributes: MinitelObjectAttributes, inheritMe: Partial<MinitelObjectAttributes>): RichCharGrid;
    renderLines(inheritedAttributes: Partial<MinitelObjectAttributes>, forcedAttributes: Partial<RenderLinesAttributes>): RichCharGrid[];
}
