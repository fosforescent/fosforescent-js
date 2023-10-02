import { assert, aggMap } from '../util'
import { INode, IStore, IFosInterpreter } from '../types'
import { FosNode, NoContextNode } from './node'
import { FosInterpreter, RootFosInterpreter } from "../interpreter"
import { SHA256 } from 'crypto-js'

import { getAllOfNode, getNameNode, getTerminalNode, getUnitNode } from './node-factory'


export enum NodeType {
  None = 0,
  Internal = 1,
  External = 2
}

export class Store implements IStore {
  table: Map<string, [string, string][]> = new Map()
  computations: Map<string, Map<string, string[]>> = new Map()

  voidAddress: string = ''
  unitAddress: string = ''
  nameAddress: string = ''
  previousVersionAddress: string = ''
  allOfAddress: string = ''

  rootsHistory: string[] = [];
  listeners: ((oldInterpreter: IFosInterpreter, newInterpreter: IFosInterpreter) => void)[] = []

  externalData: Map<string, INode> = new Map()
  hashFunc: (item: INode) => string

  cache = new Map<string, INode>()

  version = 0

  constructor({ json, publicKey } : { json?: string, publicKey?: string } = {}) {
    if (json) {
      this.hashFunc = <T>(item: INode) => this.hashString(JSON.stringify((item.getValue() as T as any).toString()))
      this.fromJSON(json)
      console.log('gettingInt', this.externalData)
    } else {
      this.table = new Map()
      this.externalData = new Map()
      this.hashFunc = <T>(item: INode) => this.hashString(JSON.stringify((item.getValue() as T as any).toString()))
      this.init()
    }
    // console.log('roots history init', this.rootsHistory)
  }

  init (): void {
    const voidNode = getTerminalNode(this)
    this.voidAddress = voidNode.getAddress()
    // console.log("initializing store")
    this.cache.set(this.voidAddress, voidNode)
    this.unitAddress = getUnitNode(this).getAddress()
    this.nameAddress = getNameNode(this).getAddress()
    this.allOfAddress = getAllOfNode(this).getAddress()
    this.previousVersionAddress = this.insert([[this.voidAddress, this.nameAddress]])
    const workflowNameNode = this.create('workflow')
    const workflowAddress = this.insert([[this.unitAddress, this.allOfAddress], [this.nameAddress, workflowNameNode.getAddress()]])

  }

  setRoot (root: IFosInterpreter): void {
    console.log('rootsHistory - s', this.rootsHistory)
    // console.trace()
    const newAddress = root.getTarget()
    if (this.rootsHistory[0] === newAddress) {
      return
      // throw new Error('root already set to this address')
    }
    this.rootsHistory.unshift(root.getTarget())
    console.log('rootsHistory - e', this.rootsHistory)
  }

  listenRoot (callback: (oldInterpreter: IFosInterpreter, newInterpreter: IFosInterpreter) => void): void {
    console.log('listenRoot', this.listeners.length)
    !this.listeners?.includes(callback) && this.listeners.push(callback)
    console.log('listenRoot2', this.listeners.length, callback)
  }

  updateRoot (oldInterpreter: IFosInterpreter, newInterpreter: IFosInterpreter){
    console.log('NEW ROOT! (from store)', 'new', newInterpreter.getDisplayString(), newInterpreter.getChildren().map(x => x.getDisplayString()), 'old',oldInterpreter.getDisplayString(),oldInterpreter.getChildren().map((x: IFosInterpreter) => x.getDisplayString()), oldInterpreter, newInterpreter)
    // console.trace()
    this.rootsHistory.unshift(newInterpreter.getTarget())
    this.listeners?.forEach((listener) => {
      console.log('hwre')
      listener(oldInterpreter, newInterpreter)
    }) 
    return [] as IFosInterpreter[]
  } 


  // getRootInterpreterByName(startInstructionName: string) {
  //   console.log('intname', startInstructionName)
  //   const nameNode = this.create(startInstructionName)
  //   const queryNode = this.create([[this.nameAddress, nameNode.getAddress()]])
  //   const startInstructionNodeCandidates = this.query(queryNode)
  //   console.log('startInstructionNodeCandidates', startInstructionNodeCandidates)
  //   assert(startInstructionNodeCandidates.length > 0, 'Did not find any candidates for start instruction')
  //   assert(startInstructionNodeCandidates.length === 1, 'Found more than 1 candidate for start instruction')
  //   return this.getRoot(startInstructionNodeCandidates[0] as INode)
  // }

