import { IStore } from "../types";
import { IFosInterpreter } from '../types';
/**
 * TODO: remove class & simplify
 */
export declare class FosClient<S, T> {
    store: IStore;
    target: string;
    instruction: string;
    path: IFosInterpreter[];
    interpreter: IFosInterpreter;
    constructor(store: IStore, target: string, instruction: string);
    getView(opts?: S): T;
    setRoot(interpreter: IFosInterpreter): void;
    getCurrentName(): string;
    getCurrentAddress(): string;
    isDone(): boolean;
}
