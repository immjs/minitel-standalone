export class RichChar {
    serialize() {
        // I could do it better..... but yk
        const serializedAttrs = [
            this.attributes.fg,
            this.attributes.bg,
            this.attributes.underline,
            this.attributes.doubleHeight,
            this.attributes.doubleWidth,
            this.attributes.noBlink,
            this.attributes.invert,
            this.attributes.charset,
        ];
        if (this.delta)
            return this.delta;
        return JSON.stringify([serializedAttrs, this.char]);
    }
    // skip: boolean;
    static getDelimited(attributes, charset) {
        return Object.assign(Object.assign({}, (charset !== 1 ? { bg: attributes.bg } : {})), { underline: attributes.underline, charset: attributes.charset });
    }
    static normalizeAttributes(attributes) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return {
            fg: (_a = attributes.fg) !== null && _a !== void 0 ? _a : 7,
            bg: (_b = attributes.bg) !== null && _b !== void 0 ? _b : 0,
            underline: (_c = attributes.underline) !== null && _c !== void 0 ? _c : false,
            doubleHeight: (_d = attributes.doubleHeight) !== null && _d !== void 0 ? _d : false,
            doubleWidth: (_e = attributes.doubleWidth) !== null && _e !== void 0 ? _e : false,
            noBlink: (_f = attributes.noBlink) !== null && _f !== void 0 ? _f : true,
            invert: (_g = attributes.invert) !== null && _g !== void 0 ? _g : false,
            charset: (_h = attributes.charset) !== null && _h !== void 0 ? _h : 0,
        };
    }
    static getAttributesApplier(attributes, previousAttributes) {
        var _a, _b;
        const result = [];
        const offsets = {
            charset: [0x0f, 0x0e, 0x19],
            noBlink: 0x48,
            fg: 0x40,
            bg: 0x50,
            underline: 0x59,
            invert: 0x5C,
        };
        let attribute;
        for (attribute in offsets) {
            if (attribute in attributes) {
                const relevantOffset = offsets[attribute];
                result.push(`\x1b${String.fromCharCode(typeof relevantOffset === 'number'
                    ? Number(attributes[attribute]) + relevantOffset
                    : relevantOffset[Number(attributes[attribute])])}`);
            }
        }
        if ('doubleHeight' in attributes || 'doubleWidth' in attributes) {
            const doubleWidth = (_a = attributes.doubleWidth) !== null && _a !== void 0 ? _a : previousAttributes.doubleWidth;
            const doubleHeight = (_b = attributes.doubleHeight) !== null && _b !== void 0 ? _b : previousAttributes.doubleHeight;
            result.push(`\x1b${String.fromCharCode([[0x4c, 0x4d], [0x4e, 0x4f]][+doubleWidth][+doubleHeight])}`);
        }
        return result.join('');
    }
    attributesDiff(attributes) {
        const result = {};
        let attribute;
        for (attribute in attributes) {
            if (attributes[attribute] !== this.attributes[attribute]) {
                // TYPESCRIPT TU SAOULES
                // @ts-ignore
                result[attribute] = this.attributes[attribute];
            }
        }
        return result;
    }
    constructor(char, attributes = {}, ...[delta, actualChar,]) {
        this.char = char;
        this.delta = delta;
        this.actualChar = actualChar;
        this.attributes = RichChar.normalizeAttributes(attributes);
    }
    areAttributesEqual(attributes) {
        return Object.keys(this.attributes)
            .every((attribute) => attributes[attribute] === this.attributes[attribute]);
    }
    isEqual(that) {
        return this.char === that.char
            && this.areAttributesEqual(that.attributes)
            && (this.char === null
                ? (this.delta[0] == that.delta[0] && this.delta[1] == that.delta[1])
                // && this.actualChar!.isEqual(that.actualChar!)
                : true);
    }
    copy() {
        // typescript shall go down to hell
        return new RichChar(this.char, this.attributes, ...[this.delta, this.actualChar]);
    }
    noSize() {
        const newAttributes = Object.assign(Object.assign({}, this.attributes), { doubleWidth: false, doubleHeight: false });
        return new RichChar(this.char, newAttributes, ...[this.delta, this.actualChar]);
    }
}