  getRootFromStubString(stubString: string): IFosInterpreter {
    const re = /\(([\w]{10})\)([\w]{10})/
    const [whole, instructionStub, targetStub] = re.exec(stubString) || []
    const instructionAddress = [...this.table.keys()].filter(key => key.slice(-10) == instructionStub)[0]
    const rootAddress = [...this.table.keys()].filter(key => key.slice(-10) == targetStub)[0]
    if (rootAddress !== this.rootsHistory[0]){
      throw new Error('root address does not match')
    }
    if (!instructionAddress){
      throw new Error('instruction address does not exist')
    }
    const instructionNode = this.getNodeByAddress(instructionAddress)
    return this.getRoot(instructionNode)
  }

  getRoot(node?: INode): RootFosInterpreter {
    // console.log('rootsHistory', this.rootsHistory)
    const root = this.rootsHistory[0]
    if (root === undefined) {
      const newRoot = this.create([[this.nameAddress, this.create('root').getAddress()]]).getAddress()
      const rootInterpreter = new RootFosInterpreter(this, this.getNodeByAddress(newRoot), this.getNodeByAddress(this.voidAddress))
      return rootInterpreter
    }
    // console.log('gettingInt', this.externalData)
    return new RootFosInterpreter(this, node || this.getNodeByAddress(this.voidAddress), this.getNodeByAddress(this.voidAddress))
  }

  // getRootInterpreters(): IFosInterpreter[] {
  //   console.log('rootsHistory', this.rootsHistory)
  //   const root = this.rootsHistory[0]
  //   if (root === undefined) {
  //     throw new Error('no root found')
  //   }
  //   const rootNode = this.getNodeByAddress(root)
  //   const interpreters = rootNode.getEdges().map(([instruction, target]) => this.getInterpreter(target, instruction, null))
  //   return interpreters
  // }


  hashString (stringToHash: string): string {
    // console.log('hashString', stringToHash)
    const hash = SHA256(stringToHash)
    const hashedString = hash.toString()
    // console.log('string to hash', stringToHash, hashedString)
    // console.trace()
    return hashedString
  }

  hash (edges: [string, string][]): string {
    // edges.sort()
    return this.hashString(JSON.stringify([...edges]))
  }

  checkAddress (address: string, externalAllowed = true): NodeType {
    // console.log('checkAddress', address, [...this.table.keys()], [...this.externalData.keys()], this.table.get(address) !== undefined, this.externalData.get(address) !== undefined)
    const isNode = this.table.get(address) !== undefined
    const isExternal = externalAllowed && this.externalData.get(address) !== undefined
    return isNode ? NodeType.Internal : isExternal ? NodeType.External : NodeType.None
  }


  create<T>(value: T): INode {
    if (Array.isArray(value)){
      // console.log('create array starting', value)
      value.forEach((item, index) => {
        if (Array.isArray(item) && item.length === 2 && typeof item[0] === 'string' && typeof item[1] === 'string') {
          if (this.checkAddress(item[0]) === NodeType.None){
            throw new Error(`node ${item[0]} not found at index ${index}.  Probably inserting an edge that doesn't exist`)
          }
          if (this.checkAddress(item[1]) === NodeType.None){
            throw new Error(`node ${item[1]} not found at index ${index}.  Probably inserting a node with an edge to a node that doesn't exist`)
          }
        } else {
          throw new Error(`inserting array that has malformed edges`)
        }
      })
      return new FosNode(value, this)
    }
    return new NoContextNode(value, this)
  }

  insert (edges: [string, string][]): string {
    // console.log('insert regular starting', edges)
    edges.forEach((edge, index) => {      
      // console.log('edge', edge)
      // console.log("existing addresses", [...this.externalData.keys()], [...this.table.keys()])
      assert(this.checkAddress(edge[0]) !== NodeType.None, `node ${edge[0]} not found at index ${index}`)
      assert(this.checkAddress(edge[1]) !== NodeType.None, `node ${edge[1]} not found at index ${index}`)
    })
    const address = this.hash(edges)
    this.table.set(address, edges)
    // console.log(' insert happening ' ,edges, address)
    return address
  }

