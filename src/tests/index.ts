// You expected a testsuite?
// ha! no. im too dumb for that

import { WebSocketServer } from "ws";
import { DuplexBridge } from "ws-duplex-bridge";
import { Minitel } from "../components/minitel.js";
import { XJoin } from "../components/xjoin.js";
import { Scrollable } from "../components/scrollable.js";
import { TextNode } from "../abstract/textnode.js";
import { YJoin } from "../components/yjoin.js";
import { Container } from "../components/container.js";
import { Focusable } from "../components/focusable.js";

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    const stream = new DuplexBridge(ws, { decodeStrings: false });

    const minitel = new Minitel(stream, {});

    let possibleText = new TextNode('Current focus:', {}, minitel);

    const firstOne = new Focusable([
        new XJoin([new TextNode('AB', {}, minitel)], { height: 5, invert: true, widthAlign: 'middle', heightAlign: 'middle' }, minitel),
    ], { autofocus: true, onFocus() {
        firstOne.scrollIntoView();
        possibleText.text = 'Current focus: First one';
        console.log(possibleText.text);
        minitel.queueImmediateRenderToStream();
    } }, minitel);
    const secondOne = new Focusable([
        new XJoin([new TextNode('BA', {}, minitel)], { height: 5, heightAlign: 'middle', widthAlign: 'middle' }, minitel),
    ], { onFocus() {
        secondOne.scrollIntoView();
        possibleText.text = 'Current focus: Second one';
        console.log(possibleText.text);
        minitel.queueImmediateRenderToStream();
    } }, minitel);;

    minitel.appendChild(new YJoin([
        new Scrollable([
            new YJoin([
                firstOne,
                secondOne,
            ], {}, minitel)
        ], { width: 10, height: 5, overflowX: 'hidden', overflowY: 'noscrollbar', disabled: true }, minitel),
        possibleText,
    ], {
        widthAlign: 'middle',
        heightAlign: 'middle',
        gap: 1,
        doubleHeight: true,
        doubleWidth: true,
    }, minitel));

    minitel.queueImmediateRenderToStream();
});
