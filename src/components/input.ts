import { Focusable, FocusableAttributes } from '../abstract/focusable.js';
import { MinitelObject } from '../abstract/minitelobject.js';
import { RichChar } from '../richchar.js';
import { RichCharGrid } from '../richchargrid.js';
import { alignInvrt } from '../utils.js';
import type { Minitel } from './minitel.js';
import { Scrollable, ScrollableAttributes } from './scrollable.js';

export class Input
    extends MinitelObject<InputAttributes, { key: [string] }>
    implements Focusable
{
    static defaultAttributes: InputAttributes = {
        ...MinitelObject.defaultAttributes,
        fillChar: '.',
        width: 8,
        height: 1,
        type: 'text',
        autofocus: false,
        disabled: false,
        multiline: false,
        onChange: () => {},
        onScroll: () => {},
    };
    defaultAttributes = Input.defaultAttributes;
    value = '';
    focused = false;
    keepElmDesc = true as const;
    cursorActuallyAt = [0, 0] as [number, number];
    scrollDelta = [0, 0] as [number, number];
    lastFocusCursorX = 0;
    constructor(
        children: [],
        attributes: Partial<InputAttributes>,
        minitel: Minitel,
    ) {
        super(children, attributes, minitel);
        
        this.on('key', this.keyEventListener);
    }
    constrainCursor() {
        this.cursorActuallyAt[0] = Math.min(
            this.cursorActuallyAt[0],
            this.value.split('\n').length - 1,
        );
        this.cursorActuallyAt[0] = Math.max(this.cursorActuallyAt[0], 0);

        const currentLine = this.value.split('\n')[this.cursorActuallyAt[0]];
        this.cursorActuallyAt[1] = Math.min(
            this.lastFocusCursorX,
            currentLine.length,
        );
        this.cursorActuallyAt[1] = Math.max(this.cursorActuallyAt[1], 0);
    }
    keyEventListener(key: string) {
        let currentLine: string;
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
                    } else {
                        this.cursorActuallyAt[1] += 1;
                    }
                    this.lastFocusCursorX = this.cursorActuallyAt[1];

                    if (this.attributes.onChange) this.attributes.onChange(this.value, this);
                } else if (key === '\x13\x47') {
                    if (this.cursorActuallyAt[0] !== 0 || this.cursorActuallyAt[1] !== 0) {
                        if (this.cursorActuallyAt[1] === 0) {
                            const lines = this.value.split('\n');
                            this.cursorActuallyAt[0] -= 1;
                            this.cursorActuallyAt[1] = lines[this.cursorActuallyAt[0]].length;
                        } else {
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
    
                    if (this.attributes.onChange) this.attributes.onChange(this.value, this);
                }
                this.constrainCursor();
                this.minitel.queueImmediateRenderToStream();
        }
    }
    unmount() {
        this.off('key', this.keyEventListener);
    }
    render(attributes: InputAttributes, inheritMe: Partial<InputAttributes>) {
        const fillChar = new RichChar(attributes.fillChar, attributes).noSize();
        
        // TODO: fix types
        const lines = {
            text: this.value.split('\n'),
            password: this.value.split('\n').map((line) => '-'.repeat(line.length)),
        }[attributes.type];
        const result = new RichCharGrid([]);
        const concreteWidth = Math.max(...lines.map((v) => v.length));
        for (let line of lines) {
            result.mergeY(RichCharGrid.fromLine(line, attributes).setWidth(concreteWidth, alignInvrt[attributes.textAlign], fillChar));
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
        return [this.cursorActuallyAt[0] - this.scrollDelta[0], this.cursorActuallyAt[1] - this.scrollDelta[1]] as [number, number];
    }
    get disabled() {
        return this.attributes.disabled || false;
    }
}

export interface InputAttributes extends FocusableAttributes {
    type: 'text' | 'password';
    multiline: boolean;
    forceDelta?: [number, number];
    onScroll: (scrollDelta: [number, number]) => void;
    onChange: (value: string, elm: Input) => void;
}
