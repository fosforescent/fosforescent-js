import { IFosInterpreter } from "../types";
import { FosClient } from ".";
type StringViewOptions = {
    level?: number;
};
/**
 * TODO: remove this and replace with single, simplified function
 */
export default class StringClient extends FosClient<StringViewOptions, string> {
    getView(opts?: StringViewOptions): string;
    distributor(originalDistribution: StringViewOptions): ({ interpreter }: {
        interpreter: IFosInterpreter;
    }) => [StringViewOptions, StringViewOptions];
    accumulator(distribution: StringViewOptions): (props: {
        interpreter: IFosInterpreter;
        children: [StringViewOptions, IFosInterpreter][];
    }) => string;
    reduceTree<U, V>(distributor: (originalDistribution: U) => ({ interpreter }: {
        interpreter: IFosInterpreter;
    }) => [U, U], integrator: (distribution: U) => ({ interpreter, children }: {
        interpreter: IFosInterpreter;
        children: [U, IFosInterpreter][];
    }) => V): (distribution: U) => V;
}
export {};
