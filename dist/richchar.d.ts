import { CharAttributes } from './types.js';
export declare class RichChar<T> {
    attributes: CharAttributes;
    delta: T extends null ? [number, number] : undefined;
    actualChar: T extends null ? RichChar<string> : undefined;
    char: T;
    serialize(): string | NonNullable<T extends null ? [number, number] : undefined>;
    static getDelimited(attributes: CharAttributes, charset: number): {
        underline: boolean;
        charset: number;
        bg?: number | undefined;
    };
    static normalizeAttributes(attributes: Partial<CharAttributes>): CharAttributes;
    static getAttributesApplier(attributes: Partial<CharAttributes>, previousAttributes: CharAttributes): string;
    attributesDiff(attributes: CharAttributes): CharAttributes;
    constructor(char: T, attributes?: Partial<CharAttributes>, ...[delta, actualChar,]: T extends null ? [[number, number], RichChar<string>] : [undefined?, undefined?]);
    areAttributesEqual(attributes: CharAttributes): boolean;
    isEqual(that: RichChar<string> | RichChar<null>): boolean;
    copy(): RichChar<T>;
    noSize(): RichChar<T>;
}
