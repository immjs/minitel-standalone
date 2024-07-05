import { Focusable, FocusableAttributes } from "../abstract/focusable";
import { Align, MinitelObjectAttributes } from "../types";
import { Container } from "./container";

export interface FocusAttributes extends FocusableAttributes {
    widthAlign: Align;
    heightAlign: Align;
}

export class Focus extends Container<FocusAttributes, { key: [string] }> implements Focusable {
    static defaultAttributes: FocusAttributes = {
        ...Container.defaultAttributes,
        autofocus: false,
        disabled: false,
        onFocus: () => {},
        onBlur: () => {},
    };
    defaultAttributes: FocusAttributes = Focus.defaultAttributes;
    _focused = false;
    disabled = false;
    keepElmDesc = true as true;
    set focused(val) {
        if (this._focused !== val) {
            this.minitel.invalidateRender();
            if (val) {
                if (this.minitel.focusedObj) this.minitel.focusedObj.focused = false;
                this._focused = true;
                if (this.attributes.onFocus != null) this.attributes.onFocus();
            } else {
                this._focused = false;
                if (this.attributes.onBlur != null) this.attributes.onBlur();
            }
        }
    }
    get focused() {
        return this._focused;
    }
}
