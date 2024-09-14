import { FocusableAttributes as FocusableIfaceAttributes, Focusable as FocusableIface } from '../abstract/focusable.js';
import { MinitelObject } from '../abstract/minitelobject.js';
import { Container, ContainerAttributes } from './container.js';
import type { Minitel } from './minitel.js';
export interface FocusableAttributes extends FocusableIfaceAttributes, ContainerAttributes {
}
export declare class Focusable extends Container<FocusableAttributes, {
    key: [string];
}> implements FocusableIface {
    static defaultAttributes: FocusableAttributes;
    defaultAttributes: FocusableAttributes;
    _focused: boolean;
    keepElmDesc: true;
    set focused(val: boolean);
    get focused(): boolean;
    constructor(children: MinitelObject<import("../types.js").MinitelObjectAttributes, Record<string, any[]>>[] | undefined, attributes: Partial<FocusableAttributes>, minitel: Minitel);
    get disabled(): boolean;
}
