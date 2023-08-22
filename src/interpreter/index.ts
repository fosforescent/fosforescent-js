import { FosNode, NoContextNode } from "../dag-implementation/node";
import { Store, NodeType } from "../dag-implementation/store";
import { INode, NodeStatus, NodeStateSchema, NodeEvents, IFosInterpreter, IStore } from '../types'
import { assert } from '../util'
import { createTaskStateMachine, createOneOfStateMachine } from "./state-machines"
// import { Interpreter, interpret } from "xstate"
import StringClient from "../client/string-client";



export class FosInterpreter implements IFosInterpreter {

  // oneOfActor: Interpreter<NodeStatus, NodeStateSchema, NodeEvents>
  // taskActor: Interpreter<NodeStatus, NodeStateSchema, NodeEvents>


  constructor(public target: INode, public instruction: INode, public store: Store, public parent: IFosInterpreter | null) {
    // TODO: figure out why this line causes infinite recursion & clean up --- console.log('FosInterpreter', target.getAddress(), instruction.getAddress(), this.getDisplayString())
    if (Array.isArray(target)) {
      console.log('target is array', target)
      throw new Error('target is array')
    }
  }

  getInstruction(): string  {
    return this.instruction ? this.instruction.getAddress() : this.store.voidAddress;
  }

  getTarget(): string {
    return this.target ? this.target.getAddress() : this.store.voidAddress;
  }


  isDone(): boolean {
    throw new Error("Method not implemented.")
  }

  getTargetEdges(): [string, string][] {
    return this.target.getEdges()
  }


  // async run(input: INode): Promise<IFosInterpreter> {
  //   const func = this.instruction.asInstruction()
  //   const [newInstruction, newTarget] = await func(this.target)
  //   if (this.isDone()) {
  //     const newInt = this.mutate(newInstruction, newTarget)[0]
  //     return newInt
  //   } else {
  //     return this
  //   }
  // }
  

  mutate(newInstruction: INode, newTarget: INode): [IFosInterpreter, ...IFosInterpreter[]] {
    // console.log('mutate', newInstruction.getAddress(), newTarget.getAddress(), this.getDisplayString())
    if (this.parent) {
      // console.log('this parent', typeof this.parent, this.parent)
      const newParentEdges = this.store.getNodeByAddress(this.parent.getTarget()).getEdges().map((elem) => elem[0] === this.instruction.getAddress() && elem[1] === this.target.getAddress() ? [newInstruction.getAddress(), newTarget.getAddress()] : elem)
      const newParentTarget = this.store.create(newParentEdges)
      const newParent = this.parent.mutate(this.store.getNodeByAddress(this.parent.getInstruction() as string), newParentTarget)[0]

      const newInterpreter = this.store.getInterpreter(newTarget.getAddress(), newInstruction.getAddress(), newParent as IFosInterpreter)

      const stack = newInterpreter.getStack() as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
      const [thisInterpreter, parentInterpreter, ...rest] = stack
        const matchingChild = parentInterpreter.getChildren().filter((elem) => elem.getInstruction() === thisInterpreter.getInstruction() && elem.getTarget() === thisInterpreter.getTarget())
        assert(matchingChild.length === 1, `matchingChild.length === 1 (mutate failing)`)
      return stack
 
    } else {
      const newInterpreter = this.store.getInterpreter(newTarget.getAddress(), newInstruction.getAddress(), null)
      return [newInterpreter]
    }
 }

