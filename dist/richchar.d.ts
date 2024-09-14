import { CharAttributes, RealCharAttributes } from './types.js';
export declare class RichChar<T> {
    attributes: RealCharAttributes;
    delta: T extends null ? [number, number] : undefined;
    actualChar: T extends null ? RichChar<string> : undefined;
    char: T;
    static getDelimited(attributes: CharAttributes, charset: number): {
        underline: boolean;
        charset: number;
        bg?: number | undefined;
    };
    static normalizeAttributes(attributes: Partial<RealCharAttributes>): RealCharAttributes;
    static getAttributesApplier(attributes: Partial<RealCharAttributes>, previousAttributes: RealCharAttributes): string;
    attributesDiff(attributes: CharAttributes): CharAttributes;
    constructor(char: T, attributes?: Partial<CharAttributes>, ...[delta, actualChar,]: T extends null ? [[number, number], RichChar<string>] : [undefined?, undefined?]);
    areAttributesEqual(attributes: CharAttributes): boolean;
    isEqual(that: RichChar<string> | RichChar<null>): boolean;
    copy(): RichChar<T>;
    noSize(): RichChar<T>;
}
