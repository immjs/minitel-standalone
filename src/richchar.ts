import { CharAttributes, RealCharAttributes } from './types.js';

export class RichChar<T> {
    attributes: RealCharAttributes;
    delta: T extends null ? [number, number] : undefined;
    actualChar: T extends null ? RichChar<string> : undefined;
    char: T;
    // skip: boolean;
    static getDelimited(attributes: CharAttributes, charset: number) {
        return {
            ...(charset !== 1 ? { bg: attributes.bg } : {}),
            underline: attributes.underline,
            charset: attributes.charset,
        }
    }
    static normalizeAttributes(attributes: Partial<RealCharAttributes>): RealCharAttributes {
        return {
            fg: attributes.fg ?? 7,
            bg: attributes.bg ?? 0,
            underline: attributes.underline ?? false,
            doubleHeight: attributes.doubleHeight ?? false,
            doubleWidth: attributes.doubleWidth ?? false,
            noBlink: attributes.noBlink ?? true,
            invert: attributes.invert ?? false,
            charset: attributes.charset ?? 0,
        };
    }
    static getAttributesApplier(attributes: Partial<RealCharAttributes>, previousAttributes: RealCharAttributes) {
        const result = [];
        const offsets: Record<keyof CharAttributes, number | number[]> = {
            charset: [0x0f, 0x0e, 0x19],
            noBlink: 0x48,
            fg: 0x40,
            bg: 0x50,
            underline: 0x59,
            invert: 0x5C,
        };
        let attribute: keyof CharAttributes;
        for (attribute in offsets) {
            if (attribute in attributes) {
                const relevantOffset = offsets[attribute];
                result.push(`\x1b${String.fromCharCode(
                    typeof relevantOffset === 'number'
                    ?   Number(attributes[attribute]) + relevantOffset
                    :   relevantOffset[Number(attributes[attribute])]
                )}`);
            }
        }
        if ('doubleHeight' in attributes || 'doubleWidth' in attributes) {
            const doubleWidth = attributes.doubleWidth ?? previousAttributes.doubleWidth;
            const doubleHeight = attributes.doubleHeight ?? previousAttributes.doubleHeight;
            result.push(`\x1b${String.fromCharCode([[0x4c, 0x4d], [0x4e, 0x4f]][+doubleWidth][+doubleHeight])}`);
        }
        return result.join('');
    }
    attributesDiff(attributes: CharAttributes) {
        const result = {} as CharAttributes;
        let attribute: keyof CharAttributes;
        for (attribute in attributes) {
            if (attributes[attribute] !== this.attributes[attribute]) {
                // TYPESCRIPT TU SAOULES
                // @ts-ignore
                result[attribute] = this.attributes[attribute];
            }
        }
        return result;
    }
    constructor(
        char: T,
        attributes: Partial<CharAttributes> = {},
        ...[
            delta,
            actualChar,
        ]: T extends null ? [[number, number], RichChar<string>] : [undefined?, undefined?]
    ) {
        this.char = char;
        this.delta = delta as T extends null ? [number, number] : undefined;
        this.actualChar = actualChar as T extends null ? RichChar<string> : undefined;
        this.attributes = RichChar.normalizeAttributes(attributes);
    }
    areAttributesEqual(attributes: CharAttributes): boolean {
        return (Object.keys(this.attributes) as (keyof CharAttributes)[])
            .every((attribute) => attributes[attribute] === this.attributes[attribute])
    }
    isEqual(that: RichChar<string> | RichChar<null>): boolean {
        return this.char === that.char
            && this.areAttributesEqual(that.attributes)
            && (
                this.char === null
                    ? (this.delta![0] == that.delta![0] && this.delta![1] == that.delta![1])
                        // && this.actualChar!.isEqual(that.actualChar!)
                    : true
            )
    }
    copy() {
        // typescript shall go down to hell
        return new RichChar(this.char, this.attributes, ...([this.delta, this.actualChar] as T extends null ? [[number, number], RichChar<string>] : [undefined?, undefined?]));
    }
    noSize() {
        const newAttributes = {
            ...this.attributes,
            doubleWidth: false,
            doubleHeight: false,
        };
        return new RichChar(this.char, newAttributes, ...([this.delta, this.actualChar] as T extends null ? [[number, number], RichChar<string>] : [undefined?, undefined?]));
    }
}
