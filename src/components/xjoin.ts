import { MinitelObject } from '../abstract/minitelobject.js';
import { LocationDescriptor } from '../locationdescriptor.js';
import { RichChar } from '../richchar.js';
import { RichCharGrid } from '../richchargrid.js';
import { Align, MinitelObjectAttributes } from '../types.js';
import { getDeltaFromSetting } from '../utils.js';
import { alignInvrt } from '../utils.js';
import type { Minitel } from './minitel.js';

export class XJoin extends MinitelObject<XJoinAttributes> {
    static defaultAttributes: XJoinAttributes = {
        ...MinitelObject.defaultAttributes,
        gap: 0,
        widthAlign: 'start',
        heightAlign: 'stretch',
    }
    defaultAttributes = XJoin.defaultAttributes;
    constructor(children: MinitelObject[], attributes: Partial<XJoinAttributes>, minitel: Minitel) {
        super(children, attributes, minitel);
    }
    getDimensions(attributes: XJoinAttributes, inheritMe: Partial<XJoinAttributes>): { width: number; height: number; } {
        const heightIfStretch = attributes.height || this.children.reduce((p, c) => {
            const h = c.getDimensionsWrapper(inheritMe).height;
            if (h == null) return p;
            return Math.max(p, h);
        }, -Infinity);

        let cumulatedWidth = 0;

        const rendersNoFlexGrow = this.children.map((v) => {
            if (v.attributes.flexGrow) return null;
            const render = v.getDimensionsWrapper(inheritMe, {
                ...(attributes.heightAlign === 'stretch' ? { height: heightIfStretch } : {}),
            });
            cumulatedWidth += render.width;
            return render;
        });

        const flexGrowTotal = this.children.reduce((p, c) => p + +(c.attributes.flexGrow || 0), 0);

        const remainingSpace = attributes.width != null ? attributes.width - cumulatedWidth : null;

        const unitOfFlexGrowSpace = remainingSpace != null ? remainingSpace / flexGrowTotal : null;

        let usedRemainingSpace = 0;

        const rendersYesFlexGrow = this.children.map((v) => {
            if (!v.attributes.flexGrow) return null;
            if (unitOfFlexGrowSpace != null && remainingSpace != null) {
                const prevUsedRemSpace = usedRemainingSpace;
                usedRemainingSpace += unitOfFlexGrowSpace;
                return v.getDimensionsWrapper(inheritMe, {
                    ...(attributes.heightAlign === 'stretch' ? { height: heightIfStretch } : {}),
                    width: Math.round(usedRemainingSpace) - Math.round(prevUsedRemSpace),
                });
            }
            return v.getDimensionsWrapper(inheritMe);
        });

        const dimensions = rendersNoFlexGrow.map((v, i) => v != null ? v : rendersYesFlexGrow[i]) as { width: number; height: number; }[];

        const { gap } = attributes;
        const width = attributes.width
            || (typeof gap === 'number' ? gap : 0) * this.children.length + dimensions.reduce((p, v) => p + v.width, 0);
        
        const height = attributes.heightAlign === 'stretch'
            ? heightIfStretch
            : attributes.height || Math.max(...dimensions.map((v) => v.height));

        return { width, height };
    }

    mapLocation(attributes: XJoinAttributes, inheritMe: Partial<XJoinAttributes>, nextNode: MinitelObject, nodes: MinitelObject<MinitelObjectAttributes, Record<string, any[]>>[], weAt: number): LocationDescriptor {
        const heightIfStretch = attributes.height || this.children.reduce((p, c) => {
            const h = c.getDimensionsWrapper(inheritMe).height;
            if (h == null) return p;
            return Math.max(p, h);
        }, -Infinity);

        let cumulatedWidth = 0;
        let nextMapLocation: LocationDescriptor | null = null as LocationDescriptor | null;

        const rendersNoFlexGrow = this.children.map((v) => {
            if (v.attributes.flexGrow) return null;
            const newOptions = {
                ...(attributes.heightAlign === 'stretch' ? { height: heightIfStretch } : {}),
            };
            if (v === nextNode) nextMapLocation = v.mapLocationWrapper(inheritMe, newOptions, nodes, weAt);
            const render = v.getDimensionsWrapper(inheritMe, newOptions);
            cumulatedWidth += render.width;
            return [v, render];
        });

        const flexGrowTotal = this.children.reduce((p, c) => p + +(c.attributes.flexGrow || 0), 0);

        const gapIfStatic = typeof attributes.gap === 'number' ? attributes.gap : 0;
        
        const remainingSpace = attributes.width != null ? attributes.width - cumulatedWidth - gapIfStatic * (this.children.length - 1) : null;

        const unitOfFlexGrowSpace = remainingSpace != null ? remainingSpace / flexGrowTotal : null;

        let usedRemainingSpace = 0;

        const rendersYesFlexGrow = this.children.map((v) => {
            if (!v.attributes.flexGrow) return null;
            let newOptions = {};
            if (unitOfFlexGrowSpace != null && remainingSpace != null) {
                const prevUsedRemSpace = usedRemainingSpace;
                usedRemainingSpace += unitOfFlexGrowSpace;
                newOptions = {
                    ...(attributes.heightAlign === 'stretch' ? { height: heightIfStretch } : {}),
                    width: Math.round(usedRemainingSpace) - Math.round(prevUsedRemSpace),
                };
            }
            if (v === nextNode) nextMapLocation = v.mapLocationWrapper(inheritMe, newOptions, nodes, weAt);
            return [v, v.getDimensionsWrapper(inheritMe, newOptions)];
        });

        if (!(nextMapLocation instanceof LocationDescriptor)) throw new Error('nextNode was not within children; this is fatal for xjoin');

        const renders = rendersNoFlexGrow.map((v, i) => v != null ? v : rendersYesFlexGrow[i]) as [MinitelObject, {
            width: number;
            height: number;
        }][];

        const height = attributes.heightAlign === 'stretch'
            ? heightIfStretch
            : attributes.height || Math.max(...renders.map((v) => v[1].height));

        const contentsWidth = renders.reduce((c, v) => c + v[1].width, 0);
        // space-between: w / (n - 1)
        // space-around: w / n
        // space-evenly: w / (n + 1)
        let gapWidth: number;
        if (typeof attributes.gap === 'number') {
            gapWidth = attributes.gap;
        } else if (attributes.width != null) {
            const mappingTable = {
                'space-between': renders.length - 1,
                'space-around': renders.length,
                'space-evenly': renders.length + 1,
            };
            gapWidth = (attributes.width - contentsWidth) / mappingTable[attributes.gap];
        } else {
            gapWidth = 0;
        }

        let gapCumul = 0;

        let xCumul = 0;

        for (let render of renders) {
            if (render !== renders[0]) {
                const lastCumul = gapCumul;
                gapCumul += gapWidth;
                xCumul += Math.round(gapCumul) - Math.round(lastCumul);
            }

            if (render[0] === nextNode) {
                if (attributes.heightAlign !== 'stretch') {
                    nextMapLocation.y += getDeltaFromSetting(nextMapLocation.h, height, alignInvrt[attributes.heightAlign]);
                }
                nextMapLocation.x += xCumul;
            } else {
                xCumul += render[1].width;
            }
        }
        return nextMapLocation;
    }

