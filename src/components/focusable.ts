import { FocusableAttributes as FocusableIfaceAttributes, Focusable as FocusableIface } from '../abstract/focusable.js';
import { Container, ContainerAttributes } from './container.js';
import type { Minitel } from './minitel.js';

export interface FocusableAttributes extends FocusableIfaceAttributes, ContainerAttributes {}

export class Focusable extends Container<FocusableAttributes, { key: [string] }> implements FocusableIface {
    static defaultAttributes: FocusableAttributes = {
        ...Container.defaultAttributes,
        autofocus: false,
        disabled: false,
        widthAlign: 'start',
        heightAlign: 'start',
        onFocus: () => {},
        onBlur: () => {},
    };
    defaultAttributes = Focusable.defaultAttributes;
    _focused = false;
    keepElmDesc: true = true;
    private artificialBlink: NodeJS.Timeout | null = null;
    set focused(val) {
        if (this._focused !== val) this.minitel.invalidateRender();
        if (val) {
            if (this.minitel.focusedObj) this.minitel.focusedObj.focused = false;
            this._focused = true;
            this.attributes.onFocus?.();
        } else {
            this._focused = false;
            this.attributes.onBlur?.();
        }
    }
    get focused() {
        return this._focused;
    }
    constructor(children = [], attributes: Partial<FocusableAttributes>, minitel: Minitel) {
        super(children, attributes, minitel);
    }
    get disabled() {
        return this.attributes.disabled || false;
    }
}