  insertExternal (data: INode): string {
    if(data.getAddress() && this.checkAddress(data.getAddress()) !== NodeType.None){
      if(this.table.has(data.getAddress())){
        throw new Error(`node ${data.getAddress()} already exists in table`)
      }
      if(this.externalData.has(data.getAddress())){
        throw new Error(`node ${data.getAddress()} already exists in external data`)
      }
    }
    const address = this.hashFunc(data)
    // console.log('insertExternal', address, data)
    if (this.externalData.get(address)) return address
    else {
      this.externalData.set(address, data)
      return address  
    }
  }



  remove (node: INode): void {
    assert(this.checkAddress(node.getAddress(), true) !== NodeType.None, `address ${node.getAddress()} not found`)
    this.table.has(node.getAddress()) && this.table.delete(node.getAddress())
    this.externalData.has(node.getAddress()) && this.externalData.delete(node.getAddress())
    this.cache.has(node.getAddress()) && this.cache.delete(node.getAddress())
    /**
     * TODO: delete all edges that point to this address, 
     * notify interpreter? 
    */
    
  }


  getNodeByAddress (address: string): INode {
    // console.log('getNodeByAddress', address, this.checkAddress(address, true))
    if (!this.checkAddress(address, true)) {
      console.log('address was not found', address)
      throw new Error(`address ${address} not found`)
    }
    // console.log('queryNodeByAddress', address, this.cache.entries())
    // console.log('test1', this.cache.has(address))
    if (this.cache.has(address)) return this.cache.get(address) as INode
    if (this.externalData.has(address)) return this.externalData.get(address) as INode
    const edges = this.table.get(address) as [string, string][]
    // console.log('edges', edges)
    const result = edges.length > 0 ? new FosNode(edges, this) : (Array.isArray(edges) && edges.length === 0 ) ? new FosNode([], this) : this.externalData.get(address)
    if (!result) throw new Error(`Unable to construct node for address ${address}`)
    return result
  }


  query(query: INode): INode[] {
    /**
     * TODO: change this to return nodes that are part of the subgraph starting from the current root (or another root if specified)
     * 
     * query should return any nodes that have at least the same edges as the query, where the unit node is a wildcard. 
     * So this means that if the query has an edge to a different target, we need to go into that target and compare it to the 
     * entry. We can only stop comparing the trees once with hit a leaf node... unit, void, or external unless the entry 
     * doesn't have an edge of the type, or it has a different number of edges from the query
     */
    // console.log('query starting', query)
    const result: INode[] = []
    const tableEntries = [...this.table.entries()]
    tableEntries.forEach(([entrykey, entryvalue]) => {
      if (entrykey === query.getAddress()) return
      this.create(entryvalue)
      try {
        const matches = this.matchPattern(query, this.getNodeByAddress(entrykey))
        result.push(this.getNodeByAddress(entrykey))
      }catch (e: any) {
        if (!e.cause?.patternFailed){
          throw e
        }
        // console.log('query failed', e)
      }
    })
    return result
  }

  matchPattern (pattern: INode, entry: INode): INode[] {
    const patternMap = aggMap(pattern.getEdges())
    const nodeMap = aggMap(entry.getEdges())

    if(pattern.getAddress() === entry.getAddress()){
      return []
    }
    // if(pattern.getAddress() === this.anythingAddress){
    if(pattern.getAddress() === this.unitAddress){
      throw new Error('re-implement this with extension-defined wildcards')
      // return [entry]
    }
    if(pattern.getAddress() === this.voidAddress){
      throw new Error(`pattern expected void --- pattern ${pattern} does not match entry ${entry}`, { cause: { patternFailed: true } })
    }
    if(this.checkAddress(pattern.getAddress()) === NodeType.External || this.checkAddress(entry.getAddress()) === NodeType.External){
      throw new Error(`external mismatch --- pattern ${pattern} does not match entry ${entry}`, { cause: { patternFailed: true } })
    }

    const patternResult: INode[] = []
    for (const [patternKey, patternValues] of patternMap.entries()) {
      if (!nodeMap.has(patternKey)) {
        throw new Error(`pattern ${patternKey} does not exist on node entry.  Cannot resolve pattern`, { cause: { patternFailed: true } })
      }else {
        const entryTargetsForKey = nodeMap.get(patternKey) as string[]
        if( patternValues.length !== entryTargetsForKey.length){
          throw new Error(`pattern ${patternKey} has ${patternValues.length} entries, but node ${patternKey} has ${nodeMap.get(patternKey)?.length} entries.  Cannot resolve pattern`, { cause: { patternFailed: true } })
        }else{
          patternValues.forEach((patternValue, index) => {
            if (patternValue === this.unitAddress){
              patternResult.push(this.getNodeByAddress(entryTargetsForKey[index] as string))
            } else if (entryTargetsForKey[index] !== patternValue){
              // TODO: figure out what do here
              const subQueryResults = this.matchPattern(this.getNodeByAddress(patternValue), this.getNodeByAddress(entryTargetsForKey[index] as string))
              patternResult.push(...subQueryResults)
            }
          })
        }
      }
    }
    return patternResult
  }

