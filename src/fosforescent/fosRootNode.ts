
import { FosNodeContent, FosContextData, FosRoute, FosTrail, FosNodesData, FosPath, SelectionPath } from '.'
import { FosContext } from './fosContext'
import { FosPeer, IFosPeer } from './fosPeer'


import _ from 'lodash'

import { FosNodeBase } from './fosNodeBase'
import { IFosNode } from './temp-types'


export class FosRootNode extends FosNodeBase implements IFosNode {

  activeOptionIndex: number | null = null
  activeRowIndex: number | null = null

  constructor(public context: FosContext, public route: FosRoute) {
    if (route.length !== 1){
      console.log('FosRootNode - invalid route', route)
      throw new Error('invalid route')
    }
    super(context, route)
  }



  addOption() {
    throw new Error('Method not implemented.')
  }

  addTask() {

  }

  addTodo() {

  }
  

}