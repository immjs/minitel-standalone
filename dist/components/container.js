"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const minitelobject_js_1 = require("../abstract/minitelobject.js");
const richchar_js_1 = require("../richchar.js");
const singleton_js_1 = require("../singleton.js");
const utils_js_1 = require("../utils.js");
class Container extends minitelobject_js_1.MinitelObject {
    constructor(children = [], attributes, minitel) {
        if (children.length > 1)
            throw new Error('Container must only include one element');
        super([], attributes, minitel);
        this.defaultAttributes = Container.defaultAttributes;
        this.children = new singleton_js_1.SingletonArray();
        if (children[0])
            this.appendChild(children[0]);
    }
    render(attributes, inheritMe) {
        const fillChar = new richchar_js_1.RichChar(attributes.fillChar, attributes).noSize();
        const render = this.children[0].renderWrapper(inheritMe, Object.assign(Object.assign({}, (attributes.width != null ? { width: attributes.width } : {})), (attributes.height != null ? { height: attributes.height } : {})));
        if (attributes.height)
            render.setHeight(attributes.height, utils_js_1.alignInvrt[attributes.heightAlign], fillChar);
        if (attributes.width)
            render.setWidth(attributes.width, utils_js_1.alignInvrt[attributes.widthAlign], fillChar);
        // console.log({ width: attributes.width, height: attributes.height, render: render.toString() })
        return render;
    }
}
exports.Container = Container;
Container.defaultAttributes = Object.assign(Object.assign({}, minitelobject_js_1.MinitelObject.defaultAttributes), { widthAlign: 'start', heightAlign: 'start' });
