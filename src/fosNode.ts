
import { FosNodeData, FosNodeContent, FosContextData, FosRoute, FosTrail, FosNodesData, FosPath, SelectionPath } from '.'
import { FosContext } from './fosContext'

import { diffChars, diffArrays, ArrayChange, Change } from 'diff'
import _ from 'lodash'


type ChildIndex = number
type OptionIndex = number

export class FosNode {

  activeOptionIndex: number | null = null
  activeRowIndex: number | null = null

  constructor(public context: FosContext, public route: FosRoute) {
  }

  parseIndex(index?: number) {
    const defaultIndex = this.activeOptionIndex !== null ? this.activeOptionIndex : this.getNodeData().selectedOption
    // console.log('parseIndex', index, this.activeOptionIndex, this.getNodeData(), this)
    return index === undefined ? defaultIndex : index
  }

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

  getRoute() {
    return this.route
  }

  getNodeData() {
    const nodeId = this.getNodeId()

    // console.log('getNodeData', nodeId, this.context)
    const data = this.context.data.nodes[nodeId]
    if (!data) {
      throw new Error(`no node options entry for ${nodeId}`)
    }
    return data
  }

  setNodeData(newData: FosNodeData) {
    // console.log('setNodeData', newData);


    return this.context.setNode(this, newData)
  }

  setNodeOptionData(index: number, newContent: FosNodeContent) {
    return this.context.updateNodeOptionData(this.route, newContent, index)
  }

  getOptionContent(index?: number): FosNodeContent {

    const indexToGet = this.parseIndex(index)

    const data = this.getNodeData()
    const selectedContent = data.options[indexToGet]
    if (!selectedContent) {
      const nodeId = this.getNodeId()
      console.log('getOptionContent', nodeId, indexToGet, data)
      throw new Error(`no node entry for ${nodeId} - ${indexToGet}`)
    }
    return selectedContent
  }

  updateOptionData(newContent: FosNodeContent | null, index?: number) {

    const indexToUpdate = this.parseIndex(index)

    const nodeData = this.getNodeData()
    const optionsStart = nodeData.options.slice(0, indexToUpdate)
    const optionsEnd = nodeData.options.slice(indexToUpdate + 1)
    const newOptions = optionsStart.concat(newContent ? [newContent] : []).concat(optionsEnd) as [FosNodeContent, ...FosNodeContent[]]
    const newNodeData: FosNodeData = {
      selectedOption: nodeData.selectedOption,
      description: nodeData.description,
      collapsed: nodeData.collapsed,
      options: newOptions as [FosNodeContent, ...FosNodeContent[]]
    }
    return newNodeData
  }

  updateNodeData(newData: FosNodeData) {
    const nodeId = this.getNodeId()
    return this.context.setNode(this, newData)
  }
  
