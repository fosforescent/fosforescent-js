import { FosNode, NoContextNode } from './node';
export class PrimitiveStringNode extends NoContextNode {
}
export class PrimitiveNumberNode extends NoContextNode {
}
export class PrimitiveInstructionNode extends FosNode {
    constructor(interpreter) {
        super([], interpreter.store);
    }
    addTypeConstructor(alias) {
    }
}
export class TreeInstructionNode extends FosNode {
    asInstruction() {
        throw new Error("Method not implemented.");
    }
    addDep() {
    }
    getDeps() {
    }
}
export const getStringInstruction = (store, { value } = {}) => {
    return (new StringInstructionNode(value || /.*/, store));
};
export const getEffectInstruction = (store, { callback, instruction } = {}) => {
    return (new EffectInstructionNode(callback || (async (node) => { console.log('node', node); return node; }), store));
};
class StringInstructionNode extends NoContextNode {
    constructor(pattern, store) {
        super({ pattern }, store, false);
        // console.log('addr', this.getAddress())
    }
    generateTarget(data) {
        // console.log('here')
        return new NoContextNode(data || '', this.store, false);
    }
}
class EffectInstructionNode extends NoContextNode {
    constructor(callback, store) {
        super({ callback }, store, false);
        console.log('addr', this.getAddress());
    }
    generateTarget(data) {
        const previousRootEdge = this.store.create('previousRootEdge');
        const value = [
        // [previousRootEdge.getAddress(), data?.currentRoot?.getAddress()] as [string, string],
        ];
        const tentativeTarget = new FosNode(value, this.store);
        return tentativeTarget;
    }
}
class FoldersNode extends FosNode {
}
class TagsNode extends FosNode {
}
class DependencyNode extends FosNode {
}
class CommentNode extends FosNode {
}
class OptionNode extends FosNode {
}
class ListNode extends FosNode {
}
class BooleanNode extends FosNode {
}
class FalseNode extends FosNode {
}
class TrueNode extends FosNode {
}
