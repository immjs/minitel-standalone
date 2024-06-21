"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextNode = void 0;
const minitelobject_js_1 = require("./minitelobject.js");
const richchargrid_js_1 = require("../richchargrid.js");
const word_wrap_1 = __importDefault(require("word-wrap"));
const richchar_js_1 = require("../richchar.js");
class TextNode extends minitelobject_js_1.MinitelObject {
    constructor(text, attributes, minitel) {
        super([], attributes, minitel);
        this.text = text;
    }
    getDimensions(attributes, inheritMe) {
        let text = this.text;
        const width = attributes.width;
        const xScalingFactor = attributes.doubleWidth ? 2 : 1;
        const yScalingFactor = attributes.doubleHeight ? 2 : 1;
        if (width != null) {
            const actualWidth = Math.floor(width / xScalingFactor);
            switch (attributes.wrap) {
                case 'word-break':
                    text = (0, word_wrap_1.default)(text, { indent: '', width: actualWidth, cut: true });
                    break;
                case 'word-wrap':
                    text = (0, word_wrap_1.default)(text, { indent: '', width: actualWidth });
                    break;
                case 'clip':
                    text = text.split('\n').map((v) => v.slice(0, actualWidth)).join('\n');
                    break;
            }
        }
        const lines = text.split(/\r?\n/g);
        const concreteWidth = Math.max(...lines.map((v) => v.length * xScalingFactor));
        return { width: concreteWidth, height: lines.length * yScalingFactor };
    }
    render(attributes, inheritMe) {
        let text = this.text;
        const width = attributes.width;
        const xScalingFactor = attributes.doubleWidth ? 2 : 1;
        if (width != null) {
            const actualWidth = Math.floor(width / xScalingFactor);
            switch (attributes.wrap) {
                case 'word-break':
                    text = (0, word_wrap_1.default)(text, { indent: '', width: actualWidth, cut: true });
                    break;
                case 'word-wrap':
                    text = (0, word_wrap_1.default)(text, { indent: '', width: actualWidth });
                    break;
                case 'clip':
                    text = text.split('\n').map((v) => v.slice(0, actualWidth)).join('\n');
                    break;
            }
        }
        const result = new richchargrid_js_1.RichCharGrid();
        const lines = text.split(/\r?\n/g);
        const concreteWidth = Math.max(...lines.map((v) => v.length * xScalingFactor));
        const fillChar = new richchar_js_1.RichChar(attributes.fillChar, attributes).noSize();
        for (let line of lines) {
            result.mergeY(richchargrid_js_1.RichCharGrid.fromLine(line, attributes).setWidth(concreteWidth, attributes.textAlign, fillChar));
        }
        return result;
    }
    renderLines(inheritedAttributes, forcedAttributes) {
        const attributes = Object.assign(Object.assign(Object.assign(Object.assign({}, this.defaultAttributes), inheritedAttributes), this.attributes), forcedAttributes);
        let text = ' '.repeat(attributes.forcedIndent || 0) + this.text;
        const width = attributes.width;
        const xScalingFactor = attributes.doubleWidth ? 2 : 1;
        if (width != null) {
            const actualWidth = Math.floor(width / xScalingFactor);
            switch (attributes.wrap) {
                case 'word-break':
                    text = (0, word_wrap_1.default)(text, { indent: '', width: actualWidth, cut: true });
                    break;
                case 'word-wrap':
                    text = (0, word_wrap_1.default)(text, { indent: '', width: actualWidth });
                    break;
                case 'clip':
                    text = text.split('\n').map((v) => v.slice(0, actualWidth)).join('\n');
                    break;
            }
        }
        text = text.slice(attributes.forcedIndent);
        const result = [];
        const lines = text.split(/\r?\n/g);
        for (let line of lines) {
            result.push(richchargrid_js_1.RichCharGrid.fromLine(line, attributes));
        }
        return result;
    }
}
exports.TextNode = TextNode;
