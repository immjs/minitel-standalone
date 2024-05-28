export class LinkedList {
    head: LLNode | undefined;
    tail: LLNode | undefined;
    constructor() {}

    isEmpty() {
        return !this.head;
    }

    prepend(newTail: LLNode) {
        newTail.next = this.tail;
        this.tail = newTail;
        if (!this.head) this.head = newTail;
    }
    removeNodeAfter(before: LLNode | undefined) {
        if (before == null) {
            this.tail = this.tail?.next;
            if (!this.tail) this.head = undefined;
        } else {
            if (!before.next) return;
            before.setNext(before.next.next);
            if (!before.next) {
                this.head = before;
            }
        }
    }
    append(newHead: LLNode) {
        if (!this.head) {
            this.tail = newHead;
        } else {
            this.head.next = newHead;
        }
        this.head = newHead;
    }
}

export class LLNode {
    expected: string | RegExp;
    callback: (_arg0: string) => {};
    next: LLNode | undefined;
    constructor(expected: string | RegExp, callback: (_arg0: string) => any) {
        this.expected = expected;
        this.callback = callback;
    }
    setNext(newNext: LLNode | undefined) {
        this.next = newNext;
    }
}
