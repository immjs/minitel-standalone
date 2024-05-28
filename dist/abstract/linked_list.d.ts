export declare class LinkedList {
    head: LLNode | undefined;
    tail: LLNode | undefined;
    constructor();
    isEmpty(): boolean;
    prepend(newTail: LLNode): void;
    removeNodeAfter(before: LLNode | undefined): void;
    append(newHead: LLNode): void;
}
export declare class LLNode {
    expected: string | RegExp;
    callback: (_arg0: string) => {};
    next: LLNode | undefined;
    constructor(expected: string | RegExp, callback: (_arg0: string) => any);
    setNext(newNext: LLNode | undefined): void;
}
