import { IFosInterpreter, INode, IStore } from '..';
import { FosNode, NoContextNode } from './node'
import { getAllOfNode } from '../dag-implementation/node-factory';

export class PrimitiveStringNode extends NoContextNode<string> {}
export class PrimitiveNumberNode extends NoContextNode<string> {}


export class PrimitiveInstructionNode extends FosNode implements INode {

  constructor(interpreter: IFosInterpreter, ){
    super([], interpreter.store)
  }

  addTypeConstructor(alias: string) {

  }


}

export class TreeInstructionNode extends FosNode implements INode {


  asInstruction(): (input: INode) => Promise<INode> {
      throw new Error("Method not implemented.");
  }

  addDep() {

  }

  getDeps() {

  }


}



export const getStringInstruction = (store: IStore, { value } : { value?: RegExp } = {}) => {
return (new StringInstructionNode(value || /.*/, store))
}

export const getEffectInstruction = (store: IStore, { callback, instruction } : { callback?: (node: INode) => Promise<INode>, instruction?: INode } = {}) => {
  return (new EffectInstructionNode(callback || (async (node) => { console.log('node',node); return node} ), store)) 
}


class StringInstructionNode extends NoContextNode<{ pattern?: RegExp}> implements INode {
  constructor(pattern: RegExp, store: IStore) {
    super({pattern}, store, false)
    // console.log('addr', this.getAddress())
  }

  generateTarget<S>(data?: S): INode {
    // console.log('here')
    return new NoContextNode(data || '', this.store, false)
  }



}

class EffectInstructionNode extends NoContextNode<{ callback?: (node: INode) => Promise<INode>}> implements INode {
  constructor(callback: (node: INode) => Promise<INode>, store: IStore) {
    super({callback}, store, false)
    console.log('addr', this.getAddress())
  }

  generateTarget<S>(data?: S): INode {
    const previousRootEdge = this.store.create('previousRootEdge')
    const value: [string, string][] = [
      // [previousRootEdge.getAddress(), data?.currentRoot?.getAddress()] as [string, string],
    ]
     
    const tentativeTarget = new FosNode(value, this.store)
    return tentativeTarget

  }

}




class FoldersNode extends FosNode implements INode {


}

class TagsNode extends FosNode implements INode {

}

class DependencyNode extends FosNode implements INode {

}

class CommentNode extends FosNode implements INode {

}

class OptionNode extends FosNode implements INode {
    
}

class ListNode extends FosNode implements INode {

}

class BooleanNode extends FosNode implements INode {

}
class FalseNode extends FosNode implements INode {}
class TrueNode extends FosNode implements INode {}