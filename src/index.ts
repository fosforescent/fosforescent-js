
import { addExamples } from "./demo/example-workflows";
import { Store } from "./dag-implementation/store";
import { INode, IStore } from "./dag-implementation/types";
import { IFosInterpreter } from "./interpreter/types";

/**
 * This is meant to provide an interface that doesn't require explicit declaration of options & parameters. 
 * When serialization is a thing, it should take care of that.  Currently it uses the "addExamples" function
 * 
 * @returns An initialized FosInterpreter with sensible defaults
 */

export type FosOptions = {
  demo?: boolean,
  store?: Store
  root?: string
}



export const Fos = (options: FosOptions = {
  demo: true,
}) => {

  const store = options?.store || new Store()
  const initialRootInterpreter = store.getRoot()
  if (options?.demo){
    const interpreterWithExamples = addExamples(initialRootInterpreter)
    return {
      getRoot: () => {
        return store.getRoot()
      },
      initialRootInterpreter: interpreterWithExamples[interpreterWithExamples.length - 1] as IFosInterpreter
    }
  } else {
    return {
      getRoot: () => {
        return store.getRoot()
      },
      initialRootInterpreter: initialRootInterpreter
    }
  }
}


export type {
    IStore,
    INode,
    IFosInterpreter
}