import { EventEmitter } from 'node:events';
import type { Minitel } from '../components/minitel.js';
import { RichChar } from '../richchar.js';
import { RichCharGrid } from '../richchargrid.js';
import { MinitelObjectAttributes } from '../types.js';
import { inheritedProps, padding } from '../utils.js';
import { Focusable } from './focusable.js';
import { LocationDescriptor } from '../locationdescriptor.js';
import { InvalidRender } from './invalidrender.js';

export class MinitelObject<T extends MinitelObjectAttributes = MinitelObjectAttributes, U extends Record<string, any[]> = Record<string, any[]>> extends EventEmitter<U> {
    children: MinitelObject[];
    attributes: Partial<T>;
    parent?: MinitelObject;
    minitel: Minitel;
    keepElmDesc: boolean = false;
    static defaultAttributes: MinitelObjectAttributes = {
        width: null,
        height: null,
        fillChar: ' ',
        textAlign: 'start',
        wrap: 'clip',
        flexGrow: 0,
        pad: 0,
        visible: true,
        disabled: false,
        onResize: (currDim: [number, number], prevDim: [number, number] | null) => { },
    };
    previousDimensions: [number, number] | null = null;
    defaultAttributes: T = MinitelObject.defaultAttributes as T;
    getDimensions(attributes: T, inheritMe: Partial<T>): ({ width: number, height: number }) {
        const tempRender = this.render(attributes, inheritMe);
        return { width: tempRender.width, height: tempRender.height };
    }
    getDimensionsWrapper(inheritedAttributes: Partial<T>, forcedAttributes?: Partial<T>): ({ width: number, height: number }) {
        const attributes: T = {
            ...this.defaultAttributes,
            ...inheritedAttributes,
            ...this.attributes,
            ...forcedAttributes,
        };
        const pad = padding.normalise(attributes.pad);
        attributes.width = attributes.width != null ? padding.exludeX(attributes.width, pad) : null;
        attributes.height = attributes.height != null ? padding.exludeY(attributes.height, pad) : null;

        let result: { width: number; height: number } = { width: -1, height: -1 };
        if (!attributes.height || !attributes.width) {
            result = this.getDimensions(attributes, inheritedProps({
                ...inheritedAttributes,
                ...this.attributes,
                ...forcedAttributes,
            }));
        }

        if (attributes.width) result.width = attributes.width;
        if (attributes.height) result.height = attributes.height;

        result.height += pad[0] + pad[2];
        result.width += pad[1] + pad[3];

        if (result.height !== this.previousDimensions?.[0] || result.height !== this.previousDimensions?.[1]) {
            attributes.onResize([result.height, result.width], this.previousDimensions);
            this.previousDimensions = [result.height, result.width];
        }

        return result;
    }
    constructor(children: MinitelObject[], attributes: Partial<T>, minitel: Minitel) {
        super();
        this.children = [];
        this.minitel = minitel;
        for (let child of children) {
            this.appendChild(child);
        }
        this.attributes = new Proxy(attributes, {
            set: (function (this: MinitelObject, target: Record<string | symbol, any>, prop: string | symbol, val: any) {
                const oldTP = target[prop];
                target[prop] = val;
                if (val !== oldTP) this.minitel.invalidateRender();
                return true;
            }).bind(this),
        }) as Partial<T>;
    }
    appendChild(child: MinitelObject) {
        child.parent = this;
        this.children.push(child);
    }
    insertBeforeChild(child: MinitelObject, beforeChild: MinitelObject) {
        child.parent = this;
        const index = this.children.indexOf(beforeChild);
        this.children.splice(index, 0, child);
    }
    removeChild(child: MinitelObject) {
        child.parent = undefined;
        const index = this.children.indexOf(child);
        this.children.splice(index, 1);
    }

    render(attributes: T, inheritMe: Partial<T>): RichCharGrid {
        throw new Error('MinitelObject has no render');
    }
    renderWrapper(inheritedAttributes: Partial<T>, forcedAttributes?: Partial<T>): RichCharGrid {
        const attributes: T = {
            ...this.defaultAttributes,
            ...inheritedAttributes,
            ...this.attributes,
            ...forcedAttributes,
        };
        const pad = padding.normalise(attributes.pad);
        attributes.width = attributes.width != null ? padding.exludeX(attributes.width, pad) : null;
        attributes.height = attributes.height != null ? padding.exludeY(attributes.height, pad) : null;

        const fillChar = new RichChar(attributes.fillChar, attributes).noSize();

        let result = this.render(attributes, inheritedProps({
            ...inheritedAttributes,
            ...this.attributes,
            ...forcedAttributes,
        }));
        if (this.minitel.renderInvalidated) {
            throw new InvalidRender();
        }
        if (!attributes.visible) {
            result = RichCharGrid.fill(attributes.width || 0, attributes.height || 0, fillChar);
        }

        if (attributes.width != null) result.setWidth(attributes.width, 'end', fillChar);
        if (attributes.height != null) result.setHeight(attributes.height, 'end', fillChar);

        result.pad(pad, fillChar);

        // Descriptor before pad, is this the right choice?
        // Future you: Yes. Yes it is.
        // Future you 5 minutes later: Actually you know what
        if (this.keepElmDesc) result.locationDescriptors.add(this, new LocationDescriptor(0, 0, result.width, result.height));

        return result;
    }
    focusables(): Focusable[] {
        const isFocusable = (v: MinitelObject): v is Focusable => 'focused' in v;
        return this.children.flatMap((v) => {
            const focusables = [];
            if (isFocusable(v) && !v.disabled) focusables.push(v);
            focusables.push(...v.focusables());
            return focusables;
        });
    }

