"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scrollable = void 0;
const richchar_js_1 = require("../richchar.js");
const richchargrid_js_1 = require("../richchargrid.js");
const container_js_1 = require("./container.js");
class Scrollable extends container_js_1.Container {
    blink() {
        if (this.artificialBlink)
            clearTimeout(this.artificialBlink);
        this.artificialBlink = setTimeout(this.blinkHandler.bind(this), this.attributes.blinkPeriod || Scrollable.defaultAttributes.blinkPeriod);
    }
    get scrollDelta() {
        return this._scrollDelta;
    }
    set focused(val) {
        if (this._focused !== val)
            this.minitel.invalidateRender();
        if (val) {
            if (this.minitel.focusedObj)
                this.minitel.focusedObj.focused = false;
            this._focused = true;
        }
        else {
            this._focused = false;
        }
    }
    get focused() {
        return this._focused;
    }
    blinkHandler() {
        if (this.focused || !this.blinkShown) {
            if (this.focused) {
                this.blinkShown = !this.blinkShown;
            }
            else {
                this.blinkShown = true;
            }
            this.minitel.queueImmediateRenderToStream();
        }
        this.blink();
    }
    constructor(children = [], attributes, minitel) {
        super(children, attributes, minitel);
        this.defaultAttributes = Scrollable.defaultAttributes;
        this._focused = false;
        this.keepElmDesc = true;
        this.prevScrollDelta = null;
        this._scrollDelta = [0, 0];
        this.artificialBlink = null;
        this.blinkShown = true;
        this.blink();
        this.on('key', this.keyEventListener);
    }
    pushPrevScrollDelta() {
        this.prevScrollDelta = [this.scrollDelta[0], this.scrollDelta[1]];
    }
    popPrevScrollDelta(callback) {
        if (this.prevScrollDelta == null)
            return;
        if (this.prevScrollDelta[0] !== this.scrollDelta[0] || this.prevScrollDelta[1] !== this.scrollDelta[1]) {
            callback([this.scrollDelta[0], this.scrollDelta[1]]);
        }
        this.prevScrollDelta = null;
    }
    keyEventListener(str) {
        if (!(['\x1b\x5b\x41', '\x1b\x5b\x42', '\x1b\x5b\x43', '\x1b\x5b\x44'].includes(str)))
            return;
        this.pushPrevScrollDelta();
        switch (str) {
            case '\x1b\x5b\x41': // up
                if (this.attributes.overflowY !== 'hidden' && !this.disabled)
                    this.scrollDelta[0] -= 1;
                break;
            case '\x1b\x5b\x42': // down
                if (this.attributes.overflowY !== 'hidden' && !this.disabled)
                    this.scrollDelta[0] += 1;
                break;
            case '\x1b\x5b\x43': // right
                if (this.attributes.overflowX !== 'hidden' && !this.disabled)
                    this.scrollDelta[1] += 1;
                break;
            case '\x1b\x5b\x44': // left
                if (this.attributes.overflowX !== 'hidden' && !this.disabled)
                    this.scrollDelta[1] -= 1;
                break;
        }
        this.minitel.queueImmediateRenderToStream();
    }
    unmount() {
        this.off('key', this.keyEventListener);
        if (this.artificialBlink)
            clearTimeout(this.artificialBlink);
    }
    render(attributes, inheritMe) {
        // now its 3 am and i don't know how i'll read back
        // this code it's such a mess
        const fillChar = new richchar_js_1.RichChar(attributes.fillChar, attributes);
        let render;
        let autoedX = false;
        let autoedY = false;
        if (attributes.width == null && attributes.height == null) {
            render = super.render(attributes, inheritMe);
        }
        else if (attributes.overflowY !== 'hidden') {
            if (attributes.height == null) {
                render = super.render(attributes, inheritMe);
            }
            else {
                if (attributes.overflowY === 'auto') {
                    const possibleRender = super.render(Object.assign(Object.assign({}, attributes), { width: attributes.overflowX === 'hidden' ? attributes.width : null, height: null }), inheritMe);
                    if (possibleRender.height <= attributes.height) {
                        render = possibleRender;
                        autoedY = true;
                    }
                }
                if (!autoedY) {
                    const width = attributes.width != null && attributes.overflowX === 'hidden'
                        ? attributes.width - 1
                        : null;
                    render = super.render(Object.assign(Object.assign({}, attributes), { width, height: null }), inheritMe);
                }
            }
        }
        else {
            if (attributes.width == null) {
                render = super.render(attributes, inheritMe);
            }
            else {
                if (attributes.overflowX === 'auto') {
                    const possibleRender = super.render(Object.assign(Object.assign({}, attributes), { height: attributes.height, width: null }), inheritMe);
                    if (possibleRender.width <= attributes.width) {
                        render = possibleRender;
                        autoedX = true;
                    }
                }
                if (!autoedX) {
                    const height = attributes.height != null ? attributes.height - 1 : null;
                    render = super.render(Object.assign(Object.assign({}, attributes), { height, width: null }), inheritMe);
                }
            }
        }
        const finalRender = render; // Source: Trust me bro
        const originalWidth = finalRender.width;
        const originalHeight = finalRender.height;
        const maxScrollSizeX = attributes.overflowY !== 'hidden' && attributes.overflowY !== 'noscrollbar' && !autoedY && attributes.width != null
            ? attributes.width - 1
            : attributes.width; // Area available for scroll for bottom scroll bar
        const scrollbarSizeX = attributes.width && Math.max(Math.floor(maxScrollSizeX * maxScrollSizeX / originalWidth), 1);
        this.scrollDelta[1] = Math.max(0, Math.min(this.scrollDelta[1], (originalWidth - maxScrollSizeX) || 0));
        const maxScrollSizeY = attributes.overflowX !== 'hidden' && attributes.overflowX !== 'noscrollbar' && !autoedX && attributes.height != null
            ? attributes.height - 1
            : attributes.height; // Area available for scroll for right scroll bar\
        const scrollbarSizeY = attributes.height && Math.max(Math.floor(maxScrollSizeY * maxScrollSizeY / originalHeight), 1);
        this.scrollDelta[0] = Math.max(0, Math.min(this.scrollDelta[0], (originalHeight - maxScrollSizeY) || 0));
        if (attributes.height != null) {
            finalRender.setHeight(originalHeight - this.scrollDelta[0], 'start', fillChar);
            // console.log(originalHeight - this.scrollDeltaY, finalRender.toString());
            finalRender.setHeight(maxScrollSizeY, 'end', fillChar);
        }
        if (attributes.width != null) {
            finalRender.setWidth(originalWidth - this.scrollDelta[1], 'start', fillChar);
            finalRender.setWidth(maxScrollSizeX, 'end', fillChar);
        }
        const scrollChar = new richchar_js_1.RichChar('\x7f', Object.assign(Object.assign({}, attributes), { fg: this.blinkShown ? attributes.scrollbarColor : attributes.scrollbarBackColor }));
        const scrollBackChar = new richchar_js_1.RichChar('\x7f', Object.assign(Object.assign({}, attributes), { fg: attributes.scrollbarBackColor }));
        if (attributes.overflowY !== 'hidden' && attributes.overflowY !== 'noscrollbar' && !autoedY && attributes.height != null) {
            const percentageScrolled = this.scrollDelta[0] / (originalHeight - maxScrollSizeY);
            const scrollbarOffset = Math.floor((maxScrollSizeY - scrollbarSizeY) * percentageScrolled);
            let rightScrollbar;
            if (originalHeight - maxScrollSizeY === 0 && attributes.overflowY === 'pad') {
                rightScrollbar = richchargrid_js_1.RichCharGrid.fill(1, finalRender.height, fillChar);
            }
            else {
                rightScrollbar = richchargrid_js_1.RichCharGrid.fill(1, scrollbarSizeY, scrollChar);
                rightScrollbar.setHeight(scrollbarSizeY + scrollbarOffset, 'start', scrollBackChar);
                rightScrollbar.setHeight(finalRender.height, 'end', scrollBackChar);
            }
            finalRender.mergeX(rightScrollbar);
        }
        if (attributes.overflowX !== 'hidden' && attributes.overflowX !== 'noscrollbar' && !autoedX && attributes.width != null) {
            const percentageScrolled = this.scrollDelta[1] / (originalWidth - maxScrollSizeX);
            const scrollbarOffset = Math.floor((maxScrollSizeX - scrollbarSizeX) * percentageScrolled);
            let bottomScrollbar;
            if (originalWidth - maxScrollSizeX === 0 && attributes.overflowX === 'pad') {
                bottomScrollbar = richchargrid_js_1.RichCharGrid.fill(finalRender.width, 1, fillChar);
            }
            else {
                bottomScrollbar = richchargrid_js_1.RichCharGrid.fill(scrollbarSizeX, 1, scrollChar);
                bottomScrollbar.setWidth(scrollbarSizeX + scrollbarOffset, 'start', scrollBackChar);
                bottomScrollbar.setWidth(finalRender.height, 'end', scrollBackChar);
            }
            finalRender.mergeY(bottomScrollbar);
        }
        // if (this.focused) this.blink();
        this.popPrevScrollDelta(attributes.onScroll);
        return finalRender;
    }
    get disabled() {
        return this.attributes.disabled || false;
    }
}
exports.Scrollable = Scrollable;
Scrollable.defaultAttributes = Object.assign(Object.assign({}, container_js_1.Container.defaultAttributes), { overflowX: 'hidden', overflowY: 'auto', autofocus: false, disabled: false, scrollbarBackColor: 5, scrollbarColor: 7, blinkPeriod: 500, onScroll: () => { } });
