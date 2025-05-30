var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Container } from './container.js';
import { RichCharGrid } from '../richchargrid.js';
import { SingletonArray } from '../custom_arrays.js';
import { RichChar } from '../richchar.js';
import { expectNextChars } from '../inputConstants.js';
import { InvalidRender } from '../abstract/invalidrender.js';
import { LLNode, LinkedList } from '../abstract/linked_list.js';
export const specialCharTranslation = {
    à: '\x19\x41a',
    â: '\x19\x43a',
    ä: '\x19\x48a',
    é: '\x19\x42e',
    è: '\x19\x41e',
    ê: '\x19\x43e',
    ë: '\x19\x48e',
    î: '\x19\x43i',
    ï: '\x19\x48i',
    ö: '\x19\x48o',
    ô: '\x19\x43o',
    ù: '\x19\x41u',
    û: '\x19\x43u',
    ü: '\x19\x48u',
    ç: '\x19\x4bc',
    œ: '\x19\x7a',
    Œ: '\x19\x6a',
    '°': '\x19\x30',
    '₤': '\x19\x23',
    '←': '\x19\x2C',
    '↑': '\x19\x2D',
    '→': '\x19\x2E',
    '↓': '\x19\x2F',
};
export class Minitel extends Container {
    constructor(stream, settings) {
        const that = null;
        super([], {}, that);
        this.renderInvalidated = false;
        this.focusedObj = null;
        this.lastImmediate = null;
        this.tillReady = [];
        this.minitel = this;
        this.children = new SingletonArray();
        this.settings = Object.assign({ statusBar: false, localEcho: false, extendedMode: true, defaultCase: 'upper' }, settings);
        this.stream = stream;
        const { width, height } = this.getDimensions();
        this.previousRender = RichCharGrid.fill(width, height, new RichChar(' '));
        this.rxQueue = new LinkedList();
        // Take care of localEcho
        this.queueCommand([
            '\x1b\x3b',
            this.settings.localEcho ? '\x61' : '\x60',
            '\x58',
            '\x52',
        ].join(''), '\x1b\x3b\x63');
        // Take care of extendedMode
        this.queueCommand([
            '\x1b\x3b',
            this.settings.extendedMode ? '\x69' : '\x6A',
            '\x59',
            '\x41',
        ].join(''), '\x1b\x3b\x73\x59');
        // Set capitalization
        this.queueCommand([
            '\x1b\x3a',
            this.settings.defaultCase === 'upper' ? '\x69' : '\x6A',
            '\x45',
        ].join(''), '\x1b\x3a\x73');
        this.tillReady.push(this.queueCommandAsync('\x1b\x39\x7b', /^\x01.{3}\x04$/)
            .then((function (result) {
            this.model = result.slice(1, 4);
        }).bind(this)));
        this.tillReady.push(this.queueCommandAsync('\x1b\x39\x74', '\x1b\x3a\x75')
            .then((function (result) {
            this.speed = { '\x52': 300, '\x64': 1200, '\x76': 4800, '\x7f': 9600 }[result[3]];
        }).bind(this)));
        this.stream.write('\x1f\x40\x41\x18\x0c'); // Clear status; clear screen
        let acc = '';
        let howManyToExpect = 0;
        this.stream.on('data', (data) => {
            const str = data.toString();
            for (let char of str) {
                howManyToExpect = Math.max(0, howManyToExpect - 1);
                acc += char;
                if (char === '\x04') {
                    howManyToExpect = 0;
                }
                else {
                    howManyToExpect = Math.max(0, howManyToExpect + (expectNextChars[acc] || 0));
                }
                if (howManyToExpect === 0) {
                    let prev = undefined;
                    let current = this.rxQueue.tail;
                    while (current) {
                        if (current.expected instanceof RegExp) {
                            if (current.expected.test(acc)) {
                                break;
                            }
                        }
                        else {
                            if (acc.startsWith(current.expected)) {
                                break;
                            }
                        }
                        prev = current;
                        current = current.next;
                    }
                    if (current) {
                        this.rxQueue.removeNodeAfter(prev);
                        current.callback(acc);
                        acc = '';
                        continue;
                    }
                    this.emit('key', acc);
                    if (acc.match(/^([a-zA-Z0-9,\.';\-\:?!"#$%&\(\)\[\]\{\}<>@+=*/_~ ]|\x0d|\x13\x47|\x1b\x5b[\x41\x42\x43\x44])$/g)) {
                        const focusedObj = this.focusedObj;
                        if (focusedObj) {
                            focusedObj.emit('key', acc);
                        }
                    }
                    else if (acc === '\x13\x48' || acc === '\x13\x42') {
                        const deltaTable = {
                            '\x13\x48': 1,
                            '\x13\x42': -1,
                        };
                        this.focusDelta(deltaTable[acc]);
                        this.renderToStream();
                    }
                    acc = '';
                    continue;
                }
            }
        });
    }
    getDimensions() {
        return { width: 40, height: 24 + +this.settings.statusBar };
    }
    readyAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(this.tillReady);
        });
    }
    invalidateRender() {
        this.renderInvalidated = true;
    }
    mapLocation(attributes, inheritMe, nextNode, nodes, weAt) {
        const { width, height } = this.getDimensions();
        return nextNode.mapLocationWrapper(inheritMe, { width, height }, nodes, weAt);
    }
    renderString(clear = false) {
        this.renderInvalidated = false;
        let renderGrid;
        const { width, height } = this.getDimensions();
        try {
            renderGrid = this.renderWrapper({}, { width, height });
        }
        catch (err) {
            if (err instanceof InvalidRender) {
                // console.error(err);
                return this.renderString();
            }
            else {
                throw err;
            }
        }
        renderGrid.setHeight(height, 'start', new RichChar(' '));
        renderGrid.setWidth(width, 'start', new RichChar(' '));
        this.handleFocus();
        const outputString = [];
        if (clear) {
            outputString.push('\x0c');
            this.previousRender = RichCharGrid.fill(width, height, new RichChar(' '));
        }
        outputString.push('\x14\x1e');
        let lastAttributes = Minitel.defaultScreenAttributes;
        let skippedACharCounter = 0;
        let lastChar = null;
        // console.log(this.previousRender.toString());
        for (let lineIdx in renderGrid.grid) {
            if (+lineIdx === 0 && this.settings.statusBar)
                outputString.push('\x1f\x40\x41');
            const line = renderGrid.grid[lineIdx];
            for (let charIdx in line) {
                const char = line[charIdx];
                const prevChar = this.previousRender.grid[lineIdx][charIdx];
                if (char.isEqual(prevChar)
                    && (lastChar == null
                        || (lastChar[0].attributes.bg === char.attributes.bg)
                            === (lastChar[1].attributes.bg === prevChar.attributes.bg))
                    && (char.char != null
                        || (renderGrid.grid[+lineIdx + char.delta[0]][+charIdx + char.delta[1]].isEqual(this.previousRender.grid[+lineIdx + char.delta[0]][+charIdx + char.delta[1]])))) {
                    skippedACharCounter += 1;
                    lastAttributes = Object.assign({ fg: 7, bg: 0, doubleWidth: false, doubleHeight: false, noBlink: true, invert: false }, RichChar.getDelimited(prevChar.attributes, lastAttributes.charset));
                }
                else {
                    if (skippedACharCounter !== 0) {
                        outputString.push(this.toCursorMove(+lineIdx, +charIdx));
                        lastAttributes.charset = 0;
                    }
                    // outputString.push('\x09'.repeat(skippedACharCounter));
                    const diff = char.attributesDiff(lastAttributes);
                    const applier = RichChar.getAttributesApplier(diff, lastAttributes);
                    outputString.push(applier);
                    lastAttributes = char.attributes;
                    outputString.push(typeof char.char === 'string'
                        ? (specialCharTranslation[char.char] || char.char.charCodeAt(0) < 128 ? char.char : '\x7f')
                        : ['', ' '].at(char.delta[0]));
                    skippedACharCounter = 0;
                }
                lastChar = [char, prevChar];
            }
            if (lastAttributes.doubleHeight)
                outputString.push('\x0b');
            if (+lineIdx === 0 && this.settings.statusBar)
                outputString.push('\x1f\x41\x41');
            lastAttributes = Object.assign(Object.assign({}, lastAttributes), RichChar.getDelimited(Minitel.defaultScreenAttributes, lastAttributes.charset));
        }
        this.previousRender = renderGrid.copy();
        if (this.focusedObj) {
            const locationDescriptor = renderGrid.locationDescriptors.get(this.focusedObj);
            if (locationDescriptor && 'focusCursorAt' in this.focusedObj && this.focusedObj.focusCursorAt != null) {
                const { x, y, w, h } = locationDescriptor;
                const [cursorDeltaY, cursorDeltaX] = this.focusedObj.focusCursorAt;
                outputString.push(this.toCursorMove(Math.min(y + cursorDeltaY, y + h - 1), Math.min(x + cursorDeltaX, x + w)));
                outputString.push('\x11');
            }
        }
        // parcoursuop forbid me from going to prépa. RIP :')
        let preOptimized = outputString.filter((v) => v !== '').join('€');
        preOptimized = preOptimized.replace(/(.)(€\1){2,62}/g, (v) => `${v[0]}\x12${String.fromCharCode((v.length + 1) / 2 + 63)}`);
        // console.log(JSON.stringify(preOptimized));
        return preOptimized.split('€').join('');
    }
    toCursorMove(y, x) {
        return [
            '\x1f',
            String.fromCharCode(64 + y + (this.settings.statusBar ? 0 : 1)),
            String.fromCharCode(64 + x + 1),
        ].join('');
    }
    handleFocus() {
        const focusables = this.focusables();
        if (this.focusedObj) {
            const isInTree = this.has(this.focusedObj);
            if (this.focusedObj.focused !== isInTree)
                this.focusedObj.focused = isInTree;
            if (this.focusedObj.focused && this.focusedObj.disabled)
                this.focusedObj.focused = false;
            if (isInTree && !this.focusedObj.disabled)
                return;
            this.focusedObj = null;
        }
        const oneWithAutofocusIdx = focusables.findLastIndex((v) => v.attributes.autofocus);
        if (oneWithAutofocusIdx !== -1)
            this.focusedObj = focusables[oneWithAutofocusIdx];
        if (this.focusedObj && !this.focusedObj.focused)
            this.focusedObj.focused = true;
    }
    focusDelta(delta) {
        const focusables = this.focusables();
        if (this.focusedObj == null)
            return void (this.focusedObj = focusables[{ '-1': focusables.length - 1, '1': 0 }[delta]]);
        let curr = focusables.indexOf(this.focusedObj);
        if (curr === -1)
            return void (this.focusedObj = focusables[{ '-1': focusables.length - 1, '1': 0 }[delta]]);
        curr += delta;
        curr %= focusables.length;
        curr += focusables.length;
        curr %= focusables.length;
        if (this.focusedObj && this.focusedObj.focused)
            this.focusedObj.focused = false;
        this.focusedObj = focusables[curr];
        this.focusedObj.focused = true;
        return this.focusedObj;
    }
    queueImmediateRenderToStream() {
        // its so dirty i love it haha
        if (this.lastImmediate != null)
            clearImmediate(this.lastImmediate);
        this.lastImmediate = setImmediate(() => {
            this.renderToStream();
            this.lastImmediate = null;
        });
    }
    renderToStream(clear = false) {
        // this.stream.write('\x0c');
        this.stream.write(this.renderString(clear));
    }
    queueCommand(command, expected, callback = ((_arg0) => { })) {
        const newNode = new LLNode(expected, callback);
        this.rxQueue.append(newNode);
        this.stream.write(command);
    }
    queueCommandAsync(command, expected) {
        return new Promise((r) => this.queueCommand(command, expected, r));
    }
    get colors() {
        if (this.model === 'Bs0') {
            return [
                [0, 0, 0], // |0         |Black  |0%        |
                [255, 0, 0], // |1         |Red    |50%       |
                [0, 255, 0], // |2         |Green  |70%       |
                [255, 255, 0], // |3         |Yellow |90%       |
                [0, 0, 255], // |4         |Blue   |40%       |
                [255, 0, 255], // |5         |Magenta|60%       |
                [0, 255, 255], // |6         |Cyan   |80%       |
                [255, 255, 255], // |7         |White  |100%      |
            ];
        }
        return [
            [0, 0, 0],
            [127, 127, 127],
            [179, 179, 179],
            [229, 229, 229],
            [102, 102, 102],
            [153, 153, 153],
            [204, 204, 204],
            [255, 255, 255],
        ];
    }
}
Minitel.defaultScreenAttributes = {
    fg: 7,
    bg: 0,
    underline: false,
    doubleWidth: false,
    doubleHeight: false,
    noBlink: true,
    invert: false,
    charset: 0,
};