  queryTriple(subject: INode, predicate: INode, object: INode): [INode, INode, INode][] {
    const subjectMatches = this.query(subject)
    const result: INode[] = []
    const tripleResults = subjectMatches.flatMap((subjectMatch) => {
      const edgeMatches = subjectMatch.getEdges().filter(([predicateKey, objectKey]) => {
        try {
          this.matchPattern(predicate, this.getNodeByAddress(predicateKey))
          return true
        } catch (e: any) {
          if (!e.cause?.patternFailed){
            throw e
          }
          return false
        }
      })
      const allMatches = edgeMatches.filter(([predicateKey, objectKey]) => {
        try {
          this.matchPattern(object, this.getNodeByAddress(objectKey))
          return true
        } catch (e : any) {
          if (!e.cause?.patternFailed){
            throw e
          }
          return false
        }

      })
      return allMatches.map(([predicateKey, objectKey]) => [subjectMatch, this.getNodeByAddress(predicateKey), this.getNodeByAddress(objectKey)] as [INode, INode, INode])
    })
    return tripleResults
  }

  negativeQueryTriple(subject: INode, predicate: INode, object: INode): [INode, INode, INode][] {
    if (subject.getAddress() === this.voidAddress) {
      const nodesToTest = this.query(object)
      const result = nodesToTest.filter((nodeToTest) => {
        const test = this.queryTriple(this.getNodeByAddress(this.unitAddress as string), predicate, nodeToTest)
        return test.length === 0
      })
      return result.map((node) => [subject, predicate, node] as [INode, INode, INode])
    } else if (predicate.getAddress() === this.voidAddress) {
      throw new Error('not implemented')
    } else if (object.getAddress() === this.voidAddress) {
      throw new Error('not implemented')
    } else {
      throw new Error('not a negative query')
    }
  }

  toJSON (){
    console.log('roots history', this.rootsHistory)
    console.log('exttable saved', [...this.externalData.keys()].length, [...this.externalData.values()])
    const data = {
      table: [...this.table.entries()],
      externalData: [...this.externalData.entries()].map(([_, value]) => value.getValue()), 
      rootsHistory: this.rootsHistory
    }
    return [JSON.stringify(data), this.version]
  }
  
  fromJSON (json: string) {
    try {
      const [dataString, version] = JSON.parse(json)
      const data = JSON.parse(dataString)
      // console.log('data', Object.keys(data), data.rootsHistory)
      // console.log('externdata', data.externalData)
      const externalDataEntries = data.externalData.forEach((value: string) => {
        // console.log('externalData entry', value)
          this.create(value)
      }) as [string, INode][]
      // console.log('exttable loaded', [...this.externalData.keys()].length, [...this.externalData.keys()], ...this.externalData.values())
      // console.log('gettingInt', this.externalData)

      // console.log('roots history - data loaded', this.rootsHistory)
      // console.log('gettingInt', this.externalData)
      const tableEntries = data.table.map(([key, value]: [string, [string, string][]]) => {
        // console.log('table entry', key, value)
        return [key, value as [string,string][]]
      }) as [string, [string, string][]][]
      this.table = new Map(tableEntries) as Map<string, [string, string][]>
      // console.log('gettingInt', this.externalData)
      this.init()
      this.rootsHistory = data.rootsHistory
      // console.log('gettingInt', this.externalData)
    } catch (e) {
      for (const upgradeFunc of this.upgradeFunctions()) {
        try {
          const newJson = upgradeFunc(json)
          this.fromJSON(newJson)
        } catch (e2) {
          continue
        }
      }
    }
    // console.log('gettingInt', this.externalData)
  }
  
  upgradeFunctions (): ((json: string) => string)[] {
    console.log('at version 0')
    return []
  }

  
}  

