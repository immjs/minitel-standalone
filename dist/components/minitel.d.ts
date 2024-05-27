/// <reference types="node" />
/// <reference types="node" />
import { Duplex } from 'stream';
import { Container, ContainerAttributes } from './container.js';
import { RichCharGrid } from '../richchargrid.js';
import { CharAttributes } from '../types.js';
import { Focusable } from '../abstract/focusable.js';
export interface MinitelSettings {
    statusBar: boolean;
    localEcho: boolean;
    extendedMode: boolean;
    defaultCase: 'upper' | 'lower';
}
export declare class Minitel extends Container<ContainerAttributes, {
    key: [string];
}> {
    static defaultScreenAttributes: CharAttributes;
    renderInvalidated: boolean;
    stream: Duplex;
    previousRender: RichCharGrid;
    settings: MinitelSettings;
    focusedObj: Focusable | null;
    lastImmediate: NodeJS.Immediate | null;
    constructor(stream: Duplex, settings: Partial<MinitelSettings>);
    invalidateRender(): void;
    renderString(): string;
    toCursorMove(y: number, x: number): string;
    handleFocus(): void;
    focusDelta(delta: 1 | -1): Focusable | undefined;
    queueImmediateRenderToStream(): void;
    renderToStream(): void;
}
