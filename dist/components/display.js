import { MinitelObject } from '../abstract/minitelobject.js';
import { RichChar } from '../richchar.js';
import { NullArray } from '../custom_arrays.js';
import { alignInvrt } from '../utils.js';
import { RichCharGrid } from '../richchargrid.js';
export class Display extends MinitelObject {
    constructor(children = [], attributes, minitel) {
        if (children.length !== 0)
            throw new Error('Display may not have any elements');
        super([], attributes, minitel);
        this.defaultAttributes = Display.defaultAttributes;
        this.children = new NullArray();
        if (children[0])
            this.appendChild(children[0]);
    }
    getDimensions(attributes, inheritMe) {
        return { width: attributes.width || 0, height: attributes.height || 0 };
    }
    render(attributes, inheritMe) {
        const fillChar = new RichChar(attributes.fillChar, attributes).noSize();
        const render = attributes.grid;
        if (attributes.height)
            render.setHeight(attributes.height, alignInvrt[attributes.heightAlign], fillChar);
        if (attributes.width)
            render.setWidth(attributes.width, alignInvrt[attributes.widthAlign], fillChar);
        // console.log({ width: attributes.width, height: attributes.height, render: render.toString() })
        return render;
    }
}
Display.defaultAttributes = Object.assign(Object.assign({}, MinitelObject.defaultAttributes), { grid: new RichCharGrid(), widthAlign: 'middle', heightAlign: 'middle' });
