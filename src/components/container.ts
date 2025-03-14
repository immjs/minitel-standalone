import { MinitelObject } from '../abstract/minitelobject.js';
import { RichChar } from '../richchar.js';
import { SingletonArray } from '../custom_arrays.js';
import { Align, MinitelObjectAttributes } from '../types.js';
import { alignInvrt, inheritedProps } from '../utils.js';
import type { Minitel } from './minitel.js';

export class Container<T extends ContainerAttributes = ContainerAttributes, U extends Record<string, any[]> = Record<string, any[]>> extends MinitelObject<T, U> {
    static defaultAttributes: ContainerAttributes = {
        ...MinitelObject.defaultAttributes,
        widthAlign: 'start',
        heightAlign: 'start',
    };
    defaultAttributes = Container.defaultAttributes as T;
    constructor(children: MinitelObject[] = [], attributes: Partial<T>, minitel: Minitel) {
        if (children.length > 1) throw new Error('Container must only include one element');
        super([], attributes, minitel);
        this.children = new SingletonArray<MinitelObject>();
        if (children[0]) this.appendChild(children[0]);
    }
    getDimensions(attributes: T, inheritMe: Partial<T>): { width: number; height: number; } {
        return this.children[0].getDimensionsWrapper(inheritMe, {
            ...(attributes.width != null ? { width: attributes.width } : {}),
            ...(attributes.height != null ? { height: attributes.height } : {}),
        });
    }
    render(attributes: T, inheritMe: Partial<T>) {
        const fillChar = new RichChar(attributes.fillChar, attributes).noSize();

        const render = this.children[0].renderWrapper(inheritMe, {
            ...(attributes.width != null ? { width: attributes.width } : {}),
            ...(attributes.height != null ? { height: attributes.height } : {}),
        });

        if (attributes.height) render.setHeight(attributes.height, alignInvrt[attributes.heightAlign], fillChar);
        if (attributes.width) render.setWidth(attributes.width, alignInvrt[attributes.widthAlign], fillChar);

        // console.log({ width: attributes.width, height: attributes.height, render: render.toString() })

        return render;
    }
}

export interface ContainerAttributes extends MinitelObjectAttributes {
    widthAlign: Align;
    heightAlign: Align;
}
