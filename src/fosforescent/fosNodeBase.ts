
import {FosNodeContent, FosContextData, FosRoute, FosTrail, FosNodesData, FosPath, SelectionPath } from '.'
import { FosContext } from './fosContext'
import { FosPeer, IFosPeer } from './fosPeer'


import _ from 'lodash'


type ChildIndex = number
type OptionIndex = number



export interface INodeMin {
  // createChild: (edgeData: S, node: TrellisNodeClass<T, S>) => void
  // removeChild: (edge: TrellisEdgeClass<T, S>, node: TrellisNodeClass<T, S>) => void
  setChildren: (children: INodeMin) => void
  getChildren: () => INodeMin[]
  getId: () => string
  newChild: () => INodeMin
  getString: () => string
  setString: (string: string) => void
  getParent: () => INodeMin | null

}


export interface IFosNode{
  getNodeId(): string
  getNodeType(): string
  getRoute(): FosRoute
  getNodeContent(): FosNodeContent
  setNodeContent(newData: FosNodeContent): FosContext
  getAncestors(nthGen: number): [[IFosNode, number], ...[IFosNode, number][]]
  getParent(): IFosNode
  getChild([type, id]: [string, string]): IFosNode
  getChildren(): IFosNode[]
  addPeer(peer: IFosPeer): Promise<void>
  pullFromPeer(peer: IFosPeer): Promise<FosContext>
  pushToPeer(peer: IFosPeer): Promise<void>
  deleteRow(rowIndex:number): FosContext
  // getUpNode(): IFosNode
  // getDownNode(): IFosNode
  focusNode(charpos?: number): FosContext
  setChildren(children: IFosNode[]): FosContext
  getId(): string
  newChild(): IFosNode
  getString(): string
  setString(newString: string): FosContext
}




export class FosNodeBase implements IFosNode {

  activeOptionIndex: number | null = null
  activeRowIndex: number | null = null
  peers: IFosPeer[] = []

  constructor(public context: FosContext, public route: FosRoute) {}


  getNodeId() {
    const [left, right] = this.route[this.route.length - 1] as [string, string]
    const nodeId = right
    return nodeId
  }

  getNodeType() {
    const [left, right] = this.route[this.route.length - 1] as [string, string]
    const nodeType = left
    return nodeType
  }

  getId() {
    return `${this.getNodeType()}-${this.getNodeId()}`
  }

  getRoute() {
    return this.route
  }

  getNodeContent() {
    const nodeId = this.getNodeId()

    // console.log('getNodeData', nodeId, this.context)
    const data = this.context.data.nodes[nodeId]
    if (!data) {
      throw new Error(`no node options entry for ${nodeId}`)
    }
    return data
  }

  setNodeContent(newData: FosNodeContent): FosContext {
    // console.log('setNodeData', newData);


    return this.context.setNode(this, newData)
  }


  updateNodeData(newData: FosNodeContent) {
    const nodeId = this.getNodeId()
    return this.context.setNode(this, newData)
  }
  
  getChildren(): IFosNode[] {
    const nodeContent = this.getNodeContent()
    const childEntries: FosNodeContent["content"] = nodeContent.content
    const children = childEntries.map(([type, id]: [string, string]) => {
      const newRoute = this.route.concat([[type, id]]) as FosRoute
      if (type === 'task') {
        return this.context.getNode(newRoute)
      } else {
        throw new Error(`unknown type ${type}`)
      }
    });
    return children
  }

  setChildren(children: IFosNode[]) {
    const newContent = children.map((child: IFosNode) => {
      return [child.getNodeType(), child.getNodeId()]
    }) as FosNodeContent["content"]
    const newNodeContent = {
      ...this.getNodeContent(),
      content: newContent
    }
    return this.setNodeContent(newNodeContent)
  }

  newChild(): IFosNode {
    const newContent: FosNodeContent = {
      data: {
        description: {
          content: 'new task'
        }
      },
      content: []
    }
    const [newNode, newCtx] = this.addChildToNode(newContent, 'task')
    return newNode
  }

  getChild([type, id]: [string, string]): IFosNode {
    const children = this.getChildren()
    const child = children.find((child: IFosNode) => {
      return child.getNodeId() === id && child.getNodeType() === type
    })
    if (!child) {
      throw new Error(`no child found for ${type} ${id}`)
    }
    return child
  }


  isChildOf(parent: IFosNode) {
    const thisRoute = this.route
    const parentRoute: FosRoute = parent.getRoute()
    const isParent = parentRoute.every(([type, id]: [string, string], index: number) => {
      return type == thisRoute[index]?.[0] && id == thisRoute[index]?.[1]
    })
    // console.log('isChildOf', parentRoute, thisRoute, isParent)
    return isParent
  }

  

