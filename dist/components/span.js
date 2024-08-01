import { MinitelObject } from "../abstract/minitelobject.js";
import { RichChar } from "../richchar.js";
import { RichCharGrid } from "../richchargrid.js";
import { alignInvrt, inheritedProps } from "../utils.js";
export class Span extends MinitelObject {
    constructor(children, attributes, minitel) {
        super([], attributes, minitel);
        this.children = [];
        for (let child of children) {
            this.appendChild(child);
        }
    }
    getDimensions(attributes, inheritMe) {
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
        return { width, height: lines.reduce((p, v) => p + v.height, 0) };
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
    renderLines(inheritedAttributes, forcedAttributes) {
        const attributes = Object.assign(Object.assign(Object.assign(Object.assign({}, this.defaultAttributes), inheritedAttributes), this.attributes), forcedAttributes);
        const inheritMe = inheritedProps(Object.assign(Object.assign(Object.assign({}, inheritedAttributes), this.attributes), forcedAttributes));
        // const fillChar = new RichChar(attributes.fillChar, attributes).noSize();
        const lines = [new RichCharGrid([[]])];
        let isFirstChild = true;
        for (let child of this.children) {
            const render = child.renderLines(inheritMe, {
                width: attributes.width,
                forcedIndent: isFirstChild ? attributes.forcedIndent : lines.at(-1).width,
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
