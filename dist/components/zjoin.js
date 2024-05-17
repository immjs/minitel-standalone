"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZJoin = void 0;
const minitelobject_js_1 = require("../abstract/minitelobject.js");
const richchar_js_1 = require("../richchar.js");
const richchargrid_js_1 = require("../richchargrid.js");
class ZJoin extends minitelobject_js_1.MinitelObject {
    constructor(children, attributes, minitel) {
        super(children, attributes, minitel);
        this.defaultAttributes = ZJoin.defaultAttributes;
    }
    render(attributes, inheritMe) {
        const fillChar = new richchar_js_1.RichChar(attributes.fillChar, attributes).noSize();
        const transparentFillChar = new richchar_js_1.RichChar('\x09', attributes).noSize();
        if (this.children.length === 0)
            return new richchargrid_js_1.RichCharGrid();
        const renders = this.children.map((v) => v.renderWrapper(inheritMe, Object.assign({ width: attributes.width, height: attributes.height }, (attributes.inheritTransparency ? { fillChar: '\x09' } : {}))));
        const maxWidth = Math.max(...renders.map((v) => v.width));
        const maxHeight = Math.max(...renders.map((v) => v.height));
        const result = richchargrid_js_1.RichCharGrid.fill(maxWidth, maxHeight, fillChar);
        for (const render of renders) {
            render.setWidth(maxWidth, attributes.widthAlign, transparentFillChar);
            render.setHeight(maxHeight, attributes.heightAlign, transparentFillChar);
            for (const lineIdx in render.grid) {
                for (const colIdx in render.grid[lineIdx]) {
                    const char = render.grid[lineIdx][colIdx];
                    if (char.char !== '\x09') {
                        result.grid[lineIdx][colIdx] = char;
                    }
                }
            }
            result.mergeLocationDescriptors(render);
        }
        return result;
    }
}
exports.ZJoin = ZJoin;
ZJoin.defaultAttributes = Object.assign(Object.assign({}, minitelobject_js_1.MinitelObject.defaultAttributes), { widthAlign: 'start', heightAlign: 'start', inheritTransparency: false });
