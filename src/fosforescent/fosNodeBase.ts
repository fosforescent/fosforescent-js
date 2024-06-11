
import { FosNodeContent, FosNodeId, FosRoute, SelectionPath, FosContextData, RouteElement, FosDataContent } from './temp-types'

import { FosPeer, IFosPeer } from './fosPeer'


import _ from 'lodash'


type ChildIndex = number
type OptionIndex = number



export interface INodeMin<T extends INodeMin<T>> {
  // createChild: (edgeData: S, node: TrellisNodeClass<T, S>) => void
  // removeChild: (edge: TrellisEdgeClass<T, S>, node: TrellisNodeClass<T, S>) => void
  setChildren: (children: T[]) => void
  getChildren: () => T[]
  getId: () => string
  newChild: () => T
  getString: () => string
  setString: (string: string) => void
  getParent: () => T | null

}


export interface IFosNode extends INodeMin<IFosNode> {
  getId(): string
  getNodeType(): string
  getRoute(): FosRoute
  getAncestors(): [IFosNode, number][]
  getParent(): IFosNode | null
  getChild([type, id]: [string, string]): IFosNode
  getChildren(): IFosNode[]
  addPeer(peer: IFosPeer): Promise<void>
  pullFromPeer(peer: IFosPeer): Promise<void>
  getData(): FosDataContent
  setData(data: Partial<FosDataContent>): void
  pushToPeer(peer: IFosPeer): Promise<void>
  delete(): void
  // getUpNode(): IFosNode
  // getDownNode(): IFosNode
  focusNode(charpos?: number): void
  setChildren(children: IFosNode[]): void
  // newChild(type: FosNodeId): IFosNode
  newChild(): IFosNode
  getString(): string
  setString(newString: string): void
  serializeData(): Promise<FosContextData>
  notify(): Promise<void>
  handleChildChange(child: IFosNode): Promise<void>
}


export class FosNodeBase implements IFosNode {

  peers: IFosPeer[] = []
  data: FosDataContent; 
  children: IFosNode[] = []
  zoomedIn: boolean = false
  focused: boolean = false
  cached: FosContextData | null = null

  constructor(context: FosContextData, private parent: FosNodeBase | null, private id: FosNodeId, private type: FosNodeId) {
    this.data = context.nodes[this.id].data
    this.init(context)
  }

  init(context: FosContextData) {
    const content: FosNodeContent = context.nodes[this.id]
    if (!content){
      throw new Error(`no node options entry for ${this.id}.  Data is malformed`)
    }

    if (!content.content){
      throw new Error(`no content entry for node ${this.id}.  Data is malformed`)
    }

    this.data = content.data

    if (context.trail){
      this.zoomedIn = true
    }

    if (context.focus){
      this.focused = true
    }


    this.children = content.content.map(([type, id]: [string, string]) => {

      const updatedContext = {
        nodes: {
          ...context.nodes,
         },
        trail: context.trail ? context.trail.slice(1) : null,
        focus: context.focus ? {
          route: context.focus.route.slice(1),
          char: context.focus.char
        } : null
      }

      delete updatedContext.nodes[this.id]

      return new FosNodeBase(updatedContext, this, id, type)
    })
  }

  getNodeId() {
    return this.id
  }

  getNodeType() {
    return this.type
  }

  getId() {
    return `${this.getNodeId()}`
  }

  getRouteElem(): RouteElement {
    return [this.getNodeType(), this.getId()]
  }

  getRoute() {
    const helper = (node: FosNodeBase): FosRoute => {
      if (node.parent) {
        return [...helper(node.parent), node.getRouteElem()]
      } else {
        return [this.getRouteElem()]
      }
    }
    return helper(this)
  }


  updateNodeData(newData: FosDataContent): void {
    this.data = _.merge(this.data, newData)
    this.notify()
  }
  
  getChildren(): IFosNode[] {
    return this.children
  }

  setChildren(children: IFosNode[]) {
    console.log('FOS- settingChildren', children)
    this.children = children
    this.notify()
  }

  newId(): FosNodeId {
    return crypto.randomUUID()
  }

