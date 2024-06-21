import { MinitelObject } from "../abstract/minitelobject";
import { TextNode } from "../abstract/textnode";
import { RichChar } from "../richchar";
import { RichCharGrid } from "../richchargrid";
import { MinitelObjectAttributes, RenderLinesAttributes } from "../types";
import { alignInvrt, inheritedProps } from "../utils";
import { Minitel } from "./minitel";

export class Span extends MinitelObject {
    children: (TextNode | Span)[];
    constructor(children: (TextNode | Span)[], attributes: Partial<MinitelObjectAttributes>, minitel: Minitel) {
        super([], attributes, minitel);

        this.children = [];
        for (let child of children) {
            this.appendChild(child);
        }
    }

    getDimensions(attributes: MinitelObjectAttributes, inheritMe: Partial<MinitelObjectAttributes>): { width: number; height: number; } {
        const lines = [new RichCharGrid([[]])];
        for (let child of this.children) {
            const render = child.renderLines(inheritMe, { // Someone smarter than me will figure out something better than this
                width: attributes.width,
                forcedIndent: lines.at(-1)!.width,
            });
            const newMaxIdx = lines.length - 1;
            for (let lineIdx in render) {
                if (+lineIdx !== 0) {
                    lines[newMaxIdx + +lineIdx] = new RichCharGrid([[]]);
                }
                lines[newMaxIdx + +lineIdx].mergeX(render[+lineIdx], 'end');
            }
        }

        const width = attributes.width || Math.max(...lines.map((v) => v.width));

        return { width, height: lines.reduce((p, v) => p + v.height, 0) };
    }

    render(attributes: MinitelObjectAttributes, inheritMe: Partial<MinitelObjectAttributes>) {
        const fillChar = new RichChar(attributes.fillChar, attributes).noSize();
        const lines = [new RichCharGrid([[]])];
        for (let child of this.children) {
            const render = child.renderLines(inheritMe, {
                width: attributes.width,
                forcedIndent: lines.at(-1)!.width,
            });
            const newMaxIdx = lines.length - 1;
            for (let lineIdx in render) {
                if (+lineIdx !== 0) {
                    lines[newMaxIdx + +lineIdx] = new RichCharGrid([[]]);
                }
                lines[newMaxIdx + +lineIdx].mergeX(render[+lineIdx], 'end');
            }
        }

        const width = attributes.width || Math.max(...lines.map((v) => v.width));
        const result = new RichCharGrid([]);

        for (let line of lines) {
            line.setWidth(width, alignInvrt[attributes.textAlign], fillChar);
            result.mergeY(line);
        }
        if (attributes.height) {
            result.setHeight(attributes.height, 'end', fillChar);
        }
        return result;
    }

    renderLines(inheritedAttributes: Partial<MinitelObjectAttributes>, forcedAttributes: Partial<RenderLinesAttributes>) {
        const attributes = {
            ...this.defaultAttributes,
            ...inheritedAttributes,
            ...this.attributes,
            ...forcedAttributes,
        };

        const inheritMe = inheritedProps({
            ...inheritedAttributes,
            ...this.attributes,
            ...forcedAttributes,
        });

        // const fillChar = new RichChar(attributes.fillChar, attributes).noSize();
        const lines = [new RichCharGrid([[]])];
        let isFirstChild = true;
        for (let child of this.children) {
            const render = child.renderLines(inheritMe, {
                width: attributes.width,
                forcedIndent: isFirstChild ? attributes.forcedIndent : lines.at(-1)!.width,
            });
            const newMaxIdx = lines.length - 1;
            for (let lineIdx in render) {
                if (+lineIdx !== 0) {
                    lines[newMaxIdx + +lineIdx] = new RichCharGrid([[]]);
                }
                lines[newMaxIdx + +lineIdx].mergeX(render[+lineIdx], 'end');
            }
            isFirstChild = false;
        }

        return lines;
    }
}
