"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLNode = exports.LinkedList = void 0;
class LinkedList {
    constructor() { }
    isEmpty() {
        return !this.head;
    }
    prepend(newTail) {
        newTail.next = this.tail;
        this.tail = newTail;
        if (!this.head)
            this.head = newTail;
    }
    removeNodeAfter(before) {
        var _a;
        if (before == null) {
            this.tail = (_a = this.tail) === null || _a === void 0 ? void 0 : _a.next;
            if (!this.tail)
                this.head = undefined;
        }
        else {
            if (!before.next)
                return;
            before.setNext(before.next.next);
            if (!before.next) {
                this.head = before;
            }
        }
    }
    append(newHead) {
        if (!this.head) {
            this.tail = newHead;
        }
        else {
            this.head.next = newHead;
        }
        this.head = newHead;
    }
}
exports.LinkedList = LinkedList;
class LLNode {
    constructor(expected, callback) {
        this.expected = expected;
        this.callback = callback;
    }
    setNext(newNext) {
        this.next = newNext;
    }
}
exports.LLNode = LLNode;
