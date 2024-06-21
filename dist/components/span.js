"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Span = void 0;
const minitelobject_1 = require("../abstract/minitelobject");
const richchar_1 = require("../richchar");
const richchargrid_1 = require("../richchargrid");
const utils_1 = require("../utils");
class Span extends minitelobject_1.MinitelObject {
    constructor(children, attributes, minitel) {
        super([], attributes, minitel);
        this.children = [];
        for (let child of children) {
            this.appendChild(child);
        }
    }
    getDimensions(attributes, inheritMe) {
        const lines = [new richchargrid_1.RichCharGrid([[]])];
        for (let child of this.children) {
            const render = child.renderLines(inheritMe, {
                width: attributes.width,
                forcedIndent: lines.at(-1).width,
            });
            const newMaxIdx = lines.length - 1;
            for (let lineIdx in render) {
                if (+lineIdx !== 0) {
                    lines[newMaxIdx + +lineIdx] = new richchargrid_1.RichCharGrid([[]]);
                }
                lines[newMaxIdx + +lineIdx].mergeX(render[+lineIdx], 'end');
            }
        }
        const width = attributes.width || Math.max(...lines.map((v) => v.width));
        return { width, height: lines.reduce((p, v) => p + v.height, 0) };
    }
    render(attributes, inheritMe) {
        const fillChar = new richchar_1.RichChar(attributes.fillChar, attributes).noSize();
        const lines = [new richchargrid_1.RichCharGrid([[]])];
        for (let child of this.children) {
            const render = child.renderLines(inheritMe, {
                width: attributes.width,
                forcedIndent: lines.at(-1).width,
            });
            const newMaxIdx = lines.length - 1;
            for (let lineIdx in render) {
                if (+lineIdx !== 0) {
                    lines[newMaxIdx + +lineIdx] = new richchargrid_1.RichCharGrid([[]]);
                }
                lines[newMaxIdx + +lineIdx].mergeX(render[+lineIdx], 'end');
            }
        }
        const width = attributes.width || Math.max(...lines.map((v) => v.width));
        const result = new richchargrid_1.RichCharGrid([]);
        for (let line of lines) {
            line.setWidth(width, utils_1.alignInvrt[attributes.textAlign], fillChar);
            result.mergeY(line);
        }
        if (attributes.height) {
            result.setHeight(attributes.height, 'end', fillChar);
        }
        return result;
    }
    renderLines(inheritedAttributes, forcedAttributes) {
        const attributes = Object.assign(Object.assign(Object.assign(Object.assign({}, this.defaultAttributes), inheritedAttributes), this.attributes), forcedAttributes);
        const inheritMe = (0, utils_1.inheritedProps)(Object.assign(Object.assign(Object.assign({}, inheritedAttributes), this.attributes), forcedAttributes));
        // const fillChar = new RichChar(attributes.fillChar, attributes).noSize();
        const lines = [new richchargrid_1.RichCharGrid([[]])];
        let isFirstChild = true;
        for (let child of this.children) {
            const render = child.renderLines(inheritMe, {
                width: attributes.width,
                forcedIndent: isFirstChild ? attributes.forcedIndent : lines.at(-1).width,
            });
            const newMaxIdx = lines.length - 1;
            for (let lineIdx in render) {
                if (+lineIdx !== 0) {
                    lines[newMaxIdx + +lineIdx] = new richchargrid_1.RichCharGrid([[]]);
                }
                lines[newMaxIdx + +lineIdx].mergeX(render[+lineIdx], 'end');
            }
            isFirstChild = false;
        }
        return lines;
    }
}
exports.Span = Span;
