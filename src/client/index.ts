import { INode, IStore } from "../types"
import { IFosInterpreter } from '../types'
// import { interpret } from "xstate"
import { assert } from '../util'





export class FosClient<S, T>  {

  path: IFosInterpreter[] = []
  interpreter: IFosInterpreter
  
  constructor(public store: IStore, public target: string, public instruction: string) {
    this.interpreter = store.getInterpreter(target, instruction, null)
    // console.log('SETTING CALLBACK', this.setInterpreter)
    assert(this.interpreter !== undefined, `Could not find interpreter for ${instruction} ${target}`)
    // this.composeView = options.composeView
    
  }

  getView(opts?: S): T {
    throw new Error("Method not implemented.")
    // return this.interpreter.reduceTree<S, T>(this.distributor, this.accumulator)(opts)
  }

  setRoot(interpreter: IFosInterpreter): void {
    this.interpreter = interpreter
  }


  // distributor(originalDistribution: S):  ({interpreter}: {interpreter: IFosInterpreter}) => [S, S] {
  //   throw new Error("Method not implemented.")
  // }

  // accumulator (distribution: S): ({interpreter, children}: {interpreter: IFosInterpreter, children: [S, IFosInterpreter][]}) =>  T {
  //   throw new Error("Method not implemented.")
  // }



  getCurrentName (): string {
    return this.interpreter.getName() || ''
  }

  getCurrentAddress (): string {
    return this.interpreter.getTarget()
  }

  

  isDone(): boolean {
    return this.interpreter.isDone()
  }


}