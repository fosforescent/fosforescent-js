import { IFosInterpreter, IStore, INode } from "..";
export declare const createTask: (store: IStore, transaction: IFosInterpreter, description: string, deps?: INode[]) => [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]];
