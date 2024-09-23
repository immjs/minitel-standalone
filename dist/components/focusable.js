import { Container } from './container.js';
export class Focusable extends Container {
    set focused(val) {
        var _a, _b, _c, _d;
        if (this._focused !== val)
            this.minitel.invalidateRender();
        if (val) {
            // console.log(this.minitel.focusedObj, this.minitel.focusedObj === this);
            if (this.minitel.focusedObj && this.minitel.focusedObj !== this)
                this.minitel.focusedObj.focused = false;
            if (this._focused !== val)
                (_b = (_a = this.attributes).onFocus) === null || _b === void 0 ? void 0 : _b.call(_a);
            this._focused = true;
        }
        else {
            if (this._focused !== val)
                (_d = (_c = this.attributes).onBlur) === null || _d === void 0 ? void 0 : _d.call(_c);
            this._focused = false;
        }
    }
    get focused() {
        return this._focused;
    }
    constructor(children = [], attributes, minitel) {
        super(children, attributes, minitel);
        this.defaultAttributes = Focusable.defaultAttributes;
        this._focused = false;
        this.keepElmDesc = true;
    }
}
Focusable.defaultAttributes = Object.assign(Object.assign({}, Container.defaultAttributes), { autofocus: false, disabled: false, widthAlign: 'start', heightAlign: 'start', onFocus: () => { }, onBlur: () => { } });