    render(attributes: XJoinAttributes, inheritMe: Partial<XJoinAttributes>) {
        const fillChar = new RichChar(attributes.fillChar, attributes).noSize();

        const heightIfStretch = attributes.height || this.children.reduce((p, c) => {
            const h = c.getDimensionsWrapper(inheritMe).height;
            if (h == null) return p;
            return Math.max(p, h);
        }, -Infinity);

        let cumulatedWidth = 0;

        const rendersNoFlexGrow = this.children.map((v) => {
            if (v.attributes.flexGrow) return null;
            const render = v.renderWrapper(inheritMe, {
                ...(attributes.heightAlign === 'stretch' ? { height: heightIfStretch } : {}),
            });
            cumulatedWidth += render.width;
            return render;
        });

        const flexGrowTotal = this.children.reduce((p, c) => p + +(c.attributes.flexGrow || 0), 0);

        const gapIfStatic = typeof attributes.gap === 'number' ? attributes.gap : 0;
        
        const remainingSpace = attributes.width != null ? attributes.width - cumulatedWidth - gapIfStatic * (this.children.length - 1) : null;

        const unitOfFlexGrowSpace = remainingSpace != null ? remainingSpace / flexGrowTotal : null;

        let usedRemainingSpace = 0;

        const rendersYesFlexGrow = this.children.map((v) => {
            if (!v.attributes.flexGrow) return null;
            if (unitOfFlexGrowSpace != null && remainingSpace != null) {
                const prevUsedRemSpace = usedRemainingSpace;
                usedRemainingSpace += unitOfFlexGrowSpace;
                return v.renderWrapper(inheritMe, {
                    ...(attributes.heightAlign === 'stretch' ? { height: heightIfStretch } : {}),
                    width: Math.round(usedRemainingSpace) - Math.round(prevUsedRemSpace),
                });
            }
            return v.renderWrapper(inheritMe);
        });

        const renders = rendersNoFlexGrow.map((v, i) => v != null ? v : rendersYesFlexGrow[i]) as RichCharGrid[];

        const result = new RichCharGrid();

        const height = attributes.heightAlign === 'stretch'
            ? heightIfStretch
            : attributes.height || Math.max(...renders.map((v) => v.height));

        if (renders.length === 0) return RichCharGrid.fill(attributes.width || 0, attributes.height || 0, fillChar);

        const contentsWidth = renders.reduce((c, v) => c + v.width, 0);
        // space-between: w / (n - 1)
        // space-around: w / n
        // space-evenly: w / (n + 1)
        let gapWidth: number;
        if (typeof attributes.gap === 'number') {
            gapWidth = attributes.gap;
        } else if (attributes.width != null) {
            const mappingTable = {
                'space-between': renders.length - 1,
                'space-around': renders.length,
                'space-evenly': renders.length + 1,
            };
            gapWidth = (attributes.width - contentsWidth) / mappingTable[attributes.gap];
        } else {
            gapWidth = 0;
        }

        let gapCumul = 0;

        for (let render of renders) {
            if (render !== renders[0]) {
                const gapConstituent = new RichCharGrid([]);
                const lastCumul = gapCumul;
                gapCumul += gapWidth;
                gapConstituent.setHeight(height, 'end', fillChar);
                gapConstituent.setWidth(Math.round(gapCumul) - Math.round(lastCumul), 'end', fillChar);
                result.mergeX(gapConstituent);
            }

            if (attributes.heightAlign !== 'stretch') render.setHeight(height, alignInvrt[attributes.heightAlign], fillChar);
            result.mergeX(render);
        }
        if (attributes.width != null) result.setWidth(attributes.width, alignInvrt[attributes.widthAlign], fillChar);
        return result;
    }
}

export interface XJoinAttributes extends MinitelObjectAttributes {
    gap: number | 'space-between' | 'space-around' | 'space-evenly';
    widthAlign: Align;
    heightAlign: Align | 'stretch';
}
