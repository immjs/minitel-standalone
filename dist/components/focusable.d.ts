import { FocusableAttributes as FocusableIfaceAttributes, Focusable as FocusableIface } from '../abstract/focusable.js';
import { Container, ContainerAttributes } from './container.js';
import type { Minitel } from './minitel.js';
interface FocusableAttributes extends FocusableIfaceAttributes, ContainerAttributes {
}
export declare class Focusable extends Container<FocusableAttributes, {
    key: [string];
}> implements FocusableIface {
    static defaultAttributes: FocusableAttributes;
    defaultAttributes: FocusableAttributes;
    _focused: boolean;
    keepElmDesc: true;
    private artificialBlink;
    set focused(val: boolean);
    get focused(): boolean;
    constructor(children: never[] | undefined, attributes: Partial<FocusableAttributes>, minitel: Minitel);
    get disabled(): boolean;
}
export {};
