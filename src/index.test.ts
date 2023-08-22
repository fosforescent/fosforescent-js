
import { Fos, IFosInterpreter, INode } from '.'

describe('index interface functions properly', () => {

  test('getRoot works', () => {
    const fos = Fos()
    expect(fos).toBeDefined()
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
