import { RootFosInterpreter } from "../../interpreter";
// import { interpret } from "xstate"
import { assert } from '../../util';
/**
 * TODO: remove class & simplify
 */
export class FosClient {
    store;
    target;
    instruction;
    path = [];
    interpreter;
    constructor(store, target, instruction) {
        this.store = store;
        this.target = target;
        this.instruction = instruction;
        const instructionNode = store.getNodeByAddress(instruction);
        const targetNode = store.getNodeByAddress(target);
        this.interpreter = new RootFosInterpreter(store, instructionNode, targetNode);
        // console.log('SETTING CALLBACK', this.setInterpreter)
        assert(this.interpreter !== undefined, `Could not find interpreter for ${instruction} ${target}`);
        // this.composeView = options.composeView
    }
    getView(opts) {
        throw new Error("Method not implemented.");
        // return this.interpreter.reduceTree<S, T>(this.distributor, this.accumulator)(opts)
    }
    setRoot(interpreter) {
        this.interpreter = interpreter;
    }
    // distributor(originalDistribution: S):  ({interpreter}: {interpreter: IFosInterpreter}) => [S, S] {
    //   throw new Error("Method not implemented.")
    // }
    // accumulator (distribution: S): ({interpreter, children}: {interpreter: IFosInterpreter, children: [S, IFosInterpreter][]}) =>  T {
    //   throw new Error("Method not implemented.")
    // }
    getCurrentName() {
        return this.interpreter.getName() || '';
    }
    getCurrentAddress() {
        return this.interpreter.getTarget();
    }
    isDone() {
        return this.interpreter.isDone();
    }
}
