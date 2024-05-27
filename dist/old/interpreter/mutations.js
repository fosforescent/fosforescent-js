import { getAllOfNode, getTerminalNode } from "../dag-implementation/node-factory";
export const createTask = (store, transaction, description, deps = []) => {
    const allOfNode = getAllOfNode(store);
    const voidNode = getTerminalNode(store);
    const [newTask, newThis, ...newRest] = transaction.spawn(allOfNode, voidNode);
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
};
