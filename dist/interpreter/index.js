import { NodeType } from "../dag-implementation/store";
import { assert } from '../util';
// import { createTaskStateMachine, createOneOfStateMachine } from "./state-machines"
// import { Interpreter, interpret } from "xstate"
import StringClient from "../client/string-client";
import { constructAliases, getAllOfNode, getTerminalNode, getUnitNode, getNameNode } from "../dag-implementation/node-factory";
export class BaseFosInterpreter {
    store;
    instruction;
    target;
    committed = false;
    constructor(store, instruction, target) {
        /**
         * TODO
         * - if target doesn't match instruction, create new target with instruction's "blank" value (first type constructor option)
         *
         */
        this.store = store;
        this.instruction = instruction;
        this.target = target;
    }
    getInstruction() {
        return this.instruction.getAddress();
    }
    getTarget() {
        return this.target.getAddress();
    }
    isDone() {
        throw new Error("Method not implemented.");
    }
    getTargetEdges() {
        return this.target.getEdges();
    }
    getEdge(instruction, target) {
        return this.target.getEdges().find((elem) => elem[0] === instruction && elem[1] === target);
    }
    parseInput(input) {
        /**
         * - validate input,
         * create new target based on instruction's "blank" value (first type constructor option)
         *
         * , merge existing target into it
         */
        const blankTarget = this.instruction.generateTarget(input);
        console.log('blankTarget', blankTarget.getValue(), blankTarget.getAddress(), input);
        const newTarget = this.target.merge(blankTarget);
        const newStack = this.mutate(this.instruction, newTarget);
        console.log('newStack', newStack.map((elem) => elem.getDisplayString()));
        return newStack;
    }
    spawn(childInstruction, childTarget, data) {
        if (!childTarget) {
            if (data) {
                childTarget = childInstruction.generateTarget(data);
            }
            else {
                const terminalNode = getTerminalNode(this.store);
                childTarget = terminalNode;
            }
        }
        const newTarget = this.target.addEdge(childInstruction.getAddress(), childTarget.getAddress());
        const parentStack = this.mutate(this.instruction, newTarget);
        const newInterpreter = parentStack[0].followEdge(childInstruction.getAddress(), childTarget.getAddress());
        // console.log('spawn1', parentStack.map((elem) => elem.getDisplayString()), newInterpreter.getDisplayString(), childInstruction.getAddress(), childTarget.getAddress(), this.getDisplayString())
        const newStack = newInterpreter.getStack();
        const [thisInterpreter, parentInterpreter, ...rest] = newStack;
        // console.log('spawn2', newStack.map((elem) => elem.getDisplayString()), newInterpreter.getDisplayString(), parentStack.map((elem) => elem.getDisplayString()), this.getDisplayString())
        if (newStack.length > 0) {
            const matchingChild = parentInterpreter.getChildren().filter((elem) => elem.getInstruction() === thisInterpreter.getInstruction() && elem.getTarget() === thisInterpreter.getTarget());
            assert(matchingChild.length === 1, `matchingChild.length === 1 (spawn failing)`);
        }
        return newStack;
    }
    createTask(description, deps = []) {
        const terminalNode = getTerminalNode(this.store);
        const allOfNode = getAllOfNode(this.store);
        const [newTask, newThis, ...newRest] = this.spawn(allOfNode, terminalNode);
        const [_newTaskName, newTaskWithName, ..._newRestWithName] = newTask.setName(description);
        // console.log ('newTaskWithName', newTaskWithName.getDisplayString())
        const [_finalSubtask, taskWithSubtasks, ..._finalRestWithSubtasks] = deps.reduce((acc, item) => {
            const [prevSubtask, prevTaskWithSubtasks, ...prevRestWithSubtasks] = acc;
            const [nextSubtask, nextTaskWithSubtask, ...nextRestWithSubtask] = prevTaskWithSubtasks.spawn(allOfNode, item);
            // console.log('prevTaskWithSubtasks', prevTaskWithSubtasks.getDisplayString(), nextTaskWithSubtask.getDisplayString()) 
            return [nextSubtask, nextTaskWithSubtask, ...nextRestWithSubtask];
        }, [_newTaskName, newTaskWithName, ..._newRestWithName]);
        // console.log('taskWithSubtasks', taskWithSubtasks.getDisplayString(), taskWithSubtasks.getStack().map((elem) => elem.getDisplayString()))
        return taskWithSubtasks.getStack();
    }
    reorderTargetEdges(newEdges) {
        const newTaskEdgesParsed = newEdges.map((elem) => elem ? this.getEdgeFromStubString(elem) : null).filter((elem) => elem !== null);
        console.log("reorderTargetEdges", newEdges, newEdges.filter(x => x !== null).map((elem) => this.followEdgeFromStubString(elem).getDisplayString()), [...newTaskEdgesParsed], newTaskEdgesParsed);
        // let newEdgeCounter = 0
        // const newEdgesInPlace = this.target.getEdges().map((elem, index) => {
        //   if(newTaskEdgesParsed.find((newElem) => newElem[0] === elem[0] && newElem[1] === elem[1])){
        //     console.log('here', newTaskEdgesParsed[newEdgeCounter], newEdgeCounter)
        //     return newTaskEdgesParsed[newEdgeCounter++]
        //   }else{
        //     console.log('here2')
        //     return elem
        //   }
        // })
        console.log('new in place', newTaskEdgesParsed);
        const newTarget = this.store.create([...newTaskEdgesParsed]);
        console.log('new target', newTarget.getValue(), newTarget.getAddress());
        const newStack = this.mutate(this.instruction, newTarget);
        console.log('newStack', newStack.length, newStack.map((elem) => elem.getDisplayString()));
        return newStack;
    }
    setValue(value) {
        // const isExternal = this.store.checkAddress(this.target.getAddress()) === NodeType.External
        const isExternal = this.store.checkAddress(this.target.getAddress()) === NodeType.External;
        assert(isExternal, `isExternal`);
        const newTarget = this.store.create(value);
        const newStack = this.mutate(this.instruction, newTarget);
        return newStack;
    }
    getAvailableInstructions() {
        const unitNode = getUnitNode(this.store);
        const nameEdgeNode = getNameNode(this.store);
        const allOfNode = getAllOfNode(this.store);
        return [allOfNode, nameEdgeNode, unitNode];
    }
    getBlank(instruction) {
        throw new Error("Method not implemented.");
        // const terminalNode = getTerminalNode(this.store)
        // return this.spawn(instruction, terminalNode) 
    }
    removeEdge(instruction, target) {
        const newTarget = this.target.removeEdge(instruction, target);
        const newStack = this.mutate(this.instruction, newTarget);
        return newStack;
    }
    followEdge(instructionString, targetString) {
        const instruction = this.store.getNodeByAddress(instructionString);
        const target = this.store.getNodeByAddress(targetString);
        const newInterpreter = new FosInterpreter(target, instruction, this.store, this);
        return newInterpreter;
    }
    getStubString() {
        const instructionStub = `(${this.instruction.getAddress().slice(-10)})`;
        const targetStub = `${this.target.getAddress().slice(-10)}`;
        // console.log('getStubString', instructionStub, targetStub, instructionStub.length, targetStub.length)
        assert(instructionStub.length === 12, `instructionStub.length === 12`);
        assert(targetStub.length === 10, `targetStub.length === 10`);
        return `${instructionStub}${targetStub}`;
    }
    findEdgesWithTarget(target) {
        return this.target.getEdges().filter((elem) => elem[1] === target.getAddress());
    }
    formatTree(formatOpts) {
        // return this.target.formatTree({...formatOpts, current: [this.instruction.getAddress(), this.target.getAddress()]})
        return (new StringClient(this.store, this.target.getAddress(), this.instruction.getAddress())).getView({ level: 0 });
    }
    getNodeByName(name) {
        const unitNode = getUnitNode(this.store);
        const nameEdgeNode = getNameNode(this.store);
        const instructionNameNode = this.store.create(name);
        console.log('name', name);
        const instructionNodeQueryResults = this.store.queryTriple(unitNode, nameEdgeNode, instructionNameNode);
        const instructionNode = instructionNodeQueryResults[0]?.[0];
        return instructionNode;
    }
    getValue() {
        const isExternal = this.store.checkAddress(this.target.getAddress()) === NodeType.External;
        console.log("getValue", this.target.getAddress(), this.store.checkAddress(this.target.getAddress()), isExternal);
        assert(isExternal, `isExternal`);
        const value = this.store.getNodeByAddress(this.target.getAddress()).getValue();
        return value;
    }
    setName(name) {
        const nameEdgeNode = getNameNode(this.store);
        const nameAddress = nameEdgeNode.getAddress();
        const hasCurrentName = this.target.getEdges().find((elem) => elem[0] === nameAddress);
        if (hasCurrentName) {
            if (this.getName() !== name) {
                const nameNode = this.store.create(name);
                const newEdges = this.target.getEdges().map((edge) => edge[0] === nameAddress ? [edge[0], nameNode.getAddress()] : edge);
                const newTarget = this.store.create(newEdges);
                const [thisInterpreter, ...rest] = this.mutate(this.instruction, newTarget);
                const nameChildren = thisInterpreter.getChildren().filter((elem) => elem.getInstruction() === nameAddress);
                assert(nameChildren.length === 1, `nameChild`);
                const nameChild = nameChildren[0];
                return nameChild.getStack();
            }
            else {
                const nameChildren = this.getChildren().filter((elem) => elem.getInstruction() === nameAddress);
                assert(nameChildren.length === 1, `nameChild`);
                const nameChild = nameChildren[0];
                return nameChild.getStack();
            }
        }
        else {
            const nameNode = this.store.create(name);
            const newStack = this.spawn(nameEdgeNode, nameNode);
            return newStack;
        }
    }
    isName() {
        const allOfNode = getAllOfNode(this.store);
        return this.instruction.getAddress() === allOfNode.getAddress();
    }
    isTask() {
        const allOfNode = getAllOfNode(this.store);
        return this.instruction.getAddress() === allOfNode.getAddress();
    }
    getTasks() {
        const allOfNode = getAllOfNode(this.store);
        const taskInterpreters = this.getChildren().filter((elem) => elem.getInstruction() === allOfNode.getAddress());
        // console.log('taskEdges', taskInterpreters.map(x => x.getDisplayString()))
        return taskInterpreters;
    }
    getTask(name) {
        const foundTasks = this.getTasks().filter((elem) => elem.getName() === name);
        assert(foundTasks.length !== 0, `task "${name}" not found`);
        assert(foundTasks.length > 1, `multiple tasks named "${name}" not found`);
        return foundTasks[0];
    }
    getDisplayString() {
        const terminlNode = getTerminalNode(this.store);
        const helper = (node) => {
            let name;
            try {
                name = (new RootFosInterpreter(this.store, node, terminlNode)).getName();
            }
            catch {
                name = '<no name>';
                for (const [aliasName, address] of constructAliases(this.store)) {
                    if (address === node.getAddress()) {
                        name = `<alias: ${aliasName}>`;
                    }
                }
            }
            return `${name}(${node.getAddress().slice(-10)})`;
        };
        return `[${helper(this.instruction)}]${helper(this.target)}`;
    }
    getAliases() {
        const aliases = [null, null];
        for (const [aliasName, address] of constructAliases(this.store)) {
            if (address === this.target.getAddress()) {
                aliases[1] = aliasName;
            }
            if (address === this.instruction.getAddress()) {
                aliases[0] = aliasName;
            }
        }
        return aliases;
    }
    getEdgeFromStubString(stubString) {
        console.log('stubString', stubString, this.getDisplayString(), this.getChildren().map((elem) => elem.getDisplayString()));
        const re = /\(([\w]{10})\)([\w]{10})/;
        const [whole, instructionStub, targetStub] = re.exec(stubString) || [];
        console.log('getNodeFromUrlString', stubString, instructionStub, targetStub, whole);
        const edge = this.target.getEdges().filter((elem) => elem[0].slice(-10) === instructionStub && elem[1].slice(-10) === targetStub);
        console.log('edge', edge);
        assert(edge.length === 1, `not single edge node but [${edge.length}] found for ${stubString}`);
        return edge[0];
    }
    followEdgeFromStubString(stubString) {
        const [instructionStub, targetStub] = this.getEdgeFromStubString(stubString);
        return this.followEdge(instructionStub, targetStub);
    }
    getStack() {
        throw new Error("Method not implemented.");
    }
    getChildren() {
        // console.log('this target', Array.isArray(this.target), typeof this.target, this.target)
        const isExternal = this.store.checkAddress(this.target.getAddress()) === NodeType.External;
        if (isExternal) {
            return [];
        }
        // assert(!isExternal, `isExternal`)
        const edges = this.target.getEdges();
        const childInterpreters = edges.map(([instruction, child]) => {
            const newInterpreter = this.followEdge(instruction, child);
            return newInterpreter;
        });
        return childInterpreters;
    }
    getName() {
        const nameAddress = getNameNode(this.store).getAddress();
        // console.log('getNameForTarget', this.target.getAddress(), this.instruction.getAddress(), this.target, this.instruction)
        const targetNameEdges = this.getChildren().filter((elem) => elem.getInstruction() === nameAddress);
        assert(targetNameEdges.length === 1, `nameNodes.length === 1`);
        const targetNameEdge = targetNameEdges[0];
        return this.store.getNodeByAddress(targetNameEdge.getTarget()).getValue() || '';
    }
    // createWorkflow(params: {
    //   root: INode,
    //   name: string, 
    // }: {}): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]] {
    //   const [newTask, newThis, ...newRest] = this.spawn(this.store.getNodeByAddress(this.store.allOfAddress), this.store.getNodeByAddress(this.store.voidAddress)) as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
    //   const [_newTaskName, newTaskWithName, ..._newRestWithName] = newTask.setName(description)
    //   // console.log ('newTaskWithName', newTaskWithName.getDisplayString())
    //   const [_finalSubtask, taskWithSubtasks, ..._finalRestWithSubtasks] = deps.reduce((acc, item) => {
    //     const [prevSubtask, prevTaskWithSubtasks, ...prevRestWithSubtasks] = acc as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
    //     const [nextSubtask, nextTaskWithSubtask, ...nextRestWithSubtask] = prevTaskWithSubtasks.spawn(this.store.getNodeByAddress(this.store.allOfAddress), item)
    //     // console.log('prevTaskWithSubtasks', prevTaskWithSubtasks.getDisplayString(), nextTaskWithSubtask.getDisplayString()) 
    //     return [nextSubtask, nextTaskWithSubtask, ...nextRestWithSubtask]
    //   }, [_newTaskName, newTaskWithName, ..._newRestWithName]) as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
    //   console.log('taskWithSubtasks', taskWithSubtasks.getDisplayString(), taskWithSubtasks.getStack().map((elem) => elem.getDisplayString()))
    //   return taskWithSubtasks.getStack() as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
    // }
    mutate(instruction, target) {
        throw new Error("Method not implemented.");
    }
    getActions() {
        throw new Error("Method not implemented.");
    }
    getAction(alias) {
        throw new Error("Method not implemented.");
    }
    followEdgeFromAlias(alias) {
        throw new Error("Method not implemented.");
    }
    spawnFromAlias(alias) {
        throw new Error("Method not implemented.");
    }
    addAction(alias, instruction) {
        throw new Error("Method not implemented.");
    }
}
export class RootFosInterpreter extends BaseFosInterpreter {
    store;
    target;
    currentPath = [];
    history = [];
    committed = false;
    constructor(store, instruction = store.create([]), target = store.create([])) {
        super(store, instruction, target);
        this.store = store;
        this.target = target;
    }
    mutate(newInstruction, newTarget) {
        const newInterpreter = new RootFosInterpreter(this.store, newInstruction, newTarget);
        return [newInterpreter];
    }
    commit() {
        this.committed = true;
    }
    getStack() {
        return [this];
    }
}
export class FosInterpreter extends BaseFosInterpreter {
    target;
    instruction;
    store;
    parent;
    // oneOfActor: Interpreter<NodeStatus, NodeStateSchema, NodeEvents>
    // taskActor: Interpreter<NodeStatus, NodeStateSchema, NodeEvents>
    constructor(target, instruction, store, parent) {
        // TODO: figure out why this line causes infinite recursion & clean up --- console.log('FosInterpreter', target.getAddress(), instruction.getAddress(), this.getDisplayString())
        if (Array.isArray(target)) {
            console.log('target is array', target);
            throw new Error('target is array');
        }
        super(store, target, instruction);
        this.target = target;
        this.instruction = instruction;
        this.store = store;
        this.parent = parent;
    }
    getStack() {
        const stack = [this, ...this.parent.getStack()];
        // console.log('got stack', stack.map((elem) => elem.getDisplayString()))
        const [thisInterpreter, parentInterpreter, ...rest] = stack;
        const matchingChild = parentInterpreter.getChildren().filter((elem) => elem.getInstruction() === thisInterpreter.getInstruction() && elem.getTarget() === thisInterpreter.getTarget());
        // console.log('matchingChildren', stack[stack.length - 1].getChildren().map(x => x.getDisplayString()))
        assert(matchingChild.length === 1, `matchingChild.length === 1 (get stack failing)`);
        return stack;
    }
    mutate(newInstruction, newTarget) {
        // console.log('mutate', newInstruction.getAddress(), newTarget.getAddress(), this.getDisplayString())
        // console.log('this parent', typeof this.parent, this.parent)
        const newParentEdges = this.store.getNodeByAddress(this.parent.getTarget()).getEdges().map((elem) => elem[0] === this.instruction.getAddress() && elem[1] === this.target.getAddress() ? [newInstruction.getAddress(), newTarget.getAddress()] : elem);
        const newParentTarget = this.store.create(newParentEdges);
        const newParent = this.parent.mutate(this.store.getNodeByAddress(this.parent.getInstruction()), newParentTarget)[0];
        const newInterpreter = new FosInterpreter(newTarget, newInstruction, this.store, newParent);
        const stack = newInterpreter.getStack();
        const [thisInterpreter, parentInterpreter, ...rest] = stack;
        const matchingChild = parentInterpreter.getChildren().filter((elem) => elem.getInstruction() === thisInterpreter.getInstruction() && elem.getTarget() === thisInterpreter.getTarget());
        assert(matchingChild.length === 1, `matchingChild.length === 1 (mutate failing)`);
        return stack;
    }
}
