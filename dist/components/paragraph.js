import { MinitelObject } from '../abstract/minitelobject.js';
import { RichChar } from '../richchar.js';
import { RichCharGrid } from '../richchargrid.js';
import { alignInvrt } from '../utils.js';
export class Paragraph extends MinitelObject {
    constructor(children, attributes, minitel) {
        super([], attributes, minitel);
        this.children = [];
        for (let child of children) {
            this.appendChild(child);
        }
    }
    getDimensions(attributes, inheritMe) {
        const lines = [new RichCharGrid([[]])]; // Again, if someone smarter than me can figure out an elegant way, suit urself
        for (let child of this.children) {
            const render = child.renderLines(inheritMe, {
                width: attributes.width,
                forcedIndent: lines.at(-1).width,
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
    mapLocation(attributes, inheritMe, nextNode, nodes, weAt) {
        const originalLocationDescriptor = nextNode.mapLocationWrapper(inheritMe, {}, nodes, weAt);
        const lines = [new RichCharGrid([[]])]; // Again, if someone smarter than me can figure out an elegant way, suit urself
        for (let child of this.children) {
            if (child === nextNode) {
                originalLocationDescriptor.x += lines.at(-1).width;
                originalLocationDescriptor.y += lines.length;
                return originalLocationDescriptor;
            }
            const render = child.renderLines(inheritMe, {
                width: attributes.width,
                forcedIndent: lines.at(-1).width,
            });
            const newMaxIdx = lines.length - 1;
            for (let lineIdx in render) {
                if (+lineIdx !== 0) {
                    lines[newMaxIdx + +lineIdx] = new RichCharGrid([[]]);
                }
                lines[newMaxIdx + +lineIdx].mergeX(render[+lineIdx], 'end');
            }
        }
        throw new Error("Something unexpected happened: Provided nextNode was not among my children!");
    }
    render(attributes, inheritMe) {
        const fillChar = new RichChar(attributes.fillChar, attributes).noSize();
        const lines = [new RichCharGrid([[]])];
        for (let child of this.children) {
            const render = child.renderLines(inheritMe, {
                width: attributes.width,
                forcedIndent: lines.at(-1).width,
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
}