  getAncestors(nthGen: number): [[IFosNode, number], ...[IFosNode, number][]] {
    if (nthGen > this.route.length || nthGen < 1) {
      throw new Error(`node does not have ${nthGen} ancestors`);
    }
    if (nthGen === 1){
      const newRoute = this.route.slice(0, this.route.length - nthGen) as FosRoute

      const parentNode = this.context.getNode(newRoute)
      
      let currentNodeChildIndex: number | null = null;
 
      parentNode.getChildren().forEach((child: IFosNode, index: number) => {
        if (child.getNodeId() === this.getNodeId()  && child.getNodeType() === this.getNodeType()){
          currentNodeChildIndex = index
        }
      })
  
      if (currentNodeChildIndex === null) {
        throw new Error(`could not find child in parent`)
      }

      return [[parentNode, currentNodeChildIndex]]
    } else {
      const [parent, childIndex]: [IFosNode, number] = this.getAncestors(1)[0]
      return [[parent, childIndex], ...parent.getAncestors(nthGen - 1)]
    }

  }
  
  getParent(): IFosNode {
    return this.getAncestors(1)[0][0]
  }



  deleteRow(rowIndex:number) {
    const nodeContent = this.getNodeContent()
    const newContent = nodeContent.content.slice(0, rowIndex).concat(nodeContent.content.slice(rowIndex + 1))
    const newNodeContent = {
      ...nodeContent,
      content: newContent
    }
    return this.setNodeContent(newNodeContent)
  }

  delete() {
    const [parentNode, childIndex] = this.getAncestors(1)[0]
    parentNode.deleteRow(childIndex)
  }


  setData(data: Partial<FosNodeContent["data"]>) {
    const nodeContent = this.getNodeContent()
    const newNodeContent = {
      ...nodeContent,
      data: {
        ...nodeContent.data,
        ...data
      }
    }
    return this.setNodeContent(newNodeContent)
    
  }

  getData() {
    const nodeContent = this.getNodeContent()
    return nodeContent.data
  }

  addChildToNode (childContent: FosNodeContent, childType: string): [IFosNode, FosContext]{
    const [newCtx, insertedNodeId] = this.context.insertNode(childContent)
    const newThisNode = newCtx.getNode(this.getRoute())
    const nodeContent = newThisNode.getNodeContent()
    const newContent: FosNodeContent["content"] = [...nodeContent.content, [childType, insertedNodeId]]
    const finalContext = newThisNode.setNodeContent({ ... nodeContent, content: newContent })
    const finalNode = finalContext.getNode(this.getRoute())
    return [finalNode, finalContext]
  }


  async addPeer(peer: FosPeer): Promise<void> {
    this.peers.push(peer)
    // await this.context.addPeer(peer, this.getRoute())
  }

  async removePeer(peer: IFosPeer){
    // this.context.peers = this.context.peers.filter((p) => p !== peer)
    this.peers = this.peers.filter((p) => p !== peer)
  }

  async pullFromPeer(peer: IFosPeer): Promise<FosContext> {
    const thisPeer = this.peers.filter((p) => p === peer)
    if (thisPeer.length === 0){
      throw new Error('peer not found')
    }else{
      const peerCtxData = await peer.pullFromPeer()
      if (!peerCtxData){
        return this.context
      }
      const peerCtx = new FosContext(peerCtxData)
      const peerNode = peerCtx.getNode(this.getRoute())
      const newCtx = this.setNodeContent(peerNode.getNodeContent())
      return newCtx
    }
  }

  async pushToPeer(peer: IFosPeer){
    const newData = await peer.pushToPeer({ ...this.context.data, trail: this.getRoute() })
  }



  focusNode(charpos?: number): FosContext {
    throw new Error('Method not implemented.')
  }

  

  moveFocusUp(charpos?: number) {
    const upNode = this.getUpNode()
    const newCtx = upNode.focusNode(charpos)
    return newCtx
  }

  moveFocusDown(ignoreChildren = false) {
    const downNode = this.getDownNode()
    const newCtx = downNode.focusNode()
    return newCtx
  }

  getString(){
    return this.getNodeContent().data.description?.content || ""
  }

  setString(newString: string){
    const content = this.getNodeContent()
    return this.setData({
      ...content.data,
      description: {
        ...content.data.description,
        content: newString
      }
    })
  }



  setPath(selectionPath: SelectionPath): FosContext {

    throw new Error('not implemented')
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

  getUpNode(): IFosNode {
    throw new Error('Method not implemented.')
  } 

  getDownNode(): IFosNode {
    throw new Error('Method not implemented.')
  }



}




