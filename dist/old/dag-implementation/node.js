import { NodeStatus } from '../types';
import { assert } from '../util';
export class NoContextNode {
    value;
    store;
    address = '';
    constructor(value, store, internal = false) {
        this.value = value;
        this.store = store;
        if (!internal) {
            this.address = this.store.insertExternal(this);
        }
    }
    toJSON() {
        return JSON.stringify(this.value);
    }
    toString() {
        return this.value ? this.value.toString() : this.value === null ? 'null' : 'undefined';
    }
    getAddress() {
        return this.address;
    }
    getValue() {
        return this.value;
    }
    getEdge(edgeType, child) {
        return undefined;
    }
    getEdges() {
        return [];
    }
    addEdge(edgeType, target) {
        throw new Error('Cannot add edge to a NoContextNode');
    }
    removeEdge(edgeType, target) {
        throw new Error('Cannot remove edge from a NoContextNode');
    }
    updateEdge(oldEdgeType, oldTarget, newEdgeType, newTarget) {
        throw new Error('Cannot update edge from a NoContextNode');
    }
    delete() {
        this.store.remove(this);
    }
    asInstruction() {
        const value = this.getValue();
        if (typeof value === 'function') {
            return value;
        }
        else {
            throw new Error('provided node is not a function');
        }
    }
    generateTarget(data) {
        console.log('here', data);
        throw new Error('Method not implemented.');
    }
    merge(other) {
        if (typeof other.getValue() !== typeof this.getValue()) {
            throw new Error('Cannot merge nodes of different types');
        }
        else {
            return other;
        }
    }
}
export class FosNode extends NoContextNode {
    constructor(value, store) {
        value.forEach((elem) => {
            assert(elem[0] !== undefined, 'elem[0] !== undefined');
            assert(elem[1] !== undefined, 'elem[1] !== undefined');
        });
        const address = store.insert(value);
        super(value, store, true);
        this.address = address;
    }
    getEdges() {
        /**
         * make sure we never accidentally mutate the value
         */
        return this.value.map(elem => [...elem]);
    }
    printTree() {
        throw new Error("Method not implemented.");
    }
    toString() {
        return JSON.stringify(this.value);
    }
    get status() {
        return NodeStatus.Done;
    }
    isDone() {
        throw new Error("Method not implemented.");
    }
    isRejected() {
        return this.status === NodeStatus.Rejected;
    }
    isLeaf() {
        return this.value.length == 0;
    }
    addEdge(edgeType, target) {
        return new FosNode([...this.getEdges(), [edgeType, target]], this.store);
    }
    removeEdge(edgeType, target) {
        return new FosNode(this.getEdges().filter(item => item[0] == edgeType && item[1] === target), this.store);
    }
    updateEdge(oldEdgeType, oldTarget, newEdgeType, newTarget) {
        return new FosNode(this.getEdges().map(item => item[0] === oldEdgeType && item[1] === oldTarget ? [newEdgeType, newTarget] : item), this.store);
    }
    delete() {
        this.store.remove(this);
    }
    asInstruction() {
        return async (input) => {
            const edges = this.getEdges();
            const results = await Promise.all(edges.map(async ([edgeType, target]) => {
                const targetNode = this.store.getNodeByAddress(target);
                const result = await targetNode.asInstruction()(input);
                return [edgeType, result.getAddress()];
            })).catch((error) => {
                console.log('error', error);
                return this;
            });
            return new FosNode(results, this.store);
        };
    }
    merge(other) {
        // TODO: make this actually merge stuff
        console.log('merge', this.getAddress(), other.getAddress());
        const newNode = other.getEdges().reduce((acc, [edgeType, target]) => {
            return acc.addEdge(edgeType, target);
        }, this);
        return newNode;
    }
    generateTarget(data) {
        console.log('here', data);
        return this.store.create(data || []);
    }
}
