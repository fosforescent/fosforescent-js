
import { addExamples } from "./demo/example-workflows";
import { Store } from "./dag-implementation/store";
import { INode, IStore, IFosInterpreter } from "./types";
import { RootFosInterpreter } from "./interpreter";

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


export interface IFosInstance<T> {
  // getRootAddress(): string
  // getRoot(): IFosInterpreter
  // getChildren(): IFosInstance[]
  // getAncestors(): IFosInterpreter[]
  // mine(): boolean
  // runMine(): void
  // createTransaction(): IFosInterpreter
  // commit(stack: IFosInterpreter[]): void
  getValue(): T
  updateValue(value: T): T
  registerAction(action: string, callback: (node: IFosInstance<T>) => Promise<IFosInstance<T>>): void
  doAction(action: string): Promise<IFosInstance<T>>

}

export interface IExtension {
  name: string
  icon: string
  // rowDisplay: 
  baseNode: INode
  validate: (node: INode) => INode

}



class FosInstance<T> implements IFosInstance<T>{

  store: IStore
  currentTransaction: number = 0
  transactions: IFosInterpreter[] = []
  extensions: IExtension[] = []

  constructor (options: FosOptions = {
    demo: true,
    // key: null
  }){

    this.store = new Store()
    
    const initialRootInterpreter = this.store.getRoot()
    this.transactions.push(initialRootInterpreter)

  }

  getRoot(){
    const currentTransaction = this.transactions[this.currentTransaction]
    if (!currentTransaction){
      throw new Error('no current root')
    }
    if (currentTransaction.committed){
      throw new Error('current root is committed')
    }
    return currentTransaction
  }

  getRootOptions(){
    return this.extensions
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

  getChildren(): IFosInstance<T>[] {
    throw new Error('not implemented')
    // return this.getRoot().getChildren()
  }

  getRootAddress(){
    return this.getRoot().getTarget()
  }

  registerRootInstruction(pattern: INode){
    this.store.create
  }

  registerExtension(extension: IExtension){
    this.extensions.push(extension)
  }
  // run(){
  //   this.getRoot().run()
  // }

  mine(): boolean {
    console.log('test')
    /**
     * 1. Get current root
     * 2. Scan expressions... for each
     * 3. Search calculations for instruction/target pair
     * 4. If found, respond with calculation/confidence
     * 5. If not found, attempt to calculate
     * 6. If interpreter cannot simplify, it will reject promise, go to next expression
     * 7. If interpreter can simplify, it will return new INode 
    */

    return false
  }

  import(data: any) {

  }

  export() {

  }

  createTransaction(): IFosInterpreter {
    const currentTransaction = this.getRoot()
    const currentInstruction = this.store.getNodeByAddress(currentTransaction.getInstruction())
    const currentTarget = this.store.getNodeByAddress(currentTransaction.getTarget())
    const newTransaction = new RootFosInterpreter(this.store, currentInstruction, currentTarget)
    this.transactions.push(newTransaction)
    return newTransaction
  }
  
  commit(stack: IFosInterpreter[]): void {
    throw new Error("Method not implemented.");
  }

  getValue(): any {
    throw new Error("Method not implemented.");
  }

  updateValue(value: any): any {
    throw new Error("Method not implemented.");
  }

  registerAction(action: string, callback: (node: IFosInstance<T>) => Promise<IFosInstance<T>>): void {
    throw new Error("Method not implemented.");
  }

  doAction(action: string): Promise<IFosInstance<T>> {
    throw new Error("Method not implemented.");
  }

}

export const Fos = (options?: FosOptions) => {
  const fos = new FosInstance(options)
  
  return fos
}

export type {
    IStore,
    INode,
    IFosInterpreter
}