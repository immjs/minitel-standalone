import { Focusable } from '../abstract/focusable.js';
import { MinitelObject } from '../abstract/minitelobject.js';
import { LocationDescriptor } from '../locationdescriptor.js';
import { RichCharGrid } from '../richchargrid.js';
import { Container, ContainerAttributes } from './container.js';
import type { Minitel } from './minitel.js';
export declare class Scrollable extends Container<ScrollableAttributes, {
    key: [string];
}> implements Focusable {
    static defaultAttributes: ScrollableAttributes;
    defaultAttributes: ScrollableAttributes;
    _focused: boolean;
    keepElmDesc: true;
    private prevScrollDelta;
    _scrollDelta: [number, number];
    private artificialBlink;
    blinkShown: boolean;
    blink(): void;
    get scrollDelta(): [number, number];
    set focused(val: boolean);
    get focused(): boolean;
    blinkHandler(): void;
    constructor(children: MinitelObject<import("../types.js").MinitelObjectAttributes, Record<string, any[]>>[] | undefined, attributes: Partial<ScrollableAttributes>, minitel: Minitel);
    pushPrevScrollDelta(): void;
    popPrevScrollDelta(callback: (_arg0: [number, number]) => unknown): void;
    keyEventListener(str: string): void;
    unmount(): void;
    getDimensions(attributes: ScrollableAttributes, inheritMe: Partial<ScrollableAttributes>): {
        width: number;
        height: number;
    };
    mapLocation(attributes: ScrollableAttributes, inheritMe: Partial<ScrollableAttributes>, nextNode: MinitelObject, nodes: MinitelObject[], weAt: number): LocationDescriptor;
    render(attributes: ScrollableAttributes, inheritMe: Partial<ScrollableAttributes>): RichCharGrid;
}
export interface ScrollableAttributes extends ContainerAttributes {
    overflowX: 'scroll' | 'pad' | 'auto' | 'hidden' | 'noscrollbar';
    overflowY: 'scroll' | 'pad' | 'auto' | 'hidden' | 'noscrollbar';
    autofocus: boolean;
    disabled: boolean;
    onScroll: (scrollDelta: [number, number]) => void;
    scrollbarColor: number;
    scrollbarBackColor: number;
    blinkPeriod: number;
    onFocus: () => void;
    onBlur: () => void;
}
