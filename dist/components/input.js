"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const minitelobject_js_1 = require("../abstract/minitelobject.js");
const richchar_js_1 = require("../richchar.js");
const richchargrid_js_1 = require("../richchargrid.js");
class Input extends minitelobject_js_1.MinitelObject {
    constructor(children, attributes, minitel) {
        super(children, attributes, minitel);
        this.defaultAttributes = Input.defaultAttributes;
        this.value = '';
        this.focused = false;
        this.disabled = false;
        this.keepElmDesc = true;
        this.cursorActuallyAt = [0, 0];
        this.scrollInternal = [0, 0];
        this.lastFocusCursorX = 0;
        this.on('key', this.keyEventListener);
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
                if (/^[a-zA-Z0-9,\.';\-\:?!"#$%&\(\)\[\]<>@+=*/\x0d ]$/g.test(key)) {
                    this.cursorActuallyAt[1] += 1;
                    this.lastFocusCursorX = this.cursorActuallyAt[1];
                    const lines = this.value.split('\n');
                    let cumulPosition = lines.filter((_, i) => i < this.cursorActuallyAt[0] - 1).reduce((p, v) => p + v.length + 1, 0);
                    cumulPosition += this.cursorActuallyAt[1];
                    const chars = this.value.split('');
                    chars.splice(cumulPosition, 0, key === '\x0d' ? '\n' : key);
                    if (key === '\x0d') {
                        this.lastFocusCursorX = this.cursorActuallyAt[1] = 0;
                        this.cursorActuallyAt[0] += 1;
                    }
                    this.value = chars.join('');
                    if (this.attributes.onChange)
                        this.attributes.onChange(this);
                }
                else if (key === '\x13\x47') {
                    if (this.cursorActuallyAt[0] !== 0 || this.cursorActuallyAt[1] !== 0) {
                        this.cursorActuallyAt[1] -= 1;
                        this.lastFocusCursorX = this.cursorActuallyAt[1];
                        const lines = this.value.split('\n');
                        let cumulPosition = lines.filter((_, i) => i < this.cursorActuallyAt[0] - 1).reduce((p, v) => p + v.length + 1, 0);
                        cumulPosition += this.cursorActuallyAt[1];
                        const chars = this.value.split('');
                        chars.splice(cumulPosition, 1);
                        this.value = chars.join('');
                    }
                    if (this.attributes.onChange)
                        this.attributes.onChange(this);
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
            result.mergeY(richchargrid_js_1.RichCharGrid.fromLine(line, attributes).setWidth(concreteWidth, attributes.textAlign, fillChar));
        }
        if (attributes.height != null) {
            if (this.scrollInternal[0] > this.cursorActuallyAt[0]) {
                this.scrollInternal[0] = this.cursorActuallyAt[0];
            }
            if (this.scrollInternal[0] + attributes.height < this.cursorActuallyAt[0]) {
                this.scrollInternal[0] = this.cursorActuallyAt[0] - attributes.height;
            }
            this.scrollInternal[0] = Math.min(Math.max(this.scrollInternal[0], 0), lines.length);
            result.setHeight(this.scrollInternal[0] + attributes.height, 'end', fillChar);
            result.setHeight(attributes.height, 'start', fillChar);
        }
        if (attributes.width != null) {
            if (this.scrollInternal[1] > this.cursorActuallyAt[1] - 4) {
                this.scrollInternal[1] = this.cursorActuallyAt[1] - 4;
            }
            if (this.scrollInternal[1] + attributes.width < this.cursorActuallyAt[1] + 2) {
                this.scrollInternal[1] = this.cursorActuallyAt[1] - attributes.width + 2;
            }
            this.scrollInternal[1] = Math.min(Math.max(this.scrollInternal[1], 0), lines[this.cursorActuallyAt[0]].length);
            result.setWidth(this.scrollInternal[1] + attributes.width, 'end', fillChar);
            result.setWidth(attributes.width, 'start', fillChar);
        }
        return result;
    }
    get focusCursorAt() {
        return [this.cursorActuallyAt[0] - this.scrollInternal[0], this.cursorActuallyAt[1] - this.scrollInternal[1]];
    }
}
exports.Input = Input;
Input.defaultAttributes = Object.assign(Object.assign({}, minitelobject_js_1.MinitelObject.defaultAttributes), { fillChar: '.', width: 8, height: 1, type: 'text', autofocus: false, multiline: false, onChange: () => { } });
