// import { Interpreter, StateMachine, StateValue } from 'xstate'
import { Cost, CostAllocation, NodeData } from './node-data'
import { IFosInterpreter } from '../interpreter/types'

export enum NodeStatus {
  NotStarted = 'NotStarted',
  Rejected = 'Rejected',
  Done = 'Done',
}

export interface NodeStateSchema {
  states: {
    [NodeStatus.NotStarted]: object
    [NodeStatus.Done]: object
    [NodeStatus.Rejected]: object
  }
}

interface CompleteNode {
  type: 'CompleteNode'
  node: string
}

interface UncompleteNode {
  type: 'UncompleteNode'
  node: string
}

interface RejectNode {
  type: 'RejectNode'
  node: string
}

interface UnrejectNode {
  type: 'UnrejectNode'
  node: string
}

export interface ChildWasCompletedEvent {
  type: 'ChildWasCompleted'
  child: string
}

export interface ChildWasUncompletedEvent {
  type: 'ChildWasUncompleted'
  child: string
}


export type NodeEvents =
  | CompleteNode
  | UncompleteNode
  | RejectNode
  | UnrejectNode
  | ChildWasCompletedEvent
  | ChildWasUncompletedEvent

type IsChildType<T extends NodeEvents> = T extends { child: INode } ? T : never
type ChildEvents = IsChildType<NodeEvents>
// type ThisNodeEvents = Exclude<NodeEvents, ChildEvents>

export type ChildEventTypes = ChildEvents['type']

export interface INode {

  primitiveTag: string | undefined

  getValue(): unknown

  getAddress(): string

  getEdge(edgeType: string, child: string): [string, string] | undefined
  getEdges(): [string, string][]
  addEdge(edgeType: string, target: string): INode
  removeEdge(edgeType: string, target: string): INode
  updateEdge(oldEdgeType: string, oldTarget: string, newEdgeType: string, newTarget: string): INode

  delete(): void

  toString(): string
  toJSON(): string // must not include store
}

export interface IStore {
  rootsHistory: string[]
  getInterpreter( target: string | null, instruction: string | null, parent: IFosInterpreter | null): IFosInterpreter 
  create<T>(value: T, opts?: {name?: string}): INode
  query(query: INode): INode[]
  queryTriple(subject: INode, predicate: INode, object: INode): [INode, INode, INode][] 
  insertExternal(node: INode): string
  insert(node: [string, string][]): string
  remove(node: INode): void
  matchPattern(pattern: INode, target: INode, throwError: boolean): INode[]
  getNodeByAddress(address: string): INode
  listenRoot(cb: (oldInterpreter: IFosInterpreter, newInterpreter: IFosInterpreter) => void): void
  setRoot(root: IFosInterpreter): void
  toJSON(): (string | number)[]
  // getRootInterpreterByName(name: string): IFosInterpreter
  // getRootInterpreters(): IFosInterpreter[]
}