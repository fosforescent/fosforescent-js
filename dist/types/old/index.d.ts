import { INode, IStore, IFosInterpreter } from "./types";
/**
 * This is meant to provide an interface that doesn't require explicit declaration of options & parameters.
 * When serialization is a thing, it should take care of that.  Currently it uses the "addExamples" function
 *
 * @returns An initialized FosInterpreter with sensible defaults
 */
export type FosOptions = {
    demo?: boolean;
    key?: string;
};
export interface IFosInstance<T> {
    getValue(): T;
    updateValue(value: T): T;
    registerAction(action: string, callback: (node: IFosInstance<T>) => Promise<IFosInstance<T>>): void;
    doAction(action: string): Promise<IFosInstance<T>>;
}
export interface IExtension {
    name: string;
    icon: string;
    baseNode: INode;
    validate: (node: INode) => INode;
}
declare class FosInstance<T> implements IFosInstance<T> {
    store: IStore;
    currentTransaction: number;
    transactions: IFosInterpreter[];
    extensions: IExtension[];
    constructor(options?: FosOptions);
    getRoot(): IFosInterpreter;
    getRootOptions(): IExtension[];
    getPaths(): void;
    followPath(index: number): void;
    proposeUpdate(index: number, instruction: INode, target: INode): void;
    parse(input: string): INode;
    getChildren(): IFosInstance<T>[];
    getRootAddress(): string;
    registerRootInstruction(pattern: INode): void;
    registerExtension(extension: IExtension): void;
    mine(): boolean;
    import(data: any): void;
    export(): void;
    createTransaction(): IFosInterpreter;
    commit(stack: IFosInterpreter[]): void;
    getValue(): any;
    updateValue(value: any): any;
    registerAction(action: string, callback: (node: IFosInstance<T>) => Promise<IFosInstance<T>>): void;
    doAction(action: string): Promise<IFosInstance<T>>;
}
export declare const Fos: (options?: FosOptions) => FosInstance<unknown>;
export type { IStore, INode, IFosInterpreter };
