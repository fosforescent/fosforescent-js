
import { 
  
  FosNodeContent, 
  FosContextData, 
  FosRoute, 
  FosTrail, 
  FosNodesData, 
  IFosNode,
  FosPeer,
  IFosPeer
 } from '.'
import { FosRootNode } from './fosRootNode'
import { RouteElement } from './temp-types'



export class FosContext {

  locked = false
  peers: FosPeer[] = []

  constructor(public data: FosContextData) {
    if (!data.nodes){
      console.log('FosContext - no nodes', data)
      throw new Error('no nodes')
    }
  }

  updateData(data: FosContextData){
    for (const peer of this.peers){
      peer.pushToPeer(data)
    }
    this.data = data
  }


  setNodes(newNodes: FosNodesData, newFocus?: { route: FosRoute, char: number }, newTrail?: FosTrail) {
    if (!this.data.nodes){
      console.log('setNodes - no nodes', this.data)
      throw new Error('no nodes')
    }

    const newData = {
      ...this.data, 
      nodes: newNodes, 
      focus: newFocus || this.data.focus, 
      trail: newTrail || this.data.trail
    }
    // console.log('setNodes - beforeUpdate', newData);
    this.locked = true
    const contextToReturn = new FosContext(newData)
    this.updateData(newData)
    this.locked = false
    return contextToReturn
  }

  setTrail(newTrail: FosTrail) {
    const newData = {...this.data, trail: newTrail}
    this.updateData(newData)
    return new FosContext(newData)
  }

  setFocus(newRoute: FosRoute, char: number) {
    const newData = {...this.data, focus: { route: newRoute, char } }
    this.updateData(newData)
    return new FosContext(newData)
  }

  update(){
    this.updateData(this.data)
  }

  getNode(fosRoute: FosRoute) {
    const rootNode: IFosNode = this.getRootNode()
    const node: IFosNode = fosRoute.reduce((acc: IFosNode, [type, id]: [string, string], index: number) => {
      return acc.getChild([type, id])
    }, rootNode)
    return node
  }

  getRootNode() {
    return new FosRootNode(this, this.getRootRoute())
  }

  setNode(node: IFosNode, nodeData: FosNodeContent) {
    // console.log('setNode', nodeData);
    const nodeId = node.getNodeId()
    const newNodes: FosNodesData = {
      ...this.data.nodes, 
      [nodeId]: nodeData
    }
    return this.setNodes(newNodes)
  }

  insertNode(nodeData: FosNodeContent): [FosContext, string]{
    const nodeId = this.newId(nodeData)

    const newNodes: FosNodesData = {
      ...this.data.nodes, 
      [nodeId]: nodeData
    }
    const newContext = this.setNodes(newNodes)
    return [newContext, nodeId]
  }

  updateNodeAtRoute(route: FosRoute, nodeData: FosNodeContent) {
    const node = this.getNode(route)
    const nodeContent = node.getNodeContent()
    const nodeId = node.getNodeId()
    const newNodes: FosNodesData = {
      ...this.data.nodes, 
      [nodeId]: nodeContent
    }
    return this.setNodes(newNodes)
  }



  newId(nodeData: FosNodeContent){
    // console.log('global', global.crypto, window.crypto, globalThis)
    return crypto.randomUUID()
  }



  deserializeTrailFromUrl(url: string): FosTrail {

    const [startOption, ...rest] = url.split('/').filter((s) => s !== "")
    // console.log('deserializeTrailFromUrl - startOption', startOption)
    // console.log('deserializeTrailFromUrl - rest', rest)
    // console.log('deserializeTrailFromUrl - url', url)

    const firstElem: FosRoute = [["root", "root"]]
    const firstNode = this.getNode(firstElem)

    throw new Error('not implemented')
    // const firstNodeData = firstNode.getNodeContent()
    // const firstNodeOptions = firstNodeData.options
    // const firstNodeOption = firstNodeOptions[parseInt(startOption || "0")]

    // if (!firstNodeOption){
    //   throw new Error('firstNodeOption not found')
    // }

    // // console.log('firstElem', firstElem, firstNodeData, firstNodeOptions, firstNodeOption)

    // const trail: FosRoute = rest.reduce((acc: FosTrail, row: string) => {
    //   const [rowNumber, optionIndex] = row.split('-').map((s) => parseInt(s))
    //   if (!rowNumber || isNaN(rowNumber) || !optionIndex || isNaN(optionIndex)){
    //     console.log('invalid row', row, url, startOption, rest)
    //     throw new Error('invalid row')
    //   }
    //   const lastNode = this.getNode(acc)
    //   const lastNodeData = lastNode.getNodeContent()
    //   const [_, foundElem]: [number, [string, string] | null] = lastNodeData.options.reduce((acc: [number, [string, string] | null], option: FosNodeContent) => {
    //     if (rowNumber < option.content.length){
    //       const row = option.content[rowNumber]
    //       if (!row){
    //         throw new Error('row not found')
    //       }
    //       const returnVal: [number, [string, string] | null] = [0, row]
    //       return returnVal
    //     } else {
    //       const returnVal: [number, [string, string] | null] = [acc[0] - option.content.length, null]
    //       return returnVal
    //     }
    //   }, [rowNumber, null])

    //   const newAcc: FosRoute = [...acc, foundElem as [string, string]]
    //   return newAcc
    // }, firstElem)

    // return trail

  }

  serializeTrailToUrl(trail: FosTrail): string {

    const [start, ...rest] = trail

    throw new Error('not implemented')
    // const startNodeData = this.getNode([start]).getNodeContent()
    // const startNodeOption = startNodeData.selectedOption
    // const startString = `${startNodeOption}/`

    // const [restString, _] = rest.reduce((acc: [string, FosNodeData], [type, id]: [string, string], index) => {

    //   const subTrail: FosRoute = [start, ...trail.slice(0, index + 1)]
    //   const nodeData = this.getNode(subTrail).getNodeContent()
    //   const optionIndex = nodeData.selectedOption

    //   const rowNumber = nodeData.options.reduce((acc: number, option: FosNodeContent, index: number) => {
    //     if (index < optionIndex){
    //       return acc + option.content.length
    //     } else if (index === optionIndex){
    //       return acc + option.content.findIndex(([type, id]) => type === type && id === id)
    //     } else {
    //       return acc
    //     }
    //   }, 0)

    //   const newNodeData = this.getNode(subTrail).getNodeContent()

    //   const newAcc: [string, FosNodeData] = [`${acc}${rowNumber}-${nodeData.selectedOption}/`, newNodeData]
    //   return newAcc

    // }, [startString, startNodeData])

    // return restString
  }

  getRootRoute(): FosRoute {
    return [['root', 'root']]
  }

  
}


