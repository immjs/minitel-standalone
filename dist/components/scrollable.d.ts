import { Focusable } from '../abstract/focusable.js';
import { RichCharGrid } from '../richchargrid.js';
import { Container, ContainerAttributes } from './container.js';
import type { Minitel } from './minitel.js';
export declare class Scrollable extends Container<ScrollableAttributes, {
    key: [string];
}> implements Focusable {
    static defaultAttributes: ScrollableAttributes;
    defaultAttributes: ScrollableAttributes;
    focused: boolean;
    keepElmDesc: true;
    private prevScrollDelta;
    scrollDelta: [number, number];
    private artificialBlink;
    blinkShown: boolean;
    blink(): void;
    blinkHandler(): void;
    constructor(children: never[] | undefined, attributes: Partial<ScrollableAttributes>, minitel: Minitel);
    pushPrevScrollDelta(): void;
    popPrevScrollDelta(callback: (_arg0: [number, number]) => unknown): void;
    keyEventListener(str: string): void;
    unmount(): void;
    render(attributes: ScrollableAttributes, inheritMe: Partial<ScrollableAttributes>): RichCharGrid;
    get disabled(): boolean;
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
}
