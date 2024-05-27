import { INode, IFosInterpreter, IStore } from '../types';
export declare class BaseFosInterpreter implements IFosInterpreter {
    store: IStore;
    instruction: INode;
    target: INode;
    committed: boolean;
    constructor(store: IStore, instruction: INode, target: INode);
    getInstruction(): string;
    getTarget(): string;
    isDone(): boolean;
    getTargetEdges(): [string, string][];
    getEdge(instruction: string, target: string): [string, string] | undefined;
    parseInput(input: any): [IFosInterpreter, ...IFosInterpreter[]];
    spawn(childInstruction: INode, childTarget: INode, data?: any): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]];
    createTask(description: string, deps?: INode[]): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]];
    reorderTargetEdges(newEdges: (string | null)[]): IFosInterpreter[];
    setValue<T>(value: T): [IFosInterpreter, ...IFosInterpreter[]];
    getAvailableInstructions(): INode[];
    getBlank(instruction: INode): IFosInterpreter[];
    removeEdge(instruction: string, target: string): IFosInterpreter[];
    followEdge(instructionString: string, targetString: string): IFosInterpreter;
    getStubString(): string;
    findEdgesWithTarget(target: INode): [string, string][];
    formatTree(formatOpts: {
        current?: IFosInterpreter;
        indent?: string;
    }): string;
    getNodeByName(name: string): INode | undefined;
    getValue<T>(): T;
    setName(name: string): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]];
    isName(): boolean;
    isTask(): boolean;
    getTasks(): IFosInterpreter[];
    getTask(name: string): IFosInterpreter;
    getDisplayString(): string;
    getAliases(): [string | null, string | null];
    getEdgeFromStubString(stubString: string): [string, string];
    followEdgeFromStubString(stubString: string): IFosInterpreter;
    getStack(): [IFosInterpreter, ...IFosInterpreter[]];
    getChildren(): IFosInterpreter[];
    getName(): string;
    mutate(instruction: INode, target: INode): [IFosInterpreter, ...IFosInterpreter[]];
    getActions(): {
        [key: string]: INode;
    };
    getAction(alias: string): INode;
    followEdgeFromAlias(alias: string): IFosInterpreter;
    spawnFromAlias(alias: string): IFosInterpreter;
    addAction(alias: string, instruction: INode): [IFosInterpreter, ...IFosInterpreter[]];
}
export declare class RootFosInterpreter extends BaseFosInterpreter implements IFosInterpreter {
    store: IStore;
    target: INode;
    currentPath: IFosInterpreter[];
    history: IFosInterpreter[][];
    committed: boolean;
    constructor(store: IStore, instruction?: INode, target?: INode);
    mutate(newInstruction: INode, newTarget: INode): [IFosInterpreter];
    commit(): void;
    getStack(): [IFosInterpreter];
}
export declare class FosInterpreter extends BaseFosInterpreter implements IFosInterpreter {
    target: INode;
    instruction: INode;
    store: IStore;
    parent: IFosInterpreter;
    constructor(target: INode, instruction: INode, store: IStore, parent: IFosInterpreter);
    getStack(): [IFosInterpreter, ...IFosInterpreter[]];
    mutate(newInstruction: INode, newTarget: INode): [IFosInterpreter, ...IFosInterpreter[]];
}
