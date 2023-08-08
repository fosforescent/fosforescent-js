import {
  INode,
} from "../dag-implementation/types"
import { 
  IFosInterpreter,
} from '../interpreter/types'



export type ViewTemplate<T> = ({interpreter}: {interpreter: IFosInterpreter}) => T
export type ViewGenerator<S, T> = (opts?: S) => ViewTemplate<T>

export interface IFosClient<S, T> {
  // followTaskFromAddress: (address: string) => IFosClient<T>
  // getCurrentAddress: () => string
  // getTaskRoots: () => IFosClient<T>[]
  // getTask: (name: string) => INode | undefined
  // getCurrentName: () => string
  // formatTree(formatOpts: { current?: IFosClient<T>; indent?: string }): string 
  // isDone: () => boolean
  getView: (opts?: S) => T
  // getInstructionAlias(): string 
  // composeView: (container:  (content: ViewTemplate<T>) => ViewTemplate<T>, content: ViewTemplate<T>) => ViewTemplate<T>
  // createViewTemplate: (instruction: IFosClient<T>) => ViewTemplate<T>
  // show:(opts?: S) => T
}
