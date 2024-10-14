/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { Duplex } from 'stream';
import { Container, ContainerAttributes } from './container.js';
import { RichCharGrid } from '../richchargrid.js';
import { CharAttributes } from '../types.js';
import { MinitelObject } from '../abstract/minitelobject.js';
import { Focusable } from '../abstract/focusable.js';
import { LinkedList } from '../abstract/linked_list.js';
import type { LocationDescriptor } from '../locationdescriptor.js';
export interface MinitelSettings {
    statusBar: boolean;
    localEcho: boolean;
    extendedMode: boolean;
    defaultCase: 'upper' | 'lower';
}
export declare const specialCharTranslation: Record<string, string>;
export declare class Minitel extends Container<ContainerAttributes, {
    key: [string];
    frame: [boolean];
}> {
    static defaultScreenAttributes: CharAttributes;
    renderInvalidated: boolean;
    stream: Duplex;
    previousRender: RichCharGrid;
    settings: MinitelSettings;
    focusedObj: Focusable | null;
    lastImmediate: NodeJS.Immediate | null;
    speed: number | undefined;
    rxQueue: LinkedList;
    model: string | undefined;
    private tillReady;
    constructor(stream: Duplex, settings: Partial<MinitelSettings>);
    getDimensions(): {
        width: number;
        height: number;
    };
    readyAsync(): Promise<void>;
    invalidateRender(): void;
    mapLocation(attributes: ContainerAttributes, inheritMe: Partial<ContainerAttributes>, nextNode: MinitelObject, nodes: MinitelObject[], weAt: number): LocationDescriptor;
    renderString(clear?: boolean): string;
    toCursorMove(y: number, x: number): string;
    handleFocus(): void;
    focusDelta(delta: 1 | -1): Focusable | undefined;
    queueImmediateRenderToStream(): void;
    renderToStream(clear?: boolean): void;
    queueCommand(command: string, expected: string | RegExp, callback?: ((_arg0: string) => any)): void;
    queueCommandAsync(command: string, expected: string | RegExp): Promise<string>;
    get colors(): number[][];
}
