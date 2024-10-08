import { Focusable, FocusableAttributes } from '../abstract/focusable.js';
import { MinitelObject } from '../abstract/minitelobject.js';
import { RichCharGrid } from '../richchargrid.js';
import type { Minitel } from './minitel.js';
export declare class Input extends MinitelObject<InputAttributes, {
    key: [string];
}> implements Focusable {
    static defaultAttributes: InputAttributes;
    defaultAttributes: InputAttributes;
    _value: string;
    _focused: boolean;
    keepElmDesc: true;
    _cursorActuallyAt: [number, number];
    _scrollDelta: [number, number];
    oldScrollDelta: [number, number];
    lastFocusCursorX: number;
    constructor(children: [], attributes: Partial<InputAttributes>, minitel: Minitel);
    getDimensions(attributes: InputAttributes, inheritMe: Partial<InputAttributes>): {
        width: number;
        height: number;
    };
    set value(newValue: string);
    get value(): string;
    set cursorActuallyAt(newPos: [number, number]);
    get cursorActuallyAt(): [number, number];
    set scrollDelta(newDelta: [number, number]);
    get scrollDelta(): [number, number];
    set focused(val: boolean);
    get focused(): boolean;
    constrainCursor(): void;
    keyEventListener(key: string): void;
    unmount(): void;
    render(attributes: InputAttributes, inheritMe: Partial<InputAttributes>): RichCharGrid;
    get focusCursorAt(): [number, number];
}
export interface InputAttributes extends FocusableAttributes {
    type: 'text' | 'password';
    multiline: boolean;
    forceDelta?: [number, number];
    onScroll: (scrollDelta: [number, number]) => void;
    onChange: (value: string, elm: Input) => void;
}
