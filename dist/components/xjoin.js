"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XJoin = void 0;
const minitelobject_js_1 = require("../abstract/minitelobject.js");
const richchar_js_1 = require("../richchar.js");
const richchargrid_js_1 = require("../richchargrid.js");
const utils_js_1 = require("../utils.js");
class XJoin extends minitelobject_js_1.MinitelObject {
    constructor(children, attributes, minitel) {
        super(children, attributes, minitel);
        this.defaultAttributes = XJoin.defaultAttributes;
    }
    getDimensions(attributes, inheritMe) {
        const heightIfStretch = attributes.height || this.children.reduce((p, c) => {
            const h = c.getDimensionsWrapper(inheritMe).height;
            if (h == null)
                return p;
            return Math.max(p, h);
        }, -Infinity);
        let cumulatedWidth = 0;
        const rendersNoFlexGrow = this.children.map((v) => {
            if (v.attributes.flexGrow)
                return null;
            const render = v.getDimensionsWrapper(inheritMe, Object.assign({}, (attributes.heightAlign === 'stretch' ? { height: heightIfStretch } : {})));
            cumulatedWidth += render.width;
            return render;
        });
        const flexGrowTotal = this.children.reduce((p, c) => p + +(c.attributes.flexGrow || 0), 0);
        const remainingSpace = attributes.width != null ? attributes.width - cumulatedWidth : null;
        const unitOfFlexGrowSpace = remainingSpace != null ? remainingSpace / flexGrowTotal : null;
        let usedRemainingSpace = 0;
        const rendersYesFlexGrow = this.children.map((v) => {
            if (!v.attributes.flexGrow)
                return null;
            if (unitOfFlexGrowSpace != null && remainingSpace != null) {
                const prevUsedRemSpace = usedRemainingSpace;
                usedRemainingSpace += unitOfFlexGrowSpace;
                return v.getDimensionsWrapper(inheritMe, Object.assign(Object.assign({}, (attributes.heightAlign === 'stretch' ? { height: heightIfStretch } : {})), { width: Math.round(usedRemainingSpace) - Math.round(prevUsedRemSpace) }));
            }
            return v.getDimensionsWrapper(inheritMe);
        });
        const dimensions = rendersNoFlexGrow.map((v, i) => v != null ? v : rendersYesFlexGrow[i]);
        const { gap } = attributes;
        const width = attributes.width
            || (typeof gap === 'number' ? gap : 0) * this.children.length + dimensions.reduce((p, v) => p + v.width, 0);
        const height = attributes.heightAlign === 'stretch'
            ? heightIfStretch
            : attributes.height || Math.max(...dimensions.map((v) => v.height));
        return { width, height };
    }
    render(attributes, inheritMe) {
        const fillChar = new richchar_js_1.RichChar(attributes.fillChar, attributes).noSize();
        const heightIfStretch = attributes.height || this.children.reduce((p, c) => {
            const h = c.getDimensionsWrapper(inheritMe).height;
            if (h == null)
                return p;
            return Math.max(p, h);
        }, -Infinity);
        let cumulatedWidth = 0;
        const rendersNoFlexGrow = this.children.map((v) => {
            if (v.attributes.flexGrow)
                return null;
            const render = v.renderWrapper(inheritMe, Object.assign({}, (attributes.heightAlign === 'stretch' ? { height: heightIfStretch } : {})));
            cumulatedWidth += render.width;
            return render;
        });
        const flexGrowTotal = this.children.reduce((p, c) => p + +(c.attributes.flexGrow || 0), 0);
        const remainingSpace = attributes.width != null ? attributes.width - cumulatedWidth : null;
        const unitOfFlexGrowSpace = remainingSpace != null ? remainingSpace / flexGrowTotal : null;
        let usedRemainingSpace = 0;
        const rendersYesFlexGrow = this.children.map((v) => {
            if (!v.attributes.flexGrow)
                return null;
            if (unitOfFlexGrowSpace != null && remainingSpace != null) {
                const prevUsedRemSpace = usedRemainingSpace;
                usedRemainingSpace += unitOfFlexGrowSpace;
                return v.renderWrapper(inheritMe, Object.assign(Object.assign({}, (attributes.heightAlign === 'stretch' ? { height: heightIfStretch } : {})), { width: Math.round(usedRemainingSpace) - Math.round(prevUsedRemSpace) }));
            }
            return v.renderWrapper(inheritMe);
        });
        const renders = rendersNoFlexGrow.map((v, i) => v != null ? v : rendersYesFlexGrow[i]);
        const result = new richchargrid_js_1.RichCharGrid();
        const height = attributes.heightAlign === 'stretch'
            ? heightIfStretch
            : attributes.height || Math.max(...renders.map((v) => v.height));
        if (renders.length === 0)
            return richchargrid_js_1.RichCharGrid.fill(attributes.width || 0, attributes.height || 0, fillChar);
        const contentsWidth = renders.reduce((c, v) => c + v.width, 0);
        // space-between: w / (n - 1)
        // space-around: w / n
        // space-evenly: w / (n + 1)
        let gapWidth;
        if (typeof attributes.gap === 'number') {
            gapWidth = attributes.gap;
        }
        else if (attributes.width != null) {
            const mappingTable = {
                'space-between': renders.length - 1,
                'space-around': renders.length,
                'space-evenly': renders.length + 1,
            };
            gapWidth = (attributes.width - contentsWidth) / mappingTable[attributes.gap];
        }
        else {
            gapWidth = 0;
        }
        let gapCumul = 0;
        for (let render of renders) {
            if (render !== renders[0]) {
                const gapConstituent = new richchargrid_js_1.RichCharGrid([]);
                const lastCumul = gapCumul;
                gapCumul += gapWidth;
                gapConstituent.setHeight(height, 'end', fillChar);
                gapConstituent.setWidth(Math.round(gapCumul) - Math.round(lastCumul), 'end', fillChar);
                result.mergeX(gapConstituent);
            }
            if (attributes.heightAlign !== 'stretch')
                render.setHeight(height, utils_js_1.alignInvrt[attributes.heightAlign], fillChar);
            result.mergeX(render);
        }
        if (attributes.width != null)
            result.setWidth(attributes.width, utils_js_1.alignInvrt[attributes.widthAlign], fillChar);
        return result;
    }
}
exports.XJoin = XJoin;
XJoin.defaultAttributes = Object.assign(Object.assign({}, minitelobject_js_1.MinitelObject.defaultAttributes), { gap: 0, widthAlign: 'start', heightAlign: 'stretch' });