  // newChild(type: FosNodeId): IFosNode {
  newChild(): IFosNode {
    console.log('FOS - newChild')
    const newContent: FosNodeContent = {
      data: {
        description: {
          content: 'new task'
        }
      },
      content: []
    }
    const newId = this.newId();
    const newNode = new FosNodeBase({
      nodes: {
        [newId]: newContent
      },
      trail: [],
      focus: {
        route: [],
        char: 0
      }
    }, this, newId, "task")


    this.setChildren([...this.children, newNode])
    
    
    return newNode
  }

  getChild([type, id]: [string, string]): IFosNode {
    const children = this.getChildren()
    const child = children.find((child: IFosNode) => {
      return child.getId() === id && child.getNodeType() === type
    })
    if (!child) {
      throw new Error(`no child found for ${type} ${id}`)
    }
    return child
  }


  isChildOf(parent: IFosNode) {
    const thisChild = this.parent?.getChildren().find((child: IFosNode) => {
      return child.getId() === this.getId() && child.getNodeType() === this.getNodeType()
    })
    // console.log('isChildOf', parentRoute, thisRoute, isParent)
    return !!thisChild
  }

  

  getAncestors(): [IFosNode, number][] {
    const helper = (node: IFosNode, acc: [IFosNode, number][]): [IFosNode, number][] => {
      const nodeParent = node.getParent()
      if (nodeParent) {

        const newEntry: [IFosNode, number] = [nodeParent, nodeParent.getChildren().findIndex((child: IFosNode) => {
          return child.getId() === node.getId() && child.getNodeType() === node.getNodeType()
        })]

        return helper(nodeParent, [...acc, newEntry])
      } else {
        return acc
      }
    }
    const result: [IFosNode, number][] =  helper(this, [])
    return result
  }
  
  getParent(): IFosNode | null {
    return this.parent
  }


  deleteRow(rowIndex:number) {
    this.children = this.children.filter((child, i) => i !== rowIndex)
  }

  delete() {
    const [parentNode, childIndex] = this.getAncestors()[0]
    parentNode.setChildren(parentNode.getChildren().filter((child: IFosNode, index) => index !== childIndex))
  }


  setData(data: Partial<FosNodeContent["data"]>) {
    this.updateNodeData({
      ...this.data,
      ...data
    })
  }

  getData() {
    return this.data
  }

  getRelativeTrail() {
        
  }



  async addPeer(peer: FosPeer): Promise<void> {
    this.peers.push(peer)
    // await this.context.addPeer(peer, this.getRoute())
  }

  async removePeer(peer: IFosPeer){
    // this.context.peers = this.context.peers.filter((p) => p !== peer)
    this.peers = this.peers.filter((p) => p !== peer)
  }

  async pullFromPeer(peer: IFosPeer): Promise<void> {
    const thisPeer = this.peers.filter((p) => p === peer)
    if (thisPeer.length === 0){
      throw new Error('peer not found')
    }else{
      const peerCtxData = await peer.pullFromPeer()
      if (!peerCtxData){
        return
      }
      this.deserializeData(peerCtxData)
      return
    }
  }

  async pushToPeer(peer: IFosPeer){
    const serializedData = await this.serializeData()
    await peer.pushToPeer(serializedData)
    return
  }

  async serializeData(): Promise<FosContextData> {
    const thisContent = {
      data: this.data,
      content: this.children.map((child: IFosNode) => {
        return [child.getNodeType(), child.getId()]
      })
    }
    const childrenDatas = await Promise.all(this.children.map((child: IFosNode) => {
      return child.serializeData()
    }))

    const zoomedChild = childrenDatas.find((childData) => { 
      return childData.trail && childData.trail.length > 0
    })
    
    const focusedChild = childrenDatas.find((childData) => {
      return childData.focus && childData.focus.route.length > 0
    })

    const thisTrail = this.zoomedIn ? [this.getRouteElem(), ...(zoomedChild?.trail || [])] : null

    const thisFocus = this.focused ? { 
        route: [this.getRouteElem(), ...(focusedChild?.focus?.route || [])],
        char: focusedChild?.focus?.char || 0
      }: null

    return {
      nodes: {
        [this.getId()]: thisContent,
        ...childrenDatas.reduce((acc, childData) => {
          return {
            ...acc,
            ...childData.nodes
          }
        }, {})
      },
      trail: thisTrail,
      focus: thisFocus
    }
  } 

  async deserializeData(data: FosContextData): Promise<void> {
    this.init(data)
  }

  focusNode(charpos?: number) {
    throw new Error('Method not implemented.')
  }



