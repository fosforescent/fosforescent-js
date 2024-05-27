import { INode, IStore, IFosInterpreter } from '../types';
import { RootFosInterpreter } from "../interpreter";
export declare enum NodeType {
    None = 0,
    Internal = 1,
    External = 2
}
export declare class Store implements IStore {
    table: Map<string, [string, string][]>;
    computations: Map<string, Map<string, string[]>>;
    voidAddress: string;
    unitAddress: string;
    nameAddress: string;
    previousVersionAddress: string;
    allOfAddress: string;
    rootsHistory: string[];
    listeners: ((oldInterpreter: IFosInterpreter, newInterpreter: IFosInterpreter) => void)[];
    externalData: Map<string, INode>;
    hashFunc: (item: INode) => string;
    cache: Map<string, INode>;
    version: number;
    constructor({ json, publicKey }?: {
        json?: string;
        publicKey?: string;
    });
    init(): void;
    setRoot(root: IFosInterpreter): void;
    listenRoot(callback: (oldInterpreter: IFosInterpreter, newInterpreter: IFosInterpreter) => void): void;
    updateRoot(oldInterpreter: IFosInterpreter, newInterpreter: IFosInterpreter): IFosInterpreter[];
    getRootFromStubString(stubString: string): IFosInterpreter;
    getRoot(node?: INode): RootFosInterpreter;
    hashString(stringToHash: string): string;
    hash(edges: [string, string][]): string;
    checkAddress(address: string, externalAllowed?: boolean): NodeType;
    create<T>(value: T): INode;
    insert(edges: [string, string][]): string;
    insertExternal(data: INode): string;
    remove(node: INode): void;
    getNodeByAddress(address: string): INode;
    query(query: INode): INode[];
    matchPattern(pattern: INode, entry: INode): INode[];
    queryTriple(subject: INode, predicate: INode, object: INode): [INode, INode, INode][];
    negativeQueryTriple(subject: INode, predicate: INode, object: INode): [INode, INode, INode][];
    toJSON(): (string | number)[];
    fromJSON(json: string): void;
    upgradeFunctions(): ((json: string) => string)[];
}
