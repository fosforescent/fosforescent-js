import { Duration, NodeData, Probability, Cost, CostAllocation } from './node-data'
import { INode, NodeStatus, IStore } from '../types'
import { assert } from '../util'



export class NoContextNode<T> implements INode {

  address: string = ''

  constructor (public value: T, public store: IStore, internal = false) {
    if (!internal){
      this.address = this.store.insertExternal(this)
    }
  }

  toJSON(): string {
    return JSON.stringify(this.value)
  }

  toString(): string {
    return this.value ? this.value.toString() : this.value === null ? 'null' : 'undefined'
  }

  getAddress(): string {
    return this.address
  }


  getValue(): T {
    return this.value
  }

  getEdge(edgeType: string, child: string): [string, string] | undefined {
    return undefined
  }

  getEdges(): [string, string][] {
    return []
  }

  addEdge(edgeType: string, target: string): INode {
    throw new Error('Cannot add edge to a NoContextNode')
  }

  removeEdge(edgeType: string, target: string): INode {
    throw new Error('Cannot remove edge from a NoContextNode')
  }

  updateEdge(oldEdgeType: string, oldTarget: string, newEdgeType: string, newTarget: string): INode {
    throw new Error('Cannot update edge from a NoContextNode')
  }

  delete(): void {
    this.store.remove(this)
  }

  asInstruction(): (input: INode) => Promise<INode> {
    const value = this.getValue()
    if (typeof value === 'function') {
      return value as (input: INode) => Promise<INode>
    } else {
      throw new Error('provided node is not a function')
    }
  }

  generateTarget<S>(data: S): INode {
    console.log('here', data)
    throw new Error('Method not implemented.')
  }

  merge(other: INode): INode {
    if (typeof other.getValue() !== typeof this.getValue()) {
      throw new Error('Cannot merge nodes of different types')
    }else{
      return other
    }
  }


}


export class FosNode extends NoContextNode<[string, string][]> implements INode {

  constructor(value: [string, string][], store: IStore) {
    value.forEach((elem) => {
      assert(elem[0] !== undefined, 'elem[0] !== undefined')
      assert(elem[1] !== undefined, 'elem[1] !== undefined')
    })
    const address = store.insert(value)
    super(value, store, true)
    this.address = address
  }


 
  getEdges(): [string, string][] {
    /**
     * make sure we never accidentally mutate the value
     */
    return this.value.map(elem => [...elem])
  }
 

  printTree(): void {
    throw new Error("Method not implemented.")
  }



  toString(): string {
    return JSON.stringify(this.value)
  }


  get status() {
    return NodeStatus.Done
  }

 
  isDone(): boolean {
    throw new Error("Method not implemented.")
  }

  isRejected(): boolean {
    return this.status === NodeStatus.Rejected
  }

  isLeaf(): boolean {
    return this.value.length == 0
  }

  addEdge(edgeType: string, target: string): INode {
    return new FosNode([...this.getEdges(), [edgeType, target]], this.store)
  }

  removeEdge(edgeType: string, target: string): INode {
    return new FosNode(this.getEdges().filter(item => item[0] == edgeType && item[1] === target), this.store)
  }

  updateEdge(oldEdgeType: string, oldTarget: string, newEdgeType: string, newTarget: string): INode {
    return new FosNode(this.getEdges().map(item => item[0] === oldEdgeType && item[1] === oldTarget ? [newEdgeType, newTarget] : item), this.store)
  }

  delete(): void {
    this.store.remove(this)
  }

  asInstruction(): (input: INode) => Promise<INode> {
    return async (input: INode) => {
      const edges = this.getEdges()
      const results = await Promise.all(edges.map(async ([edgeType, target]) => {
        const targetNode = this.store.getNodeByAddress(target)
        const result = await targetNode.asInstruction()(input)
        return [edgeType, result.getAddress()]
      })).catch((error) => {
        console.log('error', error) 
        return this
      }) as [string, string][]
      return new FosNode(results, this.store)  
    }
  }


  merge(other: INode): INode {
    // TODO: make this actually merge stuff
    console.log('merge', this.getAddress(), other.getAddress())
    const newNode = other.getEdges().reduce((acc: INode, [edgeType, target]: [string, string]) => {
      return acc.addEdge(edgeType, target)
    }, this)
    return newNode
  }

  generateTarget<S>(data?: S): INode {
    console.log('here', data)
    return this.store.create(data || [])
  }

}

