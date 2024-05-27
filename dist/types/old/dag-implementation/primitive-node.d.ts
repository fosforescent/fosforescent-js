import { IFosInterpreter, INode, IStore } from '..';
import { FosNode, NoContextNode } from './node';
export declare class PrimitiveStringNode extends NoContextNode<string> {
}
export declare class PrimitiveNumberNode extends NoContextNode<string> {
}
export declare class PrimitiveInstructionNode extends FosNode implements INode {
    constructor(interpreter: IFosInterpreter);
    addTypeConstructor(alias: string): void;
}
export declare class TreeInstructionNode extends FosNode implements INode {
    asInstruction(): (input: INode) => Promise<INode>;
    addDep(): void;
    getDeps(): void;
}
export declare const getStringInstruction: (store: IStore, { value }?: {
    value?: RegExp | undefined;
}) => StringInstructionNode;
export declare const getEffectInstruction: (store: IStore, { callback, instruction }?: {
    callback?: ((node: INode) => Promise<INode>) | undefined;
    instruction?: INode | undefined;
}) => EffectInstructionNode;
declare class StringInstructionNode extends NoContextNode<{
    pattern?: RegExp;
}> implements INode {
    constructor(pattern: RegExp, store: IStore);
    generateTarget<S>(data?: S): INode;
}
declare class EffectInstructionNode extends NoContextNode<{
    callback?: (node: INode) => Promise<INode>;
}> implements INode {
    constructor(callback: (node: INode) => Promise<INode>, store: IStore);
    generateTarget<S>(data?: S): INode;
}
export {};
