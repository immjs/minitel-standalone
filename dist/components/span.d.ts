import { MinitelObject } from "../abstract/minitelobject";
import { TextNode } from "../abstract/textnode";
import { RichCharGrid } from "../richchargrid";
import { MinitelObjectAttributes, RenderLinesAttributes } from "../types";
import { Minitel } from "./minitel";
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
