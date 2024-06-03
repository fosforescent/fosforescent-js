
import { FosNodeData, FosNodeContent, FosContextData, FosRoute, FosTrail, FosNodesData, FosPath } from '.'

import { FosNode } from './fosNode'
import { FosPeer, IFosPeer } from './fosPeer'
import { Fos } from './old'

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

  getNode(route: FosRoute) {
    const node = new FosNode(this, route)
    return node
  }

  setNode(node: FosNode, nodeData: FosNodeData) {
    // console.log('setNode', nodeData);
    const nodeId = node.getNodeId()
    const newNodes: FosNodesData = {
      ...this.data.nodes, 
      [nodeId]: nodeData
    }
    return this.setNodes(newNodes)
  }

  insertNode(nodeData: FosNodeData, route: FosRoute, index?: number): [FosContext, string]{
    const nodeId = this.newId(nodeData)
    const newNodes: FosNodesData = {
      ...this.data.nodes, 
      [nodeId]: nodeData
    }
    const newContext = this.setNodes(newNodes)
    return [newContext, nodeId]
  }

  updateNodeAtRoute(route: FosRoute, nodeData: FosNodeData) {
    const node = new FosNode(this, route)
    const nodeId = node.getNodeId()
    const newNodes: FosNodesData = {
      ...this.data.nodes, 
      [nodeId]: nodeData
    }
    return this.setNodes(newNodes)
  }

  updateNodeOptionData(route: FosRoute, nodeContent: FosNodeContent, index?: number) {
    const node = this.getNode(route)
    // update node selected option
    const newData = node.updateOptionData(nodeContent, index)
    return this.updateNodeAtRoute(route, newData)
  }

  
  getNodeOptionsAndObj(route: FosRoute): [FosNodeData, FosNodeContent, number] {
    const node = new FosNode(this, route)
    const nodeOptions = node.getNodeData()
    const selectedOption = node.getOptionContent()
    return [nodeOptions, selectedOption, nodeOptions.selectedOption]
  }


  newId(nodeData: FosNodeData){
    // console.log('global', global.crypto, window.crypto, globalThis)
    return crypto.randomUUID()
  }

  addNewTaskToOption(route: FosRoute, contentIndex?: number, optionIndex?: number ) {
    const node = this.getNode(route)

    const newNodeData: FosNodeData = {
      selectedOption: 0,
      collapsed: false,
      description: "",
      options: [{
        description: "",
        data: {},
        content: [],
      }],
    }

    const newRowId = this.newId(newNodeData)

    const existingContent = node.getOptionContent(optionIndex)
    const newRowIndex = contentIndex === undefined ? existingContent.content.length : contentIndex

    const existingContentStart = existingContent.content.slice(0, newRowIndex + 1)
    const existingContentEnd = existingContent.content.slice(newRowIndex + 1)

    const pathElem = ['task', newRowId] as [string, string]

    const newRows = existingContentStart.concat([pathElem]).concat(existingContentEnd)

    const newContent: FosNodeContent = {
      ...existingContent,
      content: newRows
    }

    const newParentData = node.updateOptionData(newContent, optionIndex)
    const parentId = node.getNodeId()

    const newRoute = route.concat([pathElem]) as FosRoute

    const newNodesData: FosNodesData = {
      ...this.data.nodes,
      [parentId]: newParentData,
      [newRowId]: newNodeData
    }

    console.log('route', route, newRoute)

    return this.setNodes(newNodesData, { route: newRoute, char: 0 })

  }

  setOptionOnNode(route: FosRoute, optionData: FosNodeContent | null, index?: number) {
    const node = this.getNode(route)
    const newNodeData = node.updateOptionData(optionData, index)
    const newContext: FosContext = this.setNode(node, newNodeData)
    console.log('newNodes', newContext);
    return newContext
  }

  addOptionToNode(route: FosRoute, nodeOptionData?: FosNodeContent, index?: number) {
    const node = this.getNode(route)

    const newOptionIndex = index === undefined ? node.getNodeData().options.length : index

    const nodeData = node.getNodeData()
    const newContent: FosNodeContent = {
      description: "",
      data: {},
      content: [],
      ...nodeOptionData
    }
    const optionsStart = nodeData.options.slice(0, newOptionIndex)
    const optionsEnd = nodeData.options.slice(newOptionIndex)

    const newNodeData: FosNodeData = {
      ...nodeData,
      selectedOption: newOptionIndex,
      options: optionsStart.concat([newContent]).concat(optionsEnd) as [FosNodeContent, ...FosNodeContent[]]
    }
    const newContext: FosContext = node.updateNodeData(newNodeData)
    console.log('newNodes', newContext);
    return this.setNodes(newContext.data.nodes);
  }

  moveNodeLeft(route: FosRoute) {
    const thisNode = this.getNode(route)
    const [parentNode, childIndex, parentOptionIndex] = thisNode.getParent(1)
    const [grandParentNode, parentIndex, grandparentOptionIndex] = thisNode.getParent(2)    

    const parentRowContent = parentNode.getOptionContent(parentOptionIndex)
    const newParentRows = parentRowContent.content.slice(0, childIndex).concat(parentRowContent.content.slice(childIndex + 1))
    const newParentContent = {
      ...parentRowContent,
      content: newParentRows
    }

    const grandParentRowContent = grandParentNode.getOptionContent(grandparentOptionIndex)
    const grandparentRowsStart = grandParentRowContent.content.slice(0, parentIndex + 1)
    const grandparentRowsEnd = grandParentRowContent.content.slice(parentIndex + 1)
    const newGrandparentRows = grandparentRowsStart.concat([[thisNode.getNodeType(), thisNode.getNodeId()]]).concat(grandparentRowsEnd)


    const newGrandparentContent = {
      ...grandParentRowContent,
      content: newGrandparentRows
    }


    console.log('moveNodeLeft', newGrandparentContent, newParentContent)

    const contextWithNewGrandparent = this.setOptionOnNode(grandParentNode.getRoute(), newGrandparentContent, grandparentOptionIndex)
    const contextWithNewParent = contextWithNewGrandparent.setOptionOnNode(parentNode.getRoute(), newParentContent, parentOptionIndex)

    this.setNodes(contextWithNewParent.data.nodes)
  
  }

  addYoungerSibling(route: FosRoute) {
    console.log('addYoungerSibling', route)
    const thisNode = this.getNode(route)
    const [parentNode, childIndex, optionIndex] = thisNode.getParent(1)
    const newContext = this.addNewTaskToOption(parentNode.getRoute(), childIndex, optionIndex)
    this.setNodes(newContext.data.nodes, newContext.data.focus, newContext.data.trail)
  }

  moveNodeRight(route: FosRoute) {
    const thisNode = this.getNode(route)
    const [parentNode, childIndex, optionIndex] = thisNode.getParent(1)
    if (childIndex > 0){
      const olderSibling = parentNode.getChildren(optionIndex)[childIndex - 1]!
      const olderSiblingRow = olderSibling.getOptionContent()
      const newContent = olderSiblingRow.content.concat([[thisNode.getNodeType(), thisNode.getNodeId()]])
      const newOlderSiblingRowData: FosNodeContent = {
        ...olderSiblingRow,
        content: newContent
      }

      const parentContent = parentNode.getOptionContent(optionIndex)

      const newParentContent = parentContent.content.slice(0, childIndex).concat(parentContent.content.slice(childIndex + 1))
      const newParentRowData = {
        ...parentContent,
        content: newParentContent
      }

      console.log("MoveNodeRight", newParentContent, newContent, newOlderSiblingRowData, newParentRowData)

      const contextWithNewOlderSibling = this.setOptionOnNode(olderSibling.getRoute(), newOlderSiblingRowData)
      const contextWithNewParent = contextWithNewOlderSibling.setOptionOnNode(parentNode.getRoute(), newParentRowData, optionIndex)
      this.setNodes(contextWithNewParent.data.nodes)

    } else {
      throw new Error('cannot move right')
    }
  }

  moveNodeUp(route: FosRoute) {
    throw new Error('not implemented')
  }

  moveNodeDown(route: FosRoute) {
    throw new Error('not implemented')
  }

  removeNodeFromParent(route: FosRoute) {
    throw new Error('not implemented')
  }

  deleteOption(route: FosRoute, index?: number) {
    // this.setOptionOnNode(route, null, index)
    throw new Error('not implemented')
  }

  deleteNode(route: FosRoute): FosContext {
    throw new Error('not implemented')
  }


  snipNode(route: FosRoute): FosContext {
    throw new Error('not implemented')
  }


  deserializeTrailFromUrl(url: string): FosTrail {

    const [startOption, ...rest] = url.split('/').filter((s) => s !== "")
    // console.log('deserializeTrailFromUrl - startOption', startOption)
    // console.log('deserializeTrailFromUrl - rest', rest)
    // console.log('deserializeTrailFromUrl - url', url)

    const firstElem: FosRoute = [["root", "root"]]
    const firstNode = this.getNode(firstElem)

    const firstNodeData = firstNode.getNodeData()
    const firstNodeOptions = firstNodeData.options
    const firstNodeOption = firstNodeOptions[parseInt(startOption || "0")]

    if (!firstNodeOption){
      throw new Error('firstNodeOption not found')
    }

    // console.log('firstElem', firstElem, firstNodeData, firstNodeOptions, firstNodeOption)

    const trail: FosRoute = rest.reduce((acc: FosTrail, row: string) => {
      const [rowNumber, optionIndex] = row.split('-').map((s) => parseInt(s))
      if (!rowNumber || isNaN(rowNumber) || !optionIndex || isNaN(optionIndex)){
        console.log('invalid row', row, url, startOption, rest)
        throw new Error('invalid row')
      }
      const lastNode = this.getNode(acc)
      const lastNodeData = lastNode.getNodeData()
      const [_, foundElem]: [number, [string, string] | null] = lastNodeData.options.reduce((acc: [number, [string, string] | null], option: FosNodeContent) => {
        if (rowNumber < option.content.length){
          const row = option.content[rowNumber]
          if (!row){
            throw new Error('row not found')
          }
          const returnVal: [number, [string, string] | null] = [0, row]
          return returnVal
        } else {
          const returnVal: [number, [string, string] | null] = [acc[0] - option.content.length, null]
          return returnVal
        }
      }, [rowNumber, null])

      const newAcc: FosRoute = [...acc, foundElem as [string, string]]
      return newAcc
    }, firstElem)

    return trail

  }

  serializeTrailToUrl(trail: FosTrail): string {

    const [start, ...rest] = trail

    const startNodeData = this.getNode([start]).getNodeData()
    const startNodeOption = startNodeData.selectedOption
    const startString = `${startNodeOption}/`

    const [restString, _] = rest.reduce((acc: [string, FosNodeData], [type, id]: [string, string], index) => {

      const subTrail: FosRoute = [start, ...trail.slice(0, index + 1)]
      const nodeData = this.getNode(subTrail).getNodeData()
      const optionIndex = nodeData.selectedOption

      const rowNumber = nodeData.options.reduce((acc: number, option: FosNodeContent, index: number) => {
        if (index < optionIndex){
          return acc + option.content.length
        } else if (index === optionIndex){
          return acc + option.content.findIndex(([type, id]) => type === type && id === id)
        } else {
          return acc
        }
      }, 0)

      const newNodeData = this.getNode(subTrail).getNodeData()

      const newAcc: [string, FosNodeData] = [`${acc}${rowNumber}-${nodeData.selectedOption}/`, newNodeData]
      return newAcc

    }, [startString, startNodeData])

    return restString
  }

  addChildrenToNode (node: FosNode, children: FosNodeData[], index?: number) {
    console.log('addChildrenToNode1')


    const indexToInsert = node.parseIndex(index)
    const nodeData = node.getNodeData()
    console.log('addChildrenToNode2')
    const optionsStart: FosNodeContent[] = nodeData.options.slice(0, indexToInsert)
    const optionsEnd: FosNodeContent[] = nodeData.options.slice(indexToInsert + 1)

    const nodeOptionData = node.getOptionContent(indexToInsert)

    const [newContext, newContent] = children.reduce((acc: [FosContext, [string, string][]], child: FosNodeData) => {
      const [newContext, id] = acc[0].insertNode(child, node.getRoute(), indexToInsert)
      console.log('addChildrenToNode3')

      const newAcc: [FosContext, [string, string][]] = [newContext, acc[1].concat([[node.getNodeType(), id]])]
      return newAcc
    }, [this, []] as [FosContext, [string, string][]])


    console.log('addChildrenToNode4', newContext, newContent)
    const updatedOption: FosNodeContent = {
      ...nodeOptionData,
      content: [...nodeOptionData.content, ...newContent]
    }

    const newOptions: [FosNodeContent, ...FosNodeContent[]] = [...optionsStart, updatedOption, ...optionsEnd] as [FosNodeContent, ...FosNodeContent[]]
    console.log('addChildrenToNode5', updatedOption, newOptions)
    const newNodeData: FosNodeData = {
      selectedOption: nodeData.selectedOption,
      description: nodeData.description,
      collapsed: nodeData.collapsed,
      options: newOptions
    }
    console.log('addChildrenToNod6', newNodeData)
    const newNode = newContext.getNode(node.getRoute())
    const newerContext = newNode.setNodeData(newNodeData)
    console.log('addChildrenToNode7', newNode.context.data, newerContext)
    // this.updateData(newerContext.data)
    return this.setNodes(newerContext.data.nodes)
  }



  moveNodeToTopChild(subjectNode: FosNode, targetNode: FosNode, index?: number){
    const indexToInsert = targetNode.parseIndex(index)
    const newEdge = [subjectNode.getNodeType(), subjectNode.getNodeId()] as [string, string]
    const currentTargetData = targetNode.getOptionContent(indexToInsert)
    const newTargetData = {
      ...currentTargetData,
      content: [newEdge, ...currentTargetData.content]
    }
    const newContext = targetNode.setNodeOptionData(indexToInsert, newTargetData)
    const newContextSubject = newContext.getNode(subjectNode.getRoute())
    const newContextWithDeleted = newContextSubject.deleteNode()
    return this.setNodes(newContextWithDeleted.data.nodes)
  }

  moveNodeToOlderSibling(subjectNode: FosNode, targetNode: FosNode, index?: number){
    const indexToInsert = targetNode.parseIndex(index)
    const newEdge = [subjectNode.getNodeType(), subjectNode.getNodeId()] as [string, string]
    const [currentTargetParent, childIndex, parentSelectedIndex] = targetNode.getParent(1)
    const targetParentData = currentTargetParent.getOptionContent(parentSelectedIndex)

    const newSubjectIndex = childIndex

    const beforeContent = targetParentData.content.slice(0, newSubjectIndex)
    const afterContent = targetParentData.content.slice(newSubjectIndex)

    const newContent = beforeContent.concat([newEdge]).concat(afterContent)
    const newContentFiltered = newContent.filter((e, ix) => {
      return ix === newSubjectIndex ? true : (e[0] !== subjectNode.getNodeType() || e[1] !== subjectNode.getNodeId())
    })

    console.log('moveNodeToOlderSibling', newContentFiltered, newSubjectIndex, newContent, beforeContent, afterContent)

    const newTargetData = {
      ...targetParentData,
      content: newContentFiltered
    }
    const newContext = currentTargetParent.setNodeOptionData(parentSelectedIndex, newTargetData)
    return this.setNodes(newContext.data.nodes)

  }

  moveNodeToYoungerSibling(subjectNode: FosNode, targetNode: FosNode, index?: number){
    const indexToInsert = targetNode.parseIndex(index)
    const newEdge = [subjectNode.getNodeType(), subjectNode.getNodeId()] as [string, string]
    const [currentTargetParent, childIndex, parentSelectedIndex] = targetNode.getParent(1)
    const targetParentData = currentTargetParent.getOptionContent(parentSelectedIndex)

    const newSubjectIndex = childIndex + 1

    const beforeContent = targetParentData.content.slice(0, newSubjectIndex)
    const afterContent = targetParentData.content.slice(newSubjectIndex)
    const newContent = beforeContent.concat([newEdge]).concat(afterContent)
    const newContentFiltered = newContent.filter((e, ix) => {
      return ix === newSubjectIndex ? true : (e[0] !== subjectNode.getNodeType() || e[1] !== subjectNode.getNodeId())
    })

    const newTargetData = {
      ...targetParentData,
      content: newContentFiltered
    }
    const newContext = currentTargetParent.setNodeOptionData(parentSelectedIndex, newTargetData)

    return this.setNodes(newContext.data.nodes)

  }

  getRootRoute(): FosRoute {
    return [['root', 'root']]
  }

  addPeer(peer: FosPeer){
    const rootNode = this.getNode(this.getRootRoute())
    const result = rootNode.addPeer(peer, rootNode.getRoute())
  }

  async pullFromPeer(peer: IFosPeer) {
    const rootNode = this.getNode(this.getRootRoute())
    return await rootNode.pullFromPeer(peer)
  }

  async pushToPeer(peer: IFosPeer) {
    const rootNode = this.getNode(this.getRootRoute())
    return await rootNode.pushToPeer(peer)
  }

}


