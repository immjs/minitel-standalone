export const alignInvrt = {
    start: 'end',
    middle: 'middle',
    end: 'start',
};
export function inheritedProps(props) {
    const inheritedProps = ['fillChar', 'fg', 'textAlign', 'bg', 'underline', 'doubleWidth', 'doubleHeight', 'noBlink', 'invert', 'wrap'];
    const result = {};
    let inheritedProp;
    for (inheritedProp of inheritedProps) {
        // @ts-ignore
        if (inheritedProp in props)
            result[inheritedProp] = props[inheritedProp];
    }
    return result;
}
export const padding = {
    normalise(pad) {
        var _a, _b;
        let fullPad; // URDL
        if (typeof pad === 'number') {
            fullPad = [pad, pad, pad, pad];
        }
        else {
            fullPad = [pad[0], pad[1], (_a = pad[2]) !== null && _a !== void 0 ? _a : pad[0], (_b = pad[3]) !== null && _b !== void 0 ? _b : pad[1]];
        }
        return fullPad;
    },
    exludeX(width, pad) {
        width -= pad[1];
        width -= pad[3];
        return width;
    },
    exludeY(height, pad) {
        height -= pad[0];
        height -= pad[2];
        return height;
    },
};
export function toBitArray(char) {
    const int = char.charCodeAt(0).toString(2);
    return int.padStart(8, '0').split('').map((v) => parseInt(v));
}
export function getDeltaFromSetting(size, setInto, align) {
    if (align === 'start')
        return 0;
    if (align === 'end')
        return setInto - size;
    return Math.floor((setInto - size) / 2);
}