  getChildren(index?: number) {
    const indexToGet = this.parseIndex(index) 
    const data = this.getOptionContent(indexToGet)
    const childEntries: FosNodeContent["content"] = data.content
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

  isChildOf(parent: FosNode) {
    const thisRoute = this.route
    const parentRoute: FosRoute = parent.route
    const isParent = parentRoute.every(([type, id]: [string, string], index: number) => {
      return type == thisRoute[index]?.[0] && id == thisRoute[index]?.[1]
    })
    // console.log('isChildOf', parentRoute, thisRoute, isParent)
    return isParent
  }

  
  /**
   * @param nthGen number of generations to go up
   * @returns [node: FosNode, childIndex: number, optionIndex: number]
   */
  getParent(nthGen: number): [FosNode, number, number] {
    if (nthGen > this.route.length) {
      throw new Error(`node does not have ${nthGen} ancestors`);
    }
    if (nthGen === 1){
      const newRoute = this.route.slice(0, this.route.length - nthGen) as FosRoute

      const parentNode = this.context.getNode(newRoute)
      
      /**
       * TODO: This is probably a nightmare waiting to happen
       *   What needs to happen is that I need to parse the option index from the route  
       *  */
      parentNode.activeOptionIndex = parentNode.getNodeData().selectedOption

      parentNode.getChildren().forEach((child: FosNode, index: number) => {
        if (child.getNodeId() === this.getNodeId()  && child.getNodeType() === this.getNodeType()){
          parentNode.activeRowIndex = index
        }
      })
  
      if (parentNode.activeRowIndex === null) {
        throw new Error(`could not find child in parent`)
      }
      if (!parentNode.activeOptionIndex){
        throw new Error(`could not find active option index in parent`)
      }

      return [parentNode, parentNode.activeRowIndex, parentNode.activeOptionIndex]
    } else {
      const [parent, childIndex, optionIndex] = this.getParent(nthGen - 1)
      return parent.getParent(1)
    }

  }

  addOption() {
    return this.context.addOptionToNode(this.route)
  }

  deleteOption(index: number) {
    const nodeData = this.getNodeData()
    if (nodeData.options.length === 1) {
      throw new Error('cannot delete last option')
    }
    
    const newSelectedOption = nodeData.selectedOption ? nodeData.selectedOption - 1 : 0 

    const optionsStart = nodeData.options.slice(0, index)
    const optionsEnd = nodeData.options.slice(index + 1)
    const newOptions = optionsStart.concat(optionsEnd) as [FosNodeContent, ...FosNodeContent[]]
    const newNodeData: FosNodeData = {
      selectedOption: nodeData.selectedOption === index ? nodeData.selectedOption : newSelectedOption,
      description: nodeData.description,
      collapsed: nodeData.collapsed,
      options: newOptions as [FosNodeContent, ...FosNodeContent[]]
    }
    return this.context.setNode(this, newNodeData)
  }

  deleteRowByIndex(rowIndex:number, optionIndex?: number) {
    const indexToGet = this.parseIndex(optionIndex)
    const optionContent = this.getOptionContent(indexToGet)
    const newContent = optionContent.content.slice(0, rowIndex).concat(optionContent.content.slice(rowIndex + 1))
    const newOption: FosNodeContent = {
      description: optionContent.description,
      data: optionContent.data,
      content: newContent
    }
    return this.updateOptionData(newOption, indexToGet)
  }

  deleteNode() {
    const [parentNode] = this.getParent(1)
    const optionContent = parentNode.getOptionContent()
    const newContentRows = optionContent.content.filter(([type, id]: [string, string]) => type !== this.getNodeType() || id !== this.getNodeId())
    const newOption = {
      ...optionContent,
      content: newContentRows
    }
    if (_.isEqual(this.context.data.focus.route, this.route)){
      const newContext = this.moveFocusUp(-1)
      if (!newContext){
        return this.context.setOptionOnNode(parentNode.getRoute(), newOption)
      } else {
        return newContext.setOptionOnNode(parentNode.getRoute(), newOption)
      }
    } else{
      return this.context.setOptionOnNode(parentNode.getRoute(), newOption)
    }

  }

  moveFocusUp(charpos?: number) {
    // console.log('moveFocusUp', this.route)
    try {
      // console.log('moveFocusUp - parent', this.route)
      const [parentNode, childIndex, optionIndex] = this.getParent(1)
      const children = parentNode.getChildren(optionIndex)
      // console.log('moveFocusUp - parent', childIndex)
      if (childIndex === 0) {
        const newRoute = parentNode.getRoute()
        // console.log('moveFocusUp - parent act', this.route)
        const parentDescription = parentNode.getNodeData().description
        const charPosition = charpos ? (charpos < 0 ? parentDescription.length + charpos : charpos) : this.context.data.focus.char
        const newContext = this.context.setFocus(newRoute, charPosition)
        return newContext
        
      } else {
        // console.log('moveFocusUp - hasoldersib', this.route)
        const nextChild = children[childIndex - 1] as FosNode
        const nextChildData = nextChild.getNodeData()
        const nextChildChildren = nextChild.getChildren()
        if (nextChildData.collapsed || nextChildChildren.length === 0){
          const newRoute = nextChild.getRoute()
          const nextChildDescription = nextChild.getNodeData().description
          const charPosition = charpos ? (charpos < 0 ? nextChildDescription.length + charpos : charpos) : this.context.data.focus.char
          const newContext = this.context.setFocus(newRoute, charPosition)
          return newContext  
        }else{
          const lastDescendent = nextChild.getLastDescendent()
          const newRoute = lastDescendent.getRoute()
          const lastDescendentDescription = lastDescendent.getNodeData().description
          const charPosition = charpos ? (charpos < 0 ? lastDescendentDescription.length + charpos : charpos) : this.context.data.focus.char
          const newContext = this.context.setFocus(newRoute, charPosition)
          return newContext
        }
      }
    } catch (e) {
      console.log('moveFocusDown - no parent', e)
      return 
    }
  }

  moveFocusDown(ignoreChildren = false) {
    // console.log('moveFocusDown', this.route)
    if (!this.getNodeData().collapsed && !ignoreChildren){
      // console.log('moveFocusDown - not collapsed', this.route)
      const thisNodeChildren = this.getChildren()
      if (thisNodeChildren.length > 0) {
        // console.log('moveFocusDown - hasChildren', this.route)
        const firstChild = thisNodeChildren[0] as FosNode
        const newRoute = firstChild.getRoute()
        const newContext = this.context.setFocus(newRoute, this.context.data.focus.char)
        return newContext
      }
    }
    try {
      // console.log('moveFocusDown - parent', this.route)
      const [parentNode, childIndex, optionIndex] = this.getParent(1)
      const children = parentNode.getChildren(optionIndex)
      if (childIndex === children.length - 1) {
        // console.log('at last sib')
        try {
          // console.log('moveFocusDown - grandparent', this.route)
          parentNode.moveFocusDown(true)
          
        } catch (e) {
          // console.log('moveFocusDown - no grandparent', e)
          return 
        }
        // console.log('moveFocusDown - grandparent2', this.route)

      } else {
        // console.log('moveFocusDown - hasSib', this.route)
        const nextChild = children[childIndex + 1] as FosNode
        const newRoute = nextChild.getRoute()
        const newContext = this.context.setFocus(newRoute, this.context.data.focus.char)
        return newContext
      }
    } catch (e) {
      console.log('moveFocusDown - no parent', e)
      return 
    }
  }



  getLastDescendent(visibleOnly = true): FosNode {
    const children = this.getChildren()
    const isCollapsed = this.getNodeData().collapsed
    if (children.length === 0 || (visibleOnly && isCollapsed)){
        return this
    }else{
      const lastChild = children[children.length - 1] as FosNode
      return lastChild.getLastDescendent(visibleOnly)
    }
  }

  acceptMerge() {
    const mergeNode = this.getNodeData().mergeNode
    if (!mergeNode){
      throw new Error('no merge node')
    }
    const mergeNodeData = this.context.data.nodes[mergeNode]
    if (!mergeNodeData){
      throw new Error('no merge node data')
    }
    const [parent, childIndex, optionIndex] = this.getParent(1)
    const currentContent = parent.getOptionContent(optionIndex)
    if (!currentContent.content[childIndex]){
      console.log('acceptMerge - no current content', currentContent, childIndex, currentContent.content)
      throw new Error('no current content')
    }
    const rowElem = currentContent.content[childIndex]
    if (!rowElem){
      console.log('acceptMerge - no current content', currentContent, childIndex, currentContent.content)
      throw new Error('no current content')
    }

    const newRowElem: [string, string] = [rowElem[0], mergeNode]
    const newRowsStart = currentContent.content.slice(0, childIndex)
    const newRowsEnd = currentContent.content.slice(childIndex + 1)
    const mergedContent = {
      ...currentContent,
      content: [...newRowsStart, newRowElem, ...newRowsEnd]
    }
    const newContext = parent.setNodeOptionData(optionIndex, mergedContent)
    const thisNewNode = newContext.getNode(this.route)
    const thisNewNodeData = thisNewNode.getNodeData()
    const thisNewNodeUpdatedData = {
      ...thisNewNodeData,
      mergeNode: undefined
    }
    const newContext2 = thisNewNode.setNodeData(thisNewNodeUpdatedData)
    return newContext2
  }

  rejectMerge(){
    const mergeNode = this.getNodeData().mergeNode
    if (!mergeNode){
      throw new Error('no merge node')
    }
    const mergeNodeData = this.context.data.nodes[mergeNode]
    if (!mergeNodeData){
      throw new Error('no merge node data')
    }

    const thisNodeData = this.getNodeData()
    const thisNodeUpdatedData = {
      ...thisNodeData,
      mergeNode: undefined
    }
    const newContext = this.setNodeData(thisNodeUpdatedData)
    // console.log('rejectMerge', newContext.getNode(this.route).getNodeData())
    return newContext
  }

  bothMerge() {
    const mergeNode = this.getNodeData().mergeNode
    if (!mergeNode){
      throw new Error('no merge node')
    }
    const mergeNodeData = this.context.data.nodes[mergeNode]
    if (!mergeNodeData){
      throw new Error('no merge node data')
    }
    const [parent, childIndex, optionIndex] = this.getParent(1)
    const currentContent = parent.getOptionContent(optionIndex)

    const rowElem = currentContent.content[childIndex]
    if (!rowElem){
      console.log('acceptMerge - no current content', currentContent, childIndex, currentContent.content)
      throw new Error('no current content')
    }
    const newRowElem: [string, string] = [rowElem[0], mergeNode]
    
    const newRowsStart = currentContent.content.slice(0, childIndex + 1)
    const newRowsEnd = currentContent.content.slice(childIndex + 1)
    const mergedContent = {
      ...currentContent,
      content: [...newRowsStart, newRowElem, ...newRowsEnd]
    }
    const newContext = parent.setNodeOptionData(optionIndex, mergedContent)
    const thisNewNode = newContext.getNode(this.route)
    const thisNewNodeData = thisNewNode.getNodeData()
    const thisNewNodeUpdatedData = {
      ...thisNewNodeData,
      mergeNode: undefined
    }
    const newContext2 = thisNewNode.setNodeData(thisNewNodeUpdatedData)
    return newContext2
  }


  getMergeOptions(): {
    description: Change[],
    content: ArrayChange<[string, string]>[]
  }[] {
    const baseNodeOptions = this.getNodeData().options
    const mergeNodeOptions = this.mergeNodeData().options


    const optionsDiff = diffArrays(baseNodeOptions, mergeNodeOptions, { comparator: (left: FosNodeContent, right: FosNodeContent) => {
      return diffIsClose(diffChars(left.description, right.description)) || diffIsClose(diffArrays(left.content, right.content))
    } })
    

    let currentBaseNodeIndex = 0
    let currentMergeNodeIndex = 0

    const optionsDiffWithSubdiffs = optionsDiff.reduce((acc: {
      description: Change[],
      content: ArrayChange<[string, string]>[]
    }[], change: ArrayChange<FosNodeContent>) => {
      
      if (change.added){
        // taking new
        const withDiffs = change.value.map((optionValue, i) => {
          const mergeIndex = currentMergeNodeIndex + i
          const mergeNodeOption = mergeNodeOptions[mergeIndex]

          if (!mergeNodeOption){
            throw new Error('no merge node option')
          }

          const mergeDescription = mergeNodeOption.description
          const mergeContent = mergeNodeOption.content

          return {
            description: diffChars(mergeDescription, mergeDescription),
            content: diffArrays(mergeContent, mergeContent, { comparator: (left: [string, string], right: [string, string]) => {
              return left[0] === right[0] && left[1] === right[1]
            } })
          }

        })
        currentMergeNodeIndex = change.count ? currentMergeNodeIndex + change.count : currentMergeNodeIndex
        return [...acc, ...withDiffs]
      } else if (change.removed) {
        // taking old
        const withDiffs = change.value.map((optionValue, i) => {
          const baseIndex = currentBaseNodeIndex + i
          const baseNodeOption = baseNodeOptions[baseIndex]

          if (!baseNodeOption){
            throw new Error('no merge node option')
          }

          const baseDescription = baseNodeOption.description
          const baseContent = baseNodeOption.content

          return {
            description: diffChars(baseDescription, baseDescription),
            content: diffArrays(baseContent, baseContent, { comparator: (left: [string, string], right: [string, string]) => {
              return left[0] === right[0] && left[1] === right[1]
            } })
          }

        })
        currentBaseNodeIndex = change.count ? currentBaseNodeIndex + change.count : currentBaseNodeIndex
        return [...acc, ...withDiffs]

      } else {
        const withDiffs = change.value.map((optionValue, i) => {

          const mergeIndex = currentMergeNodeIndex + i
          const mergeNodeOption = mergeNodeOptions[mergeIndex]

          if (!mergeNodeOption){
            throw new Error('no merge node option')
          }

          const mergeDescription = mergeNodeOption.description
          const mergeContent = mergeNodeOption.content

          const baseIndex = currentBaseNodeIndex + i
          const baseNodeOption = baseNodeOptions[baseIndex]

          if (!baseNodeOption){
            throw new Error('no merge node option')
          }

          const baseDescription = baseNodeOption.description
          const baseContent = baseNodeOption.content

          return {
            description: diffChars(baseDescription, mergeDescription),
            content: diffArrays(baseContent, mergeContent, { comparator: (left: [string, string], right: [string, string]) => {
              return left[0] === right[0] && left[1] === right[1]
            } })
          }

        })
        currentBaseNodeIndex = change.count ? currentBaseNodeIndex + change.count : currentBaseNodeIndex
        return [...acc, ...withDiffs]
      }


    }, [])

    return optionsDiffWithSubdiffs
  }

  hasMerge() {
    const nodeOptions = this.getNodeData()
    const hasMergeID = !!nodeOptions.mergeNode

    const mergeDiff = nodeOptions.mergeNode ? !_.isEqual(nodeOptions, this.context.data.nodes[nodeOptions.mergeNode] || {}) : false
  
  
    const hasMerge = hasMergeID && mergeDiff
    // console.log('hasMerge', hasMerge, hasMergeID, mergeDiff, nodeOptions, this.context.data.nodes[nodeOptions.mergeNode!], this.context.data.nodes)
    return hasMerge  
  }

  getMergedIndex() {
    const nodeOptions = this.getNodeData()
    const mergeNode = nodeOptions.mergeNode
    if (!mergeNode){
      throw new Error('no merge node')
    }
    const mergeNodeData = this.context.data.nodes[mergeNode]
    if (!mergeNodeData){
      throw new Error('no merge node data')
    }
    const baseNodeIndex = nodeOptions.selectedOption
    const mergeNodeIndex = mergeNodeData.selectedOption

    return (mergeNodeIndex ? mergeNodeIndex : baseNodeIndex)

  }

  getMergeChildren(index?: number) {
    if (!index){
      index = this.getMergedIndex()
    }
    if (!index){
      throw Error("no index")
    }
    const mergedOptions = this.getMergeOptions()
    const mergedOption = mergedOptions[index]
    if (!mergedOption){
      throw new Error('no merged option')
    }
    const mergedContent = mergedOption.content
    const mergeChildren : {
      added?: boolean,
      removed?: boolean,
      node: FosNode
    }[] = mergedContent.reduce((acc: {
      added?: boolean,
      removed?: boolean,
      node: FosNode
    }[], change: ArrayChange<[string, string]>) => {
      const changeNodes = change.value.map(([type, id]) => {
        const newRoute = this.route.concat([[type, id]]) as FosRoute
        // if (type === 'task') {
          const result: {
            added?: boolean,
            removed?: boolean,
            node: FosNode
          } = {
            ...(change.added ? {added: true} : {}),
            ...(change.removed ? {removed: true} : {}),
            node: this.context.getNode(newRoute)
          }
          return result
        // } else {
        //   throw new Error(`unknown type ${type}`)
        // }
      })
      const result : {
        added?: boolean,
        removed?: boolean,
        node: FosNode
      }[] = [...acc, ...changeNodes]

      return result
    }, [])
    return mergeChildren
  }


  mergeNodeData(){
    const mergeNode = this.getNodeData().mergeNode
    if (!mergeNode){
      throw new Error('no merge node')
    }
    const mergeNodeData = this.context.data.nodes[mergeNode]
    if (!mergeNodeData){
      throw new Error('no merge node data')
    }
    return mergeNodeData
  }

  mergeNodeContent() {
    const mergeNodeData = this.mergeNodeData()
    const mergeSelectedOption = mergeNodeData.selectedOption
    const mergeNodeContent = mergeNodeData.options[mergeSelectedOption]

    if (!mergeNodeContent){
      console.log('getMergeDescription - no merge content', mergeNodeContent)
      throw new Error('no merge content')
    }
    return mergeNodeContent
  }


  setPath(selectionPath: SelectionPath): FosContext {
    const newContext = Object.keys(selectionPath).reduce((accOuter, key, index) => {

      const thisNode = accOuter.getNode(this.getRoute())
      const nodeChildren = thisNode.getChildren()

      if (nodeChildren.length === 0){
        if (!selectionPath[key as unknown as number]){
          console.log('path is not valid - key not found', selectionPath, key)
          throw new Error('path is not valid - key not found')
        }
        if (Object.keys(selectionPath[key as unknown as number] || {}).length !== 0){
          console.log('path is not valid - key not empty at leaf', selectionPath, key)
          throw new Error('path is not valid')
        }


        const activeOptionIndex = parseInt(key)
        const newContext = thisNode.setNodeData({
          ...thisNode.getNodeData(),
          selectedOption: activeOptionIndex
        })
        return newContext

      } else {
        const selections = selectionPath[key as unknown as number]

        if (!selections){
          console.log('path is not valid - key not found', selectionPath, key)
          throw new Error('path is not valid - key not found')
        }
        if (selections.length !== nodeChildren.length){
          console.log('path is not valid - selections length different from children length', selections.length, nodeChildren.length, selectionPath, key, this.getNodeId())
          throw new Error('path is not valid')
        }

        const updatedContextWithChildSelections = nodeChildren.reduce((accInner: FosContext, child: FosNode, i: number) => {

          const childNode = accInner.getNode(child.getRoute())
          const childSelection = selections[i]

          if (!childSelection){
            console.log('path is not valid - selection not found for child', selectionPath, key)
            throw new Error('path is not valid - selection not found for child')
          }

          const selectionKeys = Object.keys(childSelection)

          if (selectionKeys.length !== 1){
            console.log('path is not valid - selection keys length not 1', selectionKeys, selectionPath, key)
            throw new Error('path is not valid')
          }

          const newChildContext =  childNode.setPath(childSelection)
          return newChildContext
        }, accOuter)

        const nodeFromUpdatedContext = updatedContextWithChildSelections.getNode(thisNode.getRoute())

        const updatedContextWithOptionSelection = nodeFromUpdatedContext.setNodeData({
          ...nodeFromUpdatedContext.getNodeData(),
          selectedOption: parseInt(key)
        })

        return updatedContextWithOptionSelection

      }
      

    }, this.context)

    return newContext
  }

  setData(data: Partial<FosNodeContent["data"]>, index?: number) {
    const indexToUse = this.parseIndex(index)
    const nodeContent = this.getOptionContent(indexToUse)
    const newNodeContent = {
      ...nodeContent,
      data: {
        ...nodeContent.data,
        ...data
      }
    }
    return this.setNodeOptionData(indexToUse, newNodeContent)
    
  }

  getData(index?: number) {
    const indexToUse = this.parseIndex(index)

    const nodeContent = this.getOptionContent(indexToUse)

    // if (!nodeContent.data){
    //   console.log('getData', nodeContent, nodeContent.data)
    // }
    return nodeContent.data || {}
  }


}







type DiffChange <T> = Change | ArrayChange<T>

const diffIsClose = <T>(diffArray: DiffChange<T>[] ) => {
  if (diffArray.length === undefined || isNaN(diffArray.length)){
    throw new Error('diff array is empty')
  }
  // console.log('diffIsClose', diffArray)
  const {
    total,
    changed
  } : { total: number, changed: number } = diffArray.reduce((acc: {total: number, changed: number}, change : DiffChange<T> ) => {

    const result : {total : number, changed: number } = { 
      changed: (change.added || change.removed) ? acc.changed + 1 : acc.changed,
      total: acc.total + 1
    }
    return result
  }, {total: 0, changed: 0})
  // console.log('total', changed / total, diffArray)
  return ( changed / total ) < 0.5
}