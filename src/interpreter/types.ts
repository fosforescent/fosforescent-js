import { INode, IStore } from "../dag-implementation/types";




export interface IFosInterpreter  {

    isDone(): boolean
    // isRejected(): boolean
    // isLeaf(): boolean
    // complete(): void
    // uncomplete(): void
  
    // addNewAllOfWithDescription(description: string): [INode, INode]
    // addNewOneOfWithDescription(description: string): [INode, INode]
    store: IStore
    parent: IFosInterpreter | null 

    createTask(description: string, deps?: INode[]): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
    getTasks(): IFosInterpreter[]
    getTask(name: string): IFosInterpreter | undefined
    getName(): string
    setName(name: string): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
  
    getInstruction(): string
    // followTaskFromAddress(address: string): IFosInterpreter
    // getTarget(): INode | null
    getDisplayString(): string
  
    formatTree(formatOpts: { current?: IFosInterpreter; indent?: string }): string  
    getTarget(): string
    getAliases(): [string | null, string | null]
    getStubString(): string
    // getTargetEdges(): [string, string][]
    // listenChildren(cb: (newInstruction: string, newTarget: string) => IFosInterpreter[]): IFosInterpreter[]
    getChildren(): IFosInterpreter[]
    getNodeByName(name: string): INode | undefined
    followEdgeFromStubString(stubString: string, latest?: boolean): IFosInterpreter 
    // processChildChange(oldChildInterpreter: IFosInterpreter, newChildInterpreter: IFosInterpreter): IFosInterpreter[] 
    // parentCallback: (oldInterpreter: IFosInterpreter, newInterpreter: IFosInterpreter) => IFosInterpreter[]
    spawn: (instruction: INode, target: INode) => [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
    mutate: (instruction: INode, target: INode) => [IFosInterpreter, ...IFosInterpreter[]]
    getStack(): IFosInterpreter[],
    isName(): boolean
    isTask(): boolean
    getValue(): string
    reorderTargetEdges(newEdges: (string | null)[]): IFosInterpreter[]
    setValue(value: string): [IFosInterpreter, ...IFosInterpreter[]]
    getAvailableInstructions(): INode[]
    getBlank(instruction: INode): IFosInterpreter[]
  }
  
  