    unmount() {}
    unmountWrapper() {
        this.children.forEach((v) => v.unmountWrapper());
        this.unmount();
    }

    has(child: MinitelObject): boolean {
        return this.children.includes(child) || this.children.some((v) => v.has(child));
    }

    mapLocation(attributes: T, inheritMe: Partial<T>, nextNode: MinitelObject, nodes: MinitelObject[], weAt: number): LocationDescriptor {
        return nextNode.mapLocationWrapper(inheritMe, { width: attributes.width, height: attributes.height }, nodes, weAt)
    }
    mapLocationWrapper(inheritedAttributes: Partial<T>, forcedAttributes: Partial<T>, nodes: MinitelObject[], weAt: number): LocationDescriptor {
        const nextNode: MinitelObject | undefined = nodes[weAt + 1];
        const nextNodeIdx = nextNode && this.children.indexOf(nextNode);

        if (nextNodeIdx === -1) {
            throw new Error(`Next node was not found in children. This behaviour is unexpected; please contact the owner of minitel-standalone.`);
        }

        const attributes: T = {
            ...this.defaultAttributes,
            ...inheritedAttributes,
            ...this.attributes,
            ...forcedAttributes,
        };
        const pad = padding.normalise(attributes.pad);
        attributes.width = attributes.width != null ? padding.exludeX(attributes.width, pad) : null;
        attributes.height = attributes.height != null ? padding.exludeY(attributes.height, pad) : null;

        if (!nextNode) {
            const dimensions = this.getDimensionsWrapper(attributes, inheritedProps({
                ...inheritedAttributes,
                ...this.attributes,
                ...forcedAttributes,
            }));
            return new LocationDescriptor(pad[0], pad[3], dimensions.width, dimensions.height);
        }

        let result = this.mapLocation(attributes, inheritedProps({
            ...inheritedAttributes,
            ...this.attributes,
            ...forcedAttributes,
        }), nextNode, nodes, weAt + 1);

        result.y += pad[0];
        result.x += pad[3];

        return result;
    }

    get parentList(): MinitelObject[] {
        return [...(this.parent?.parentList || []), this];
    }

    scrollIntoView(context?: MinitelObject & { scrollDelta: [number, number] }): void {
        if (!context) {
            const parentList = this.parentList.filter((v): v is MinitelObject & { scrollDelta: [number, number] } => 'scrollDelta' in v);

            for (let i = 0; i < parentList.length - 1; i += 1) parentList[i + 1].scrollIntoView(parentList[i]);

            this.scrollIntoView(parentList.at(-1));
            return;
        }

        const pathToThis = this.parentList;
        const pathToScrollable = context.parentList;

        const thisPos = this.minitel.mapLocationWrapper({}, {}, pathToThis, 0);
        const scrollablePos = this.minitel.mapLocationWrapper({}, {}, pathToScrollable, 0);

        // DEAR FUTURE ME,
        // IS YOUR SCROLLINTOVIEW BUGGED AFTER ADDING PADDING TO INHERITANCE?
        // WELL MAYBE IF YOUR RETARDED ASS DID NOT DO THAT IT WOULD NOT BREAK
        // - Love, Juliet

        // Bitch at least manage to fix the code correctly
        // then worry about making haikus or whatever else
        // -- Fuckingly, Juliet

        const [relY, relX] = [thisPos.y - scrollablePos.y, thisPos.x - scrollablePos.x];

        if (relY < 0) {
            context.scrollDelta[0] += relY;
        } else if (relY + thisPos.h > scrollablePos.h) {
            context.scrollDelta[0] -= scrollablePos.h - (relY + thisPos.h);
        }

        if (relX < 0) {
            context.scrollDelta[1] += relX;
        } else if (relX + thisPos.w > scrollablePos.w) {
            context.scrollDelta[1] -= scrollablePos.w - (relX + thisPos.w);
        }
    }
    get disabled(): boolean {
        return this.attributes.disabled || this.parent?.disabled || false;
    }
}
