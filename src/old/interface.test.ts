
import { Fos, IFosInterpreter, INode } from '.'
import { FosNode } from './dag-implementation/node'
import { RootFosInterpreter } from './interpreter'

import exampleData from './demo/example-doc.json'
import { getTerminalNode } from './dag-implementation/node-factory'


class TestDisplayNode extends FosNode implements INode {

  constructor (interpreter: IFosInterpreter){
    const value: [string, string][] = [
    ]
    super(value, interpreter.store)
  }

  asInstruction(): (input: INode) =>  Promise<INode> {
    return async (input: INode) => {
      console.log('input', input)
      const result = this.store.create([])
      return result
    }
  }

}

class TestInputNode extends FosNode implements INode {
  
    asInstruction(): (input: INode) => Promise<INode> {
      return async (input: INode) => {
        const result = this.store.create([])
        return result
      }
    }

}


describe('index interface functions properly', () => {

  test('getRoot works', () => {
    const fos = Fos()
    expect(fos).toBeDefined()
  })

  test('import export works', () => {
    const fos = Fos()
    const rootAddress = fos.getRootAddress()
    
    fos.import(exampleData)
    const data = fos.export()
    expect(data).toEqual(exampleData)

    expect(fos.getRootAddress()).not.toBe(rootAddress)

    expect(fos.getChildren().length).toBeGreaterThan(0)

  })


  test('run instruction works', () => {
    const fos = Fos()
    const rootAddress = fos.getRootAddress()

    const transaction1 = fos.createTransaction()
    const terminalNode = getTerminalNode(transaction1.store)

    const displayNode = new TestDisplayNode(transaction1)
    const stack00 = transaction1.addAction('test-display', displayNode) // puts on root node with void instruction?

    const displayInterpreter = transaction1.followEdgeFromAlias('test-display')
    const newStack = displayInterpreter.parseInput('testString')

    fos.commit(newStack)
    // const inputNode = transaction1.registerInstruction('input', TestInputNode)
    // const inputTarget = inputNode.generateTarget()
    // const combinedInstruction = displayNode.spawn(displayOutputProperty, inputNode)
    // const stack0 = transaction1.spawn(combinedInstruction, inputTarget)

    // ioNotify displays this during mining


    // const result0 = fos.mine()
    // const result1 = fos.mine()

    // const transaction2 = fos.createTransaction()

    // const responseNode2 = transaction2.store.create((rootNode: INode) => new Promise((resolve, reject) => resolve('testString')))

    // const expression2Interpreter = transaction2.followEdge(expressionRoot.getInstruction(), expressionRoot.getTarget())
    // const expression2InstructionNode = expression2Interpreter.store.getNodeByAddress(expression2Interpreter.getInstruction())

    // const newExpressionStack = expression2Interpreter.mutate(expression2InstructionNode, responseNode2)
    // const newExpressionRoot = newExpressionStack[newExpressionStack.length - 1] as RootFosInterpreter

    // transaction2.commit()

    // const result3 = fos.mine()
    // const result4 = fos.mine()

    // expect(newExpressionRoot.getValue()).toBe('testString')

    // expect (newExpressionRoot.getTarget()).toBe(rootAddress)
    

  })


})
