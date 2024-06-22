"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinitelObject = void 0;
const node_events_1 = require("node:events");
const richchar_js_1 = require("../richchar.js");
const richchargrid_js_1 = require("../richchargrid.js");
const utils_js_1 = require("../utils.js");
const locationdescriptor_js_1 = require("../locationdescriptor.js");
const invalidrender_js_1 = require("./invalidrender.js");
class MinitelObject extends node_events_1.EventEmitter {
    getDimensions(attributes, inheritMe) {
        const tempRender = this.render(attributes, inheritMe);
        return { width: tempRender.width, height: tempRender.height };
    }
    getDimensionsWrapper(inheritedAttributes, forcedAttributes) {
        const attributes = Object.assign(Object.assign(Object.assign(Object.assign({}, this.defaultAttributes), inheritedAttributes), this.attributes), forcedAttributes);
        const pad = utils_js_1.padding.normalise(attributes.pad);
        attributes.width = attributes.width != null ? utils_js_1.padding.exludeX(attributes.width, pad) : null;
        attributes.height = attributes.height != null ? utils_js_1.padding.exludeY(attributes.height, pad) : null;
        let result = { width: -1, height: -1 };
        if (!attributes.height || !attributes.width) {
            result = this.getDimensions(attributes, (0, utils_js_1.inheritedProps)(Object.assign(Object.assign(Object.assign({}, inheritedAttributes), this.attributes), forcedAttributes)));
        }
        if (attributes.width)
            result.width = attributes.width;
        if (attributes.height)
            result.height = attributes.height;
        result.height += pad[0] + pad[2];
        result.width += pad[1] + pad[3];
        return result;
    }
    constructor(children, attributes, minitel) {
        super();
        this.keepElmDesc = false;
        this.defaultAttributes = MinitelObject.defaultAttributes;
        this.children = [];
        this.minitel = minitel;
        for (let child of children) {
            this.appendChild(child);
        }
        this.attributes = new Proxy(attributes, {
            set: (function (target, prop, val) {
                const oldTP = target[prop];
                target[prop] = val;
                if (val !== oldTP)
                    this.minitel.invalidateRender();
                return true;
            }).bind(this),
        });
    }
    appendChild(child) {
        child.parent = this;
        this.children.push(child);
    }
    insertBeforeChild(child, beforeChild) {
        child.parent = this;
        const index = this.children.indexOf(beforeChild);
        this.children.splice(index, 0, child);
    }
    removeChild(child) {
        child.parent = undefined;
        const index = this.children.indexOf(child);
        this.children.splice(index, 1);
    }
    render(attributes, inheritMe) {
        throw new Error('MinitelObject has no render');
    }
    renderWrapper(inheritedAttributes, forcedAttributes) {
        const attributes = Object.assign(Object.assign(Object.assign(Object.assign({}, this.defaultAttributes), inheritedAttributes), this.attributes), forcedAttributes);
        const pad = utils_js_1.padding.normalise(attributes.pad);
        attributes.width = attributes.width != null ? utils_js_1.padding.exludeX(attributes.width, pad) : null;
        attributes.height = attributes.height != null ? utils_js_1.padding.exludeY(attributes.height, pad) : null;
        const fillChar = new richchar_js_1.RichChar(attributes.fillChar, attributes).noSize();
        let result = this.render(attributes, (0, utils_js_1.inheritedProps)(Object.assign(Object.assign(Object.assign({}, inheritedAttributes), this.attributes), forcedAttributes)));
        if (this.minitel.renderInvalidated) {
            throw new invalidrender_js_1.InvalidRender();
        }
        if (!attributes.visible) {
            result = richchargrid_js_1.RichCharGrid.fill(attributes.width || 0, attributes.height || 0, fillChar);
        }
        if (attributes.width != null)
            result.setWidth(attributes.width, 'end');
        if (attributes.height != null)
            result.setHeight(attributes.height, 'end');
        // Descriptor before pad, is this the right choice?
        if (this.keepElmDesc)
            result.locationDescriptors.add(this, new locationdescriptor_js_1.LocationDescriptor(0, 0, result.width, result.height));
        result.pad(pad, fillChar);
        return result;
    }
    focusables() {
        const isFocusable = (v) => 'disabled' in v;
        return this.children.flatMap((v) => {
            const focusables = [];
            if (isFocusable(v) && !v.disabled)
                focusables.push(v);
            focusables.push(...v.focusables());
            return focusables;
        });
    }
    unmount() { }
    unmountWrapper() {
        this.children.forEach((v) => v.unmountWrapper());
        this.unmount();
    }
    has(child) {
        return this.children.includes(child) || this.children.some((v) => v.has(child));
    }
}
exports.MinitelObject = MinitelObject;
MinitelObject.defaultAttributes = {
    width: null,
    height: null,
    fillChar: ' ',
    textAlign: 'start',
    wrap: 'clip',
    flexGrow: 0,
    pad: 0,
    visible: true,
};