  spawn(childInstruction: INode, childTarget: INode): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]] {

    const newTarget = this.target.addEdge(childInstruction.getAddress(), childTarget.getAddress())
    
    const parentStack = this.mutate(this.instruction, newTarget)

    const newInterpreter = this.store.getInterpreter(childTarget.getAddress(), childInstruction.getAddress(), parentStack[0] || null)

    // console.log('spawn1', parentStack.map((elem) => elem.getDisplayString()), newInterpreter.getDisplayString(), childInstruction.getAddress(), childTarget.getAddress(), this.getDisplayString())

    const newStack = newInterpreter.getStack() as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]

    const [thisInterpreter, parentInterpreter, ...rest] = newStack
    
    // console.log('spawn2', newStack.map((elem) => elem.getDisplayString()), newInterpreter.getDisplayString(), parentStack.map((elem) => elem.getDisplayString()), this.getDisplayString())

    if (newStack.length > 0) {
      const matchingChild = parentInterpreter.getChildren().filter((elem) => elem.getInstruction() === thisInterpreter.getInstruction() && elem.getTarget() === thisInterpreter.getTarget())
      assert(matchingChild.length === 1, `matchingChild.length === 1 (spawn failing)`)
    }
    return newStack
  }

  getStack(): [IFosInterpreter, ...IFosInterpreter[]] {
    const stack = (this.parent ? [this, ...this.parent.getStack()] : [this]) as [IFosInterpreter, ...IFosInterpreter[]]
    // console.log('got stack', stack.map((elem) => elem.getDisplayString()))
    if (stack.length > 1) {
      const [thisInterpreter, parentInterpreter, ...rest] = stack as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
      const matchingChild = parentInterpreter.getChildren().filter((elem) => elem.getInstruction() === thisInterpreter.getInstruction() && elem.getTarget() === thisInterpreter.getTarget())
      // console.log('matchingChildren', stack[stack.length - 1].getChildren().map(x => x.getDisplayString()))
      assert(matchingChild.length === 1, `matchingChild.length === 1 (get stack failing)`)
    }
    return stack
  }

  

  getChildren(): IFosInterpreter[] {
    // console.log('this target', Array.isArray(this.target), typeof this.target, this.target)
    const isExternal = this.store.checkAddress(this.target.getAddress()) === NodeType.External
    if (isExternal) {
      return []
    }
    // assert(!isExternal, `isExternal`)
    const edges = this.target.getEdges();
    const childInterpreters = edges.map(([instruction, child]) => {
      const newInterpreter = this.store.getInterpreter(child, instruction, this)
      return newInterpreter
    })
    return childInterpreters
  }

  getName(): string {
    // console.log('getNameForTarget', this.target.getAddress(), this.instruction.getAddress(), this.target, this.instruction)
    const targetNameEdges = this.getChildren().filter((elem) => elem.getInstruction() === this.store.nameAddress)
    assert(targetNameEdges.length === 1, `nameNodes.length === 1`)
    const targetNameEdge = targetNameEdges[0] as IFosInterpreter
    return this.store.getNodeByAddress(targetNameEdge.getTarget()).getValue() as string || ''
  }


  createTask(description: string, deps: INode[] = [] ): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]] {

    const [newTask, newThis, ...newRest] = this.spawn(this.store.getNodeByAddress(this.store.allOfAddress), this.store.getNodeByAddress(this.store.voidAddress)) as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
    const [_newTaskName, newTaskWithName, ..._newRestWithName] = newTask.setName(description)
    
    // console.log ('newTaskWithName', newTaskWithName.getDisplayString())
    const [_finalSubtask, taskWithSubtasks, ..._finalRestWithSubtasks] = deps.reduce((acc, item) => {
      const [prevSubtask, prevTaskWithSubtasks, ...prevRestWithSubtasks] = acc as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
      const [nextSubtask, nextTaskWithSubtask, ...nextRestWithSubtask] = prevTaskWithSubtasks.spawn(this.store.getNodeByAddress(this.store.allOfAddress), item)
      // console.log('prevTaskWithSubtasks', prevTaskWithSubtasks.getDisplayString(), nextTaskWithSubtask.getDisplayString()) 
      return [nextSubtask, nextTaskWithSubtask, ...nextRestWithSubtask]

    }, [_newTaskName, newTaskWithName, ..._newRestWithName]) as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]

    // console.log('taskWithSubtasks', taskWithSubtasks.getDisplayString(), taskWithSubtasks.getStack().map((elem) => elem.getDisplayString()))


    return taskWithSubtasks.getStack() as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]

  }

  // createWorkflow(params: {
  //   root: INode,
  //   name: string, 
    
  // }: {}): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]] {
  //   const [newTask, newThis, ...newRest] = this.spawn(this.store.getNodeByAddress(this.store.allOfAddress), this.store.getNodeByAddress(this.store.voidAddress)) as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
  //   const [_newTaskName, newTaskWithName, ..._newRestWithName] = newTask.setName(description)
    
  //   // console.log ('newTaskWithName', newTaskWithName.getDisplayString())
  //   const [_finalSubtask, taskWithSubtasks, ..._finalRestWithSubtasks] = deps.reduce((acc, item) => {
  //     const [prevSubtask, prevTaskWithSubtasks, ...prevRestWithSubtasks] = acc as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
  //     const [nextSubtask, nextTaskWithSubtask, ...nextRestWithSubtask] = prevTaskWithSubtasks.spawn(this.store.getNodeByAddress(this.store.allOfAddress), item)
  //     // console.log('prevTaskWithSubtasks', prevTaskWithSubtasks.getDisplayString(), nextTaskWithSubtask.getDisplayString()) 
  //     return [nextSubtask, nextTaskWithSubtask, ...nextRestWithSubtask]

  //   }, [_newTaskName, newTaskWithName, ..._newRestWithName]) as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]

  //   console.log('taskWithSubtasks', taskWithSubtasks.getDisplayString(), taskWithSubtasks.getStack().map((elem) => elem.getDisplayString()))


  //   return taskWithSubtasks.getStack() as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]



  // }
  

  setName(name: string): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]] {
    const hasCurrentName = this.target.getEdges().find((elem) => elem[0] === this.store.nameAddress)
    if (hasCurrentName){
      if(this.getName() !== name){
        const nameNode = this.store.create(name)
        const newEdges = this.target.getEdges().map((edge) => edge[0] === this.store.nameAddress ? [edge[0], nameNode.getAddress()] : edge)
        const newTarget = this.store.create(newEdges)
        const [thisInterpreter, ...rest] = this.mutate(this.instruction, newTarget) as [IFosInterpreter, ...IFosInterpreter[]]
        const nameChildren = thisInterpreter.getChildren().filter((elem) => elem.getInstruction() === this.store.nameAddress)
        assert(nameChildren.length === 1, `nameChild`)
        const nameChild = nameChildren[0] as IFosInterpreter
        return nameChild.getStack() as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
      }else{
        const nameChildren = this.getChildren().filter((elem) => elem.getInstruction() === this.store.nameAddress)
        assert(nameChildren.length === 1, `nameChild`)
        const nameChild = nameChildren[0] as IFosInterpreter
        return nameChild.getStack() as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
      }
    } else {
      const nameNode = this.store.create(name)
      const newStack = this.spawn(this.store.getNodeByAddress(this.store.nameAddress), nameNode)
      return newStack
    }
  }

  isName(): boolean {
    return this.instruction.getAddress() === this.store.nameAddress
  }

  isTask(): boolean {
    return this.instruction.getAddress() === this.store.allOfAddress
  }

  getTasks(): IFosInterpreter[] {
    
    const taskInterpreters = this.getChildren().filter((elem) => elem.getInstruction() === this.store.allOfAddress)
    // console.log('taskEdges', taskInterpreters.map(x => x.getDisplayString()))
    return taskInterpreters
  }

  getTask(name: string): IFosInterpreter  {
    const foundTasks = this.getTasks().filter((elem) => elem.getName() === name)
    assert(foundTasks.length !== 0, `task "${name}" not found`)
    assert(foundTasks.length > 1, `multiple tasks named "${name}" not found`)
    return foundTasks[0] as IFosInterpreter
  }

  getDisplayString(): string {
    const helper = (node: INode) => {
      let name;
      try{
        name = this.store.getInterpreter(node.getAddress(), null, this).getName()
      }catch{
        name = '<no name>'
        for (const [aliasName, address] of this.store.aliasData.entries()) {
          if (address === node.getAddress()) {
            name = `<alias: ${aliasName}>`
          }
        }
      }  
      return `${name}(${node.getAddress().slice(-10)})`
    }
    return `[${helper(this.instruction)}]${helper(this.target)}`
  }

  getAliases(): [string | null, string | null] {
    const aliases: [string| null, string | null] = [null, null]

    for (const [aliasName, address] of this.store.aliasData.entries()) {
      if (address === this.target.getAddress()) {
        aliases[1] = aliasName
      }
      if (address === this.instruction.getAddress()) {
        aliases[0] = aliasName
      }
    }
    return aliases
  }

  getEdgeFromStubString(stubString: string): [string, string] {
    console.log('stubString', stubString, this.getDisplayString(), this.getChildren().map((elem) => elem.getDisplayString()))
    const re = /\(([\w]{10})\)([\w]{10})/
    const [whole, instructionStub, targetStub] = re.exec(stubString) || []
    console.log('getNodeFromUrlString', stubString, instructionStub, targetStub, whole)
    const edge = this.target.getEdges().filter((elem) => elem[0].slice(-10) === instructionStub && elem[1].slice(-10) === targetStub)
    console.log('edge', edge)
    assert(edge.length === 1, `not single edge node but [${edge.length}] found for ${stubString}`)
    return edge[0] as [string, string]
  }

  followEdgeFromStubString(stubString: string): IFosInterpreter {
    const [instructionStub, targetStub] = this.getEdgeFromStubString(stubString)
    const newInterpreter = this.store.getInterpreter(targetStub, instructionStub, this)
    
    return newInterpreter
  }
  
  getStubString(): string {
    const instructionStub = `(${this.instruction.getAddress().slice(-10)})`
    const targetStub = `${this.target.getAddress().slice(-10)}`
    // console.log('getStubString', instructionStub, targetStub, instructionStub.length, targetStub.length)
    assert(instructionStub.length === 12, `instructionStub.length === 12`)
    assert(targetStub.length === 10, `targetStub.length === 10`)
    return `${instructionStub}${targetStub}`
  }

  findEdgesWithTarget(target: INode): [string, string][] {
    return this.target.getEdges().filter((elem) => elem[1] === target.getAddress())
  }

  formatTree(formatOpts: { current?: IFosInterpreter; indent?: string }): string {
    // return this.target.formatTree({...formatOpts, current: [this.instruction.getAddress(), this.target.getAddress()]})
    return (new StringClient(this.store, this.target.getAddress() ,this.instruction.getAddress())).getView({level: 0})
  }

  getNodeByName(name: string): INode | undefined {
    const unitNode = this.store.getNodeByAddress(this.store.unitAddress)
    const nameEdgeNode = this.store.getNodeByAddress(this.store.nameAddress)
    const instructionNameNode = this.store.create(name)
    console.log('name', name)
    const instructionNodeQueryResults = this.store.queryTriple(unitNode, nameEdgeNode, instructionNameNode)
    const instructionNode = instructionNodeQueryResults[0]?.[0]
    return instructionNode
  }

  getValue<T>(): T{
    const isExternal = this.store.checkAddress(this.target.getAddress()) === NodeType.External
    assert(isExternal, `isExternal`)
    const value = this.store.getNodeByAddress(this.target.getAddress()).getValue()
    return value as T
  }

  reorderTargetEdges(newEdges: (string | null)[]): IFosInterpreter[] {
    const newTaskEdgesParsed = newEdges.map((elem) => elem ? this.getEdgeFromStubString(elem) : null).filter((elem) => elem !== null) as [string, string][]
    console.log("reorderTargetEdges", newEdges, newEdges.filter(x => x !== null).map((elem) => this.followEdgeFromStubString(elem as string).getDisplayString()), [...newTaskEdgesParsed], newTaskEdgesParsed)
    // let newEdgeCounter = 0
    // const newEdgesInPlace = this.target.getEdges().map((elem, index) => {
    //   if(newTaskEdgesParsed.find((newElem) => newElem[0] === elem[0] && newElem[1] === elem[1])){
    //     console.log('here', newTaskEdgesParsed[newEdgeCounter], newEdgeCounter)
    //     return newTaskEdgesParsed[newEdgeCounter++]
    //   }else{
    //     console.log('here2')
    //     return elem
    //   }
    // })
    console.log('new in place', newTaskEdgesParsed)
    const newTarget = this.store.create([...newTaskEdgesParsed] as [string, string][])
    console.log('new target', newTarget.getValue(), newTarget.getAddress())
    const newStack = this.mutate(this.instruction, newTarget)
    console.log('newStack', newStack.length, newStack.map((elem) => elem.getDisplayString()))
    return newStack as IFosInterpreter[]
  }

  setValue<T>(value: T): [IFosInterpreter, ...IFosInterpreter[]] {
    const isExternal = this.store.checkAddress(this.target.getAddress()) === NodeType.External
    assert(isExternal, `isExternal`)
    const newTarget = this.store.create(value)
    const newStack = this.mutate(this.instruction, newTarget)
    return newStack
  }

  getAvailableInstructions(): INode[] {
    const unitNode = this.store.getNodeByAddress(this.store.unitAddress)
    const nameEdgeNode = this.store.getNodeByAddress(this.store.nameAddress)
    const allOfNode = this.store.getNodeByAddress(this.store.allOfAddress)
    return [allOfNode, nameEdgeNode, unitNode]
  }

  getBlank(instruction: INode): IFosInterpreter[] {
    return this.spawn(instruction, this.store.getNodeByAddress(this.store.voidAddress)) 
  }

  removeEdge(instruction: string, target: string): IFosInterpreter[] {
    const newTarget = this.target.removeEdge(instruction, target)
    const newStack = this.mutate(this.instruction, newTarget)
    return newStack
  }

}