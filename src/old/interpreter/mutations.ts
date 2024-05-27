import { getIdNode, getNothingNode, getAllOfNode, getTerminalNode } from "../dag-implementation/node-factory";
import { IFosInterpreter, IStore, INode } from "..";

    


export const createTask = (store: IStore, transaction: IFosInterpreter, description: string, deps: INode[] = [] ): [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]  => {
  const allOfNode = getAllOfNode(store)
  const voidNode = getTerminalNode(store)

  const [newTask, newThis, ...newRest] = transaction.spawn(allOfNode, voidNode) as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
  const [_newTaskName, newTaskWithName, ..._newRestWithName] = newTask.setName(description)
    
  // console.log ('newTaskWithName', newTaskWithName.getDisplayString())
  const [_finalSubtask, taskWithSubtasks, ..._finalRestWithSubtasks] = deps.reduce((acc, item) => {
    const [prevSubtask, prevTaskWithSubtasks, ...prevRestWithSubtasks] = acc as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]
    const [nextSubtask, nextTaskWithSubtask, ...nextRestWithSubtask] = prevTaskWithSubtasks.spawn(allOfNode, item)
    // console.log('prevTaskWithSubtasks', prevTaskWithSubtasks.getDisplayString(), nextTaskWithSubtask.getDisplayString()) 
    return [nextSubtask, nextTaskWithSubtask, ...nextRestWithSubtask]

  }, [_newTaskName, newTaskWithName, ..._newRestWithName]) as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]

  // console.log('taskWithSubtasks', taskWithSubtasks.getDisplayString(), taskWithSubtasks.getStack().map((elem) => elem.getDisplayString()))


return taskWithSubtasks.getStack() as [IFosInterpreter, IFosInterpreter, ...IFosInterpreter[]]

}

