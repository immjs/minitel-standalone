import { FocusableAttributes as FocusableIfaceAttributes, Focusable as FocusableIface } from '../abstract/focusable.js';
import { MinitelObject } from '../abstract/minitelobject.js';
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
    set focused(val) {
        if (this._focused !== val) this.minitel.invalidateRender();
        if (val) {
            // console.log(this.minitel.focusedObj, this.minitel.focusedObj === this);
            if (this.minitel.focusedObj && this.minitel.focusedObj !== this) this.minitel.focusedObj.focused = false;
            if (this._focused !== val) this.attributes.onFocus?.();
            this._focused = true;
        } else {
            if (this._focused !== val) this.attributes.onBlur?.();
            this._focused = false;
        }
    }
    get focused() {
        return this._focused;
    }
    constructor(children: MinitelObject[] = [], attributes: Partial<FocusableAttributes>, minitel: Minitel) {
        super(children, attributes, minitel);
    }
}
