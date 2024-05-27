import { INode, NodeStatus, IStore } from '../types';
export declare class NoContextNode<T> implements INode {
    value: T;
    store: IStore;
    address: string;
    constructor(value: T, store: IStore, internal?: boolean);
    toJSON(): string;
    toString(): string;
    getAddress(): string;
    getValue(): T;
    getEdge(edgeType: string, child: string): [string, string] | undefined;
    getEdges(): [string, string][];
    addEdge(edgeType: string, target: string): INode;
    removeEdge(edgeType: string, target: string): INode;
    updateEdge(oldEdgeType: string, oldTarget: string, newEdgeType: string, newTarget: string): INode;
    delete(): void;
    asInstruction(): (input: INode) => Promise<INode>;
    generateTarget<S>(data: S): INode;
    merge(other: INode): INode;
}
export declare class FosNode extends NoContextNode<[string, string][]> implements INode {
    constructor(value: [string, string][], store: IStore);
    getEdges(): [string, string][];
    printTree(): void;
    toString(): string;
    get status(): NodeStatus;
    isDone(): boolean;
    isRejected(): boolean;
    isLeaf(): boolean;
    addEdge(edgeType: string, target: string): INode;
    removeEdge(edgeType: string, target: string): INode;
    updateEdge(oldEdgeType: string, oldTarget: string, newEdgeType: string, newTarget: string): INode;
    delete(): void;
    asInstruction(): (input: INode) => Promise<INode>;
    merge(other: INode): INode;
    generateTarget<S>(data?: S): INode;
}
