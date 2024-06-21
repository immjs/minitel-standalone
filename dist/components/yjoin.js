"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YJoin = void 0;
const minitelobject_js_1 = require("../abstract/minitelobject.js");
const richchar_js_1 = require("../richchar.js");
const richchargrid_js_1 = require("../richchargrid.js");
const utils_js_1 = require("../utils.js");
class YJoin extends minitelobject_js_1.MinitelObject {
    constructor(children, attributes, minitel) {
        super(children, attributes, minitel);
        this.defaultAttributes = YJoin.defaultAttributes;
    }
    getDimensions(attributes, inheritMe) {
        const widthIfStretch = attributes.width || this.children.reduce((p, c) => {
            const w = c.getDimensionsWrapper(inheritMe).width;
            if (w == null)
                return p;
            return Math.max(p, w);
        }, -Infinity);
        let cumulatedHeight = 0;
        const rendersNoFlexGrow = this.children.map((v) => {
            if (v.attributes.flexGrow)
                return null;
            const render = v.getDimensionsWrapper(inheritMe, Object.assign({}, (attributes.widthAlign === 'stretch' ? { width: widthIfStretch } : {})));
            cumulatedHeight += render.height;
            return render;
        });
        const flexGrowTotal = this.children.reduce((p, c) => p + +(c.attributes.flexGrow || 0), 0);
        const remainingSpace = attributes.height != null ? attributes.height - cumulatedHeight : null;
        const unitOfFlexGrowSpace = remainingSpace != null ? remainingSpace / flexGrowTotal : null;
        let usedRemainingSpace = 0;
        const rendersYesFlexGrow = this.children.map((v) => {
            if (!v.attributes.flexGrow)
                return null;
            if (unitOfFlexGrowSpace != null && remainingSpace != null) {
                const prevUsedRemSpace = usedRemainingSpace;
                usedRemainingSpace += unitOfFlexGrowSpace;
                return v.getDimensionsWrapper(inheritMe, Object.assign(Object.assign({}, (attributes.widthAlign === 'stretch' ? { width: widthIfStretch } : {})), { height: Math.round(usedRemainingSpace) - Math.round(prevUsedRemSpace) }));
            }
            return v.getDimensionsWrapper(inheritMe);
        });
        const dimensions = rendersNoFlexGrow.map((v, i) => v != null ? v : rendersYesFlexGrow[i]);
        const { gap } = attributes;
        const height = attributes.height
            || (typeof gap === 'number' ? gap : 0) * this.children.length + dimensions.reduce((p, v) => p + v.height, 0);
        const width = attributes.widthAlign === 'stretch'
            ? widthIfStretch
            : attributes.width || Math.max(...dimensions.map((v) => v.width));
        return { width, height };
    }
    render(attributes, inheritMe) {
        const fillChar = new richchar_js_1.RichChar(attributes.fillChar, attributes).noSize();
        const widthIfStretch = attributes.width || this.children.reduce((p, c) => {
            const w = c.getDimensionsWrapper(inheritMe).width;
            if (w == null)
                return p;
            return Math.max(p, w);
        }, -Infinity);
        let cumulatedHeight = 0;
        const rendersNoFlexGrow = this.children.map((v) => {
            if (v.attributes.flexGrow)
                return null;
            const render = v.renderWrapper(inheritMe, Object.assign({}, (attributes.widthAlign === 'stretch' ? { width: widthIfStretch } : {})));
            cumulatedHeight += render.height;
            return render;
        });
        const flexGrowTotal = this.children.reduce((p, c) => p + +(c.attributes.flexGrow || 0), 0);
        const remainingSpace = attributes.height != null ? attributes.height - cumulatedHeight : null;
        const unitOfFlexGrowSpace = remainingSpace != null && flexGrowTotal !== 0 ? remainingSpace / flexGrowTotal : null;
        let usedRemainingSpace = 0;
        const rendersYesFlexGrow = this.children.map((v) => {
            if (!v.attributes.flexGrow)
                return null;
            if (unitOfFlexGrowSpace != null && remainingSpace != null) {
                const prevUsedRemSpace = usedRemainingSpace;
                usedRemainingSpace += unitOfFlexGrowSpace;
                return v.renderWrapper(inheritMe, Object.assign(Object.assign({}, (attributes.widthAlign === 'stretch' ? { width: widthIfStretch } : {})), { height: Math.round(usedRemainingSpace) - Math.round(prevUsedRemSpace) }));
            }
            return v.renderWrapper(inheritMe);
        });
        const renders = rendersNoFlexGrow.map((v, i) => v != null ? v : rendersYesFlexGrow[i]);
        const result = new richchargrid_js_1.RichCharGrid();
        const width = attributes.widthAlign === 'stretch'
            ? widthIfStretch
            : attributes.width || Math.max(...renders.map((v) => v.width));
        if (renders.length === 0)
            return richchargrid_js_1.RichCharGrid.fill(attributes.width || 0, attributes.height || 0, fillChar);
        const contentsHeight = renders.reduce((c, v) => c + v.height, 0);
        // space-between: w / (n - 1)
        // space-around: w / n
        // space-evenly: w / (n + 1)
        let gapHeight;
        if (typeof attributes.gap === 'number') {
            gapHeight = attributes.gap;
        }
        else if (attributes.height != null) {
            const mappingTable = {
                'space-between': renders.length - 1,
                'space-around': renders.length,
                'space-evenly': renders.length + 1,
            };
            gapHeight = (attributes.height - contentsHeight) / mappingTable[attributes.gap];
        }
        else {
            gapHeight = 0;
        }
        let gapCumul = 0;
        for (let render of renders) {
            if (render !== renders[0]) {
                const gapConstituent = new richchargrid_js_1.RichCharGrid([[]]);
                const lastCumul = gapCumul;
                gapCumul += gapHeight;
                gapConstituent.setHeight(Math.round(gapCumul) - Math.round(lastCumul), 'end', fillChar);
                gapConstituent.setWidth(width, 'end', fillChar);
                result.mergeY(gapConstituent);
            }
            if (attributes.widthAlign !== 'stretch')
                render.setWidth(width, utils_js_1.alignInvrt[attributes.widthAlign], fillChar);
            result.mergeY(render);
        }
        if (attributes.height != null)
            result.setHeight(attributes.height, utils_js_1.alignInvrt[attributes.heightAlign], fillChar);
        return result;
    }
}
exports.YJoin = YJoin;
YJoin.defaultAttributes = Object.assign(Object.assign({}, minitelobject_js_1.MinitelObject.defaultAttributes), { gap: 0, widthAlign: 'stretch', heightAlign: 'start' });
