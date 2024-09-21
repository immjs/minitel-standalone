import { MinitelObject } from '../abstract/minitelobject.js';
import { LocationDescriptor } from '../locationdescriptor.js';
import { RichChar } from '../richchar.js';
import { RichCharGrid } from '../richchargrid.js';
import { getDeltaFromSetting } from '../utils.js';
import { alignInvrt } from '../utils.js';
export class YJoin extends MinitelObject {
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
        const gapIfStatic = typeof attributes.gap === 'number' ? attributes.gap : 0;
        const remainingSpace = attributes.height != null ? attributes.height - cumulatedHeight - gapIfStatic * (this.children.length - 1) : null;
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
    mapLocation(attributes, inheritMe, nextNode, nodes, weAt) {
        const widthIfStretch = attributes.width || this.children.reduce((p, c) => {
            const w = c.getDimensionsWrapper(inheritMe).width;
            if (w == null)
                return p;
            return Math.max(p, w);
        }, -Infinity);
        let cumulatedHeight = 0;
        let nextMapLocation = null;
        const rendersNoFlexGrow = this.children.map((v) => {
            if (v.attributes.flexGrow)
                return null;
            const newOptions = Object.assign({}, (attributes.widthAlign === 'stretch' ? { width: widthIfStretch } : {}));
            if (v === nextNode)
                nextMapLocation = v.mapLocationWrapper(inheritMe, newOptions, nodes, weAt);
            const render = v.getDimensionsWrapper(inheritMe, newOptions);
            cumulatedHeight += render.height;
            return [v, render];
        });
        const flexGrowTotal = this.children.reduce((p, c) => p + +(c.attributes.flexGrow || 0), 0);
        const gapIfStatic = typeof attributes.gap === 'number' ? attributes.gap : 0;
        const remainingSpace = attributes.height != null ? attributes.height - cumulatedHeight - gapIfStatic * (this.children.length - 1) : null;
        const unitOfFlexGrowSpace = remainingSpace != null ? remainingSpace / flexGrowTotal : null;
        let usedRemainingSpace = 0;
        const rendersYesFlexGrow = this.children.map((v) => {
            if (!v.attributes.flexGrow)
                return null;
            let newOptions = {};
            if (unitOfFlexGrowSpace != null && remainingSpace != null) {
                const prevUsedRemSpace = usedRemainingSpace;
                usedRemainingSpace += unitOfFlexGrowSpace;
                newOptions = Object.assign(Object.assign({}, (attributes.widthAlign === 'stretch' ? { width: widthIfStretch } : {})), { height: Math.round(usedRemainingSpace) - Math.round(prevUsedRemSpace) });
            }
            if (v === nextNode)
                nextMapLocation = v.mapLocationWrapper(inheritMe, newOptions, nodes, weAt);
            return [v, v.getDimensionsWrapper(inheritMe, newOptions)];
        });
        if (!(nextMapLocation instanceof LocationDescriptor))
            throw new Error('nextNode was not within children; this is fatal for xjoin');
        const renders = rendersNoFlexGrow.map((v, i) => v != null ? v : rendersYesFlexGrow[i]);
        const width = attributes.widthAlign === 'stretch'
            ? widthIfStretch
            : attributes.width || Math.max(...renders.map((v) => v[1].width));
        const contentsHeight = renders.reduce((c, v) => c + v[1].height, 0);
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
        let yCumul = 0;
        for (let render of renders) {
            if (render !== renders[0]) {
                const lastCumul = gapCumul;
                gapCumul += gapHeight;
                yCumul += Math.round(gapCumul) - Math.round(lastCumul);
            }
            if (render[0] === nextNode) {
                if (attributes.widthAlign !== 'stretch') {
                    nextMapLocation.x += getDeltaFromSetting(nextMapLocation.w, width, alignInvrt[attributes.widthAlign]);
                }
                nextMapLocation.y += yCumul;
            }
            else {
                yCumul += render[1].height;
            }
        }
        return nextMapLocation;
    }
    render(attributes, inheritMe) {
        const fillChar = new RichChar(attributes.fillChar, attributes).noSize();
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
        const gapIfStatic = typeof attributes.gap === 'number' ? attributes.gap : 0;
        const remainingSpace = attributes.height != null ? attributes.height - cumulatedHeight - gapIfStatic * (this.children.length - 1) : null;
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
        const result = new RichCharGrid();
        const width = attributes.widthAlign === 'stretch'
            ? widthIfStretch
            : attributes.width || Math.max(...renders.map((v) => v.width));
        if (renders.length === 0)
            return RichCharGrid.fill(attributes.width || 0, attributes.height || 0, fillChar);
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
                const gapConstituent = new RichCharGrid([[]]);
                const lastCumul = gapCumul;
                gapCumul += gapHeight;
                gapConstituent.setHeight(Math.round(gapCumul) - Math.round(lastCumul), 'end', fillChar);
                gapConstituent.setWidth(width, 'end', fillChar);
                result.mergeY(gapConstituent);
            }
            if (attributes.widthAlign !== 'stretch')
                render.setWidth(width, alignInvrt[attributes.widthAlign], fillChar);
            result.mergeY(render);
        }
        if (attributes.height != null)
            result.setHeight(attributes.height, alignInvrt[attributes.heightAlign], fillChar);
        return result;
    }
}
YJoin.defaultAttributes = Object.assign(Object.assign({}, MinitelObject.defaultAttributes), { gap: 0, widthAlign: 'stretch', heightAlign: 'start' });
