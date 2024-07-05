import { MinitelObjectAttributes } from '../types.js';
import { MinitelObject } from './minitelobject.js';
export interface Focusable extends MinitelObject<FocusableAttributes, {
    key: [string];
}> {
    focused: boolean;
    focusCursorAt?: [number, number];
    disabled: boolean;
    keepElmDesc: true;
    attributes: FocusableAttributes;
}
export interface FocusableAttributes extends MinitelObjectAttributes {
    autofocus: boolean;
    disabled: boolean;
}
