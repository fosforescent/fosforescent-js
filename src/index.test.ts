
import { Fos, IFosInterpreter, INode } from '.'
import { RootFosInterpreter } from './interpreter'

describe('index interface functions properly', () => {

  test('getRoot works', () => {
    const fos = Fos()
    expect(fos).toBeDefined()
  })


  test('run instruction works', () => {
    const fos = Fos()
    const rootAddress = fos.getRootAddress()
    const transaction1 = fos.createTransaction()

    const instructionNode = transaction1.store.create((targetNode: INode) => new Promise((resolve, reject) => {
      const result = targetNode.getValue()
      if (typeof result === 'string') {
        if (result === 'testString') {
          resolve(result)
        } else {
          reject('not testString')
        }
      }
    }))

    const expression = transaction1.spawn(instructionNode, fos.store.create([]))
    const expressionRoot = expression[expression.length - 1] as RootFosInterpreter

    transaction1.commit()

    const result0 = fos.mine()
    const result1 = fos.mine()

    const transaction2 = fos.createTransaction()

    const responseNode2 = transaction2.store.create((rootNode: INode) => new Promise((resolve, reject) => resolve('testString')))

    const expression2Interpreter = transaction2.followEdge(expressionRoot.getInstruction(), expressionRoot.getTarget())
    const expression2InstructionNode = expression2Interpreter.store.getNodeByAddress(expression2Interpreter.getInstruction())

    const newExpressionStack = expression2Interpreter.mutate(expression2InstructionNode, responseNode2)
    const newExpressionRoot = newExpressionStack[newExpressionStack.length - 1] as RootFosInterpreter

    transaction2.commit()

    const result3 = fos.mine()
    const result4 = fos.mine()

    expect(newExpressionRoot.getValue()).toBe('testString')

    

  })

  // test('callback works', () => {

  //   const fos = Fos()

  //   const [newTask, newRoot] = fos.proposeUpdate('').createTask('A')
  //   const instruction = newRoot.store.getNodeByAddress(newRoot.getInstruction())
  //   const target = newRoot.store.getNodeByAddress(newRoot.getTarget())

  //   myResolve!({instruction, target})
    
  //   const finalRoot = fos.getRoot()

  //   expect(target.getAddress).not.toEqual(newRoot.getTarget())
  //   // expect(finalRoot.getTarget()).toEqual(target.getAddress())
  //   expect(finalRoot.getTasks()[0]).toBeDefined()


  // })


})