  async handleChildChange(child: IFosNode) {
    // const data = await this.serializeData()
    for (const peer of this.peers){
      await this.pushToPeer(peer)
    }
    this.notify()
  }

  async notify() {
    const newData = await this.serializeData()
    const changed = !_.isEqual(newData, this.cached)
    if (changed){
      if (this.parent){
        await this.parent.handleChildChange(this)
      }
        this.cached = newData
    }
  }

  getString(){
    return this.data.description?.content || ""
  }

  setString(newString: string){
    console.log('FOS setString', newString)
    this.setData({
      description: {
        content: newString
      }
    })
    // this.setData notifies
    
  }



  setPath(selectionPath: SelectionPath) {

    throw new Error('not implemented')
    this.notify()
    // setData notifies



    // const newContext = Object.keys(selectionPath).reduce((accOuter, key, index) => {

    //   const thisNode = accOuter.getNode(this.getRoute())
    //   const nodeChildren = thisNode.getChildren()

    //   if (nodeChildren.length === 0){
    //     if (!selectionPath[key as unknown as number]){
    //       console.log('path is not valid - key not found', selectionPath, key)
    //       throw new Error('path is not valid - key not found')
    //     }
    //     if (Object.keys(selectionPath[key as unknown as number] || {}).length !== 0){
    //       console.log('path is not valid - key not empty at leaf', selectionPath, key)
    //       throw new Error('path is not valid')
    //     }


    //     const activeOptionIndex = parseInt(key)

    //     const content = thisNode.getNodeContent()

    //     const newContext = thisNode.setNodeContent({
    //       ...content,
    //       data: {
    //         ...content.data,
    //         option: {
    //           ...(content.data.option || {}),
    //           selectedIndex: activeOptionIndex
    //         }
    //       }
    //     })
    //     return newContext

    //   } else {
    //     const selections = selectionPath[key as unknown as number]

    //     if (!selections){
    //       console.log('path is not valid - key not found', selectionPath, key)
    //       throw new Error('path is not valid - key not found')
    //     }
    //     if (selections.length !== nodeChildren.length){
    //       console.log('path is not valid - selections length different from children length', selections.length, nodeChildren.length, selectionPath, key, this.getNodeId())
    //       throw new Error('path is not valid')
    //     }

    //     const updatedContextWithChildSelections = nodeChildren.reduce((accInner: FosContext, child: FosNode, i: number) => {

    //       const childNode = accInner.getNode(child.getRoute())
    //       const childSelection = selections[i]

    //       if (!childSelection){
    //         console.log('path is not valid - selection not found for child', selectionPath, key)
    //         throw new Error('path is not valid - selection not found for child')
    //       }

    //       const selectionKeys = Object.keys(childSelection)

    //       if (selectionKeys.length !== 1){
    //         console.log('path is not valid - selection keys length not 1', selectionKeys, selectionPath, key)
    //         throw new Error('path is not valid')
    //       }

    //       const newChildContext =  childNode.setPath(childSelection)
    //       return newChildContext
    //     }, accOuter)

    //     const nodeFromUpdatedContext = updatedContextWithChildSelections.getNode(thisNode.getRoute())

    //     const updatedContextWithOptionSelection = nodeFromUpdatedContext.setNodeData({
    //       ...nodeFromUpdatedContext.getNodeData(),
    //       selectedOption: parseInt(key)
    //     })

    //     return updatedContextWithOptionSelection

    //   }
      

    // }, this.context)

    // return newContext
  }

}






export class FosRootNode extends FosNodeBase {

  constructor(contextData: FosContextData, setContextData: (contextData: FosContextData) => Promise<void>) {
    const id = contextData.trail ? contextData.trail[0][1] : "root"
    const type = contextData.trail ? contextData.trail[0][0] : "root"
    super(contextData, null, id, type)

    const setContextWithLog = async (contextData: FosContextData) => {
      console.log('setContextData', contextData)
      await setContextData(contextData)
    }

    const peer = new FosPeer({
      pushToRemote: setContextWithLog,
      pullFromRemote: async () => contextData,
      pushCondition: async () => true,
      pullCondition: async () => false,
      data: contextData,
      mergeData:  (data: FosContextData, newData: FosContextData) => newData
    })

    this.addPeer(peer)

  }
  

}




