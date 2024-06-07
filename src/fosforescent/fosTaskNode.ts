
import {FosNodeContent, FosContextData, FosRoute, FosTrail, FosNodesData, FosPath, SelectionPath, FosNodeBase } from '.'
import { FosContext } from './fosContext'
import { FosPeer, IFosPeer } from './fosPeer'


import _ from 'lodash'


export class FosTaskNode extends FosNodeBase {

  activeOptionIndex: number | null = null
  activeRowIndex: number | null = null

  constructor(public context: FosContext, public route: FosRoute) {
    super(context, route)
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

    const nodeData = this.context.data.nodes[this.getNodeId()]?.data

    if(!nodeData){
      throw new Error(`no node content for ${this.getNodeId()}`)
    }
    // if (!nodeContent.data){
    //   console.log('getData', nodeContent, nodeContent.data)
    // }
    return nodeData || {}
  }



  addOptionToNode(nodeOptionData?: FosNodeContent, index?: number) {
    // add parent node of type option
  }


}




