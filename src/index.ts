
import { addExamples } from "./demo/example-workflows";
import { Store } from "./dag-implementation/store";
import { INode, IStore, IFosInterpreter } from "./types";

/**
 * This is meant to provide an interface that doesn't require explicit declaration of options & parameters. 
 * When serialization is a thing, it should take care of that.  Currently it uses the "addExamples" function
 * 
 * @returns An initialized FosInterpreter with sensible defaults
 */

export type FosOptions = {
  demo?: boolean
  key?: string
}


export interface IFosInstance {
  getRootAddress(): string
  getRoot(): IFosInterpreter
  getChildren(): IFosInterpreter[]
  getAncestors(): IFosInterpreter[]
}


class FosInstance {

  store: IStore
  // currentTransaction: ITransaction
  // transactions: ITransaction[] = []

  constructor (options: FosOptions = {
    demo: true,
    // key: null
  }){

    this.store = new Store()
    
    // const initialRootInterpreter = this.store.getRoot()
    // const startTransaction = new Transaction()
    // this.transactions.push(startTransaction)

    // if (options?.demo){
    //   const interpreterWithExamples = addExamples(initialRootInterpreter)
    //   this.initialRootInterpreter  = interpreterWithExamples[interpreterWithExamples.length - 1] as IFosInterpreter
    // } else {
    //   this.initialRootInterpreter = initialRootInterpreter
    // }
  }

  getRoot(){
    return this.store.getInterpreter(null, null, null)
  }

  // addPeer(options: PeerOptions){

  //   throw new Error('not implemented')
  // }

  getPaths(){
    throw new Error('not implemented')
  }

  followPath(index: number){
    throw new Error('not implemented')
  }

  proposeUpdate(index: number, instruction: INode, target: INode){
    throw new Error('not implemented')
  }

  parse(input: string): INode{
    throw new Error('not implemented')
  }

  // startTransaction(){
  //   return this.store.getNodeByAddress(this.root)
  // }

  getChildren(){
    return this.getRoot().getChildren()
  }

  getAncestors(){
    const copiedStack = this.getRoot().getStack()
    copiedStack.reverse()
    return copiedStack
  }

  getRootAddress(){
    return this.getRoot().getTarget()
  }

}

export const Fos = (options?: FosOptions) => new FosInstance(options)

export type {
    IStore,
    INode,
    IFosInterpreter
}