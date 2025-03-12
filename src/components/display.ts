import { MinitelObject } from '../abstract/minitelobject.js';
import { RichChar } from '../richchar.js';
import { NullArray } from '../custom_arrays.js';
import { Align, MinitelObjectAttributes } from '../types.js';
import { alignInvrt, inheritedProps } from '../utils.js';
import type { Minitel } from './minitel.js';
import { RichCharGrid } from '../richchargrid.js';

export class Container<T extends DisplayAttributes = DisplayAttributes, U extends Record<string, any[]> = Record<string, any[]>> extends MinitelObject<T, U> {
    static defaultAttributes: DisplayAttributes = {
        ...MinitelObject.defaultAttributes,
        grid: new RichCharGrid(),
        widthAlign: 'middle',
        heightAlign: 'middle',
    };
    defaultAttributes = Container.defaultAttributes as T;
    constructor(children: MinitelObject[] = [], attributes: Partial<T>, minitel: Minitel) {
        if (children.length !== 0) throw new Error('Display may not have any elements');
        super([], attributes, minitel);
        this.children = new NullArray();
        if (children[0]) this.appendChild(children[0]);
    }
    getDimensions(attributes: T, inheritMe: Partial<T>): { width: number; height: number; } {
        return { width: attributes.width || 0, height: attributes.height || 0 };
    }
    render(attributes: T, inheritMe: Partial<T>) {
        const fillChar = new RichChar(attributes.fillChar, attributes).noSize();

        const render = attributes.grid;

        if (attributes.height) render.setHeight(attributes.height, alignInvrt[attributes.heightAlign], fillChar);
        if (attributes.width) render.setWidth(attributes.width, alignInvrt[attributes.widthAlign], fillChar);

        // console.log({ width: attributes.width, height: attributes.height, render: render.toString() })

        return render;
    }
}

export interface DisplayAttributes extends MinitelObjectAttributes {
    grid: RichCharGrid;
    widthAlign: Align;
    heightAlign: Align;
}
