import { Fos } from '..'
import { FosNode } from '../dag-implementation/node'
import { Store } from '../dag-implementation/store'
import { FosInterpreter } from "."
import { IFosInterpreter } from "./types" 

describe('interpreter basics', () => {

  test('spawn, getStack work properly', () => {

    const store = new Store()
    const descriptionStringAddress = store.create('test1').getAddress()

    const testInterpreter = store.getInterpreter(null, null, null)
    const checkStack1 = testInterpreter.getStack()
    expect(checkStack1.length).toBe(1)

    const newNode = store.create([
      [store.nameAddress, descriptionStringAddress]
    ])

    const [newTask, newTestInt] = testInterpreter.spawn(store.getNodeByAddress(store.allOfAddress), newNode)
    expect(newTask.getStack().length).toBe(2)
    expect(newTestInt.getStack().length).toBe(1)
    expect(newTask.getName()).toBe('test1')

    const description2StringAddress = store.create('test2').getAddress()
    const newNode2 = store.create([
      [store.nameAddress, description2StringAddress]
    ])
    const [newTask2, newTestInt2] = newTestInt.spawn(store.getNodeByAddress(store.allOfAddress), newNode2)
    expect(newTask2.getStack().length).toBe(2)
    expect(newTestInt2.getStack().length).toBe(1)

    const newTaskInterpreter2 = newTestInt2.getChildren().filter(child => child.getInstruction() === store.allOfAddress && child.getTarget() === newNode2.getAddress())[0] as IFosInterpreter

    expect(newTaskInterpreter2).toBeDefined()
    expect(newTaskInterpreter2.getName()).toBe('test2')

  })


  test('can create task', () => {    
    const store = new Store()
    const interpreter = store.getRoot()
    console.log('test start', interpreter.getDisplayString())
    const [task, newInterpreter] = interpreter.createTask('B', [])
    console.log('tasks for root in test', interpreter.getDisplayString(), newInterpreter.getDisplayString(), task.getDisplayString())
    const tasks = newInterpreter.getTasks() as [IFosInterpreter, ...IFosInterpreter[]]
    console.log('tasks', tasks.map(task => task.getDisplayString()))
    expect(tasks.length).toBe(1)
    expect(tasks[0].getName()).toBe('B')
  })



  test('returns correctly and updates root when creating task', () => {
    const store = new Store()
    const interpreter = store.getInterpreter(store.voidAddress, store.unitAddress, null) as IFosInterpreter
    const [name, updatedInterpreter] = interpreter.setName('root')
    const result = updatedInterpreter.createTask('B', [])
    expect(result.length).toBe(2)
    const [task, newInterpreter] = result
    expect(newInterpreter).not.toBe(updatedInterpreter)
    
    const result2 = task.createTask('C', [])
    const root = result2[2] as IFosInterpreter
    expect(root.getName()).toBe('root')
    expect(result2[1].getName()).toBe('B')
    expect(result2[0].getName()).toBe('C')
  })

  test('can run task', () => {
    const store = new Store()
    const rootInterpreter = store.getInterpreter(store.voidAddress, store.unitAddress, null) as IFosInterpreter
    const [task, newInterpreter] = rootInterpreter.createTask('B', [])
    const [workflow, rootWithWorkflow] = newInterpreter.createWorkflow('workflow', [task])
    const [todo, rootWithTodo] = rootWithWorkflow.runTask(workflow)
    const todos = rootWithTodo.getTodos()
    expect(todos.length).toBe(1)
    const [completedTodo, rootWithCompletedTodo] = rootWithTodo.setTaskInput(todo)
    const completedTodos = rootWithTodo.getCompletedTodos()
    expect(completedTodos.length).toBe(1)


})
