import { MinitelObject } from '../abstract/minitelobject.js';
import { RichChar } from '../richchar.js';
import { SingletonArray } from '../custom_arrays.js';
import { alignInvrt } from '../utils.js';
export class Container extends MinitelObject {
    constructor(children = [], attributes, minitel) {
        if (children.length > 1)
            throw new Error('Container must only include one element');
        super([], attributes, minitel);
        this.defaultAttributes = Container.defaultAttributes;
        this.children = new SingletonArray();
        if (children[0])
            this.appendChild(children[0]);
    }
    getDimensions(attributes, inheritMe) {
        return this.children[0].getDimensionsWrapper(inheritMe, Object.assign(Object.assign({}, (attributes.width != null ? { width: attributes.width } : {})), (attributes.height != null ? { height: attributes.height } : {})));
    }
    render(attributes, inheritMe) {
        const fillChar = new RichChar(attributes.fillChar, attributes).noSize();
        const render = this.children[0].renderWrapper(inheritMe, Object.assign(Object.assign({}, (attributes.width != null ? { width: attributes.width } : {})), (attributes.height != null ? { height: attributes.height } : {})));
        if (attributes.height)
            render.setHeight(attributes.height, alignInvrt[attributes.heightAlign], fillChar);
        if (attributes.width)
            render.setWidth(attributes.width, alignInvrt[attributes.widthAlign], fillChar);
        // console.log({ width: attributes.width, height: attributes.height, render: render.toString() })
        return render;
    }
}
Container.defaultAttributes = Object.assign(Object.assign({}, MinitelObject.defaultAttributes), { widthAlign: 'start', heightAlign: 'start' });
