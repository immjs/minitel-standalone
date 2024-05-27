"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const minitelobject_js_1 = require("../abstract/minitelobject.js");
const richchar_js_1 = require("../richchar.js");
const richchargrid_js_1 = require("../richchargrid.js");
const utils_js_1 = require("../utils.js");
class Input extends minitelobject_js_1.MinitelObject {
    constructor(children, attributes, minitel) {
        super(children, attributes, minitel);
        this.defaultAttributes = Input.defaultAttributes;
        this._value = '';
        this._focused = false;
        this.keepElmDesc = true;
        this._cursorActuallyAt = [0, 0];
        this._scrollDelta = [0, 0];
        this.lastFocusCursorX = 0;
        this.on('key', this.keyEventListener);
    }
    set value(newValue) {
        this._value = newValue;
        this.minitel.invalidateRender();
    }
    get value() {
        return this._value;
    }
    set cursorActuallyAt(newPos) {
        this._cursorActuallyAt = [newPos[0], newPos[1]];
        this.minitel.invalidateRender();
    }
    get cursorActuallyAt() {
        return this._cursorActuallyAt;
    }
    set scrollDelta(newDelta) {
        this._scrollDelta = [newDelta[0], newDelta[1]];
        this.minitel.invalidateRender();
    }
    get scrollDelta() {
        return this._scrollDelta;
    }
    set focused(val) {
        if (val) {
            if (this.minitel.focusedObj)
                this.minitel.focusedObj.focused = false;
            this.minitel.invalidateRender();
            this._focused = true;
        }
        else {
            this.minitel.invalidateRender();
            this._focused = false;
        }
    }
    get focused() {
        return this._focused;
    }
    constrainCursor() {
        this.cursorActuallyAt[0] = Math.min(this.cursorActuallyAt[0], this.value.split('\n').length - 1);
        this.cursorActuallyAt[0] = Math.max(this.cursorActuallyAt[0], 0);
        const currentLine = this.value.split('\n')[this.cursorActuallyAt[0]];
        this.cursorActuallyAt[1] = Math.min(this.lastFocusCursorX, currentLine.length);
        this.cursorActuallyAt[1] = Math.max(this.cursorActuallyAt[1], 0);
    }
    keyEventListener(key) {
        let currentLine;
        switch (key) {
            case '\x1b\x5b\x41': // up
                if (this.attributes.multiline) {
                    this.cursorActuallyAt[0] -= 1;
                    this.constrainCursor();
                    this.minitel.queueImmediateRenderToStream();
                }
                break;
            case '\x1b\x5b\x42': // down
                if (this.attributes.multiline) {
                    this.cursorActuallyAt[0] += 1;
                    this.constrainCursor();
                    this.minitel.queueImmediateRenderToStream();
                }
                break;
            case '\x1b\x5b\x43': // right
                this.cursorActuallyAt[1] += 1;
                currentLine = this.value.split('\n')[this.cursorActuallyAt[0]];
                if (this.cursorActuallyAt[1] > currentLine.length) {
                    if (this.cursorActuallyAt[0] < this.value.split('\n').length - 1) {
                        this.cursorActuallyAt[0] += 1;
                        this.cursorActuallyAt[1] = 0;
                    }
                }
                this.lastFocusCursorX = this.cursorActuallyAt[1];
                this.constrainCursor();
                this.minitel.queueImmediateRenderToStream();
                break;
            case '\x1b\x5b\x44': // left
                this.cursorActuallyAt[1] -= 1;
                if (this.cursorActuallyAt[1] < 0) {
                    if (this.cursorActuallyAt[0] > 0) {
                        this.cursorActuallyAt[0] -= 1;
                        currentLine = this.value.split('\n')[this.cursorActuallyAt[0]];
                        this.cursorActuallyAt[1] = currentLine.length;
                    }
                }
                this.lastFocusCursorX = this.cursorActuallyAt[1];
                this.constrainCursor();
                this.minitel.queueImmediateRenderToStream();
                break;
            default:
                if (/^[a-zA-Z0-9,\.';\-\:?!"#$%&\(\)\[\]<>@+=*/ ]$/g.test(key) || (key === '\x0d' && this.attributes.multiline)) {
                    const lines = this.value.split('\n');
                    let cumulPosition = lines.filter((_, i) => i < this.cursorActuallyAt[0]).reduce((p, v) => p + v.length + 1, 0);
                    cumulPosition += this.cursorActuallyAt[1];
                    const chars = this.value.split('');
                    chars.splice(cumulPosition, 0, key === '\x0d' ? '\n' : key);
                    this.value = chars.join('');
                    if (key === '\x0d') {
                        this.cursorActuallyAt[1] = 0;
                        this.cursorActuallyAt[0] += 1;
                    }
                    else {
                        this.cursorActuallyAt[1] += 1;
                    }
                    this.lastFocusCursorX = this.cursorActuallyAt[1];
                    if (this.attributes.onChange)
                        this.attributes.onChange(this.value, this);
                }
                else if (key === '\x13\x47') {
                    if (this.cursorActuallyAt[0] !== 0 || this.cursorActuallyAt[1] !== 0) {
                        if (this.cursorActuallyAt[1] === 0) {
                            const lines = this.value.split('\n');
                            this.cursorActuallyAt[0] -= 1;
                            this.cursorActuallyAt[1] = lines[this.cursorActuallyAt[0]].length;
                        }
                        else {
                            this.cursorActuallyAt[1] -= 1;
                        }
                        this.lastFocusCursorX = this.cursorActuallyAt[1];
                        const lines = this.value.split('\n');
                        let cumulPosition = lines.filter((_, i) => i < this.cursorActuallyAt[0]).reduce((p, v) => p + v.length + 1, 0);
                        cumulPosition += this.cursorActuallyAt[1];
                        const chars = this.value.split('');
                        chars.splice(cumulPosition, 1);
                        this.value = chars.join('');
                    }
                    if (this.attributes.onChange)
                        this.attributes.onChange(this.value, this);
                }
                this.constrainCursor();
                this.minitel.queueImmediateRenderToStream();
        }
    }
    unmount() {
        this.off('key', this.keyEventListener);
    }
    render(attributes, inheritMe) {
        const fillChar = new richchar_js_1.RichChar(attributes.fillChar, attributes).noSize();
        // TODO: fix types
        const lines = {
            text: this.value.split('\n'),
            password: this.value.split('\n').map((line) => '-'.repeat(line.length)),
        }[attributes.type];
        const result = new richchargrid_js_1.RichCharGrid([]);
        const concreteWidth = Math.max(...lines.map((v) => v.length));
        for (let line of lines) {
            result.mergeY(richchargrid_js_1.RichCharGrid.fromLine(line, attributes).setWidth(concreteWidth, utils_js_1.alignInvrt[attributes.textAlign], fillChar));
        }
        const oldScrollDelta = [this.scrollDelta[0], this.scrollDelta[1]];
        if (attributes.height != null) {
            if (this.scrollDelta[0] > this.cursorActuallyAt[0]) {
                this.scrollDelta[0] = this.cursorActuallyAt[0];
            }
            if (this.scrollDelta[0] < this.cursorActuallyAt[0] - attributes.height + 1) {
                this.scrollDelta[0] = this.cursorActuallyAt[0] - attributes.height + 1;
            }
            this.scrollDelta[0] = Math.max(this.scrollDelta[0], 0);
            result.setHeight(this.scrollDelta[0] + attributes.height, 'end', fillChar);
            result.setHeight(attributes.height, 'start', fillChar);
        }
        if (attributes.width != null) {
            if (this.cursorActuallyAt[1] - 4 < this.scrollDelta[1]) {
                this.scrollDelta[1] = this.cursorActuallyAt[1] - 4;
            }
            if (this.scrollDelta[1] < this.cursorActuallyAt[1] - attributes.width + 1) {
                this.scrollDelta[1] = this.cursorActuallyAt[1] - attributes.width + 1;
            }
            this.scrollDelta[1] = Math.max(this.scrollDelta[1], 0);
            result.setWidth(this.scrollDelta[1] + attributes.width, 'end', fillChar);
            result.setWidth(attributes.width, 'start', fillChar);
        }
        if (oldScrollDelta[0] !== this.scrollDelta[0] || oldScrollDelta[1] !== this.scrollDelta[1]) {
            attributes.onScroll([...this.scrollDelta]);
        }
        return result;
    }
    get focusCursorAt() {
        return [this.cursorActuallyAt[0] - this.scrollDelta[0], this.cursorActuallyAt[1] - this.scrollDelta[1]];
    }
    get disabled() {
        return this.attributes.disabled || false;
    }
}
exports.Input = Input;
Input.defaultAttributes = Object.assign(Object.assign({}, minitelobject_js_1.MinitelObject.defaultAttributes), { fillChar: '.', width: 8, height: 1, type: 'text', autofocus: false, disabled: false, multiline: false, onChange: () => { }, onScroll: () => { } });
