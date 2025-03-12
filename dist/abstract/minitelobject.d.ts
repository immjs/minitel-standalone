/// <reference types="node" resolution-mode="require"/>
import { EventEmitter } from 'node:events';
import type { Minitel } from '../components/minitel.js';
import { RichCharGrid } from '../richchargrid.js';
import { MinitelObjectAttributes } from '../types.js';
import { Focusable } from './focusable.js';
import { LocationDescriptor } from '../locationdescriptor.js';
export declare class MinitelObject<T extends MinitelObjectAttributes = MinitelObjectAttributes, U extends Record<string, any[]> = Record<string, any[]>> extends EventEmitter<U> {
    children: MinitelObject[];
    attributes: Partial<T>;
    parent?: MinitelObject;
    minitel: Minitel;
    keepElmDesc: boolean;
    static defaultAttributes: MinitelObjectAttributes;
    previousDimensions: [number, number] | null;
    defaultAttributes: T;
    getDimensions(attributes: T, inheritMe: Partial<T>): ({
        width: number;
        height: number;
    });
    getDimensionsWrapper(inheritedAttributes: Partial<T>, forcedAttributes?: Partial<T>): ({
        width: number;
        height: number;
    });
    constructor(children: MinitelObject[], attributes: Partial<T>, minitel: Minitel);
    appendChild(child: MinitelObject): void;
    insertBeforeChild(child: MinitelObject, beforeChild: MinitelObject): void;
    removeChild(child: MinitelObject): void;
    render(attributes: T, inheritMe: Partial<T>): RichCharGrid;
    renderWrapper(inheritedAttributes: Partial<T>, forcedAttributes?: Partial<T>): RichCharGrid;
    focusables(): Focusable[];
    unmount(): void;
    unmountWrapper(): void;
    has(child: MinitelObject): boolean;
    mapLocation(attributes: T, inheritMe: Partial<T>, nextNode: MinitelObject, nodes: MinitelObject[], weAt: number): LocationDescriptor;
    mapLocationWrapper(inheritedAttributes: Partial<T>, forcedAttributes: Partial<T>, nodes: MinitelObject[], weAt: number): LocationDescriptor;
    get parentList(): MinitelObject[];
    scrollIntoView(context?: MinitelObject & {
        scrollDelta: [number, number];
    }): void;
    get disabled(): boolean;
}